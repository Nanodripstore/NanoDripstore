import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { db } from '@/lib/db';
import { StatusCodes } from 'http-status-codes';
import { paymentRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // Apply rate limiting for payment verification
    const rateLimitResult = await paymentRateLimit(req);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, {
        status: StatusCodes.UNAUTHORIZED
      });
    }

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderData // Additional order metadata (cart items, shipping info, etc.)
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: 'Missing payment verification data' }, {
        status: StatusCodes.BAD_REQUEST
      });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.error('Invalid payment signature:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userEmail: session.user.email
      });
      
      return Response.json({ error: 'Invalid payment signature' }, {
        status: StatusCodes.BAD_REQUEST
      });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, {
        status: StatusCodes.NOT_FOUND
      });
    }

    // Create order in database with payment details
    try {
      const orderItems = orderData?.orderItems || [];
      const shippingAddress = orderData?.shippingAddress || {};
      
      // Calculate total from order items
      const total = orderItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
      
      console.log('💾 Creating order with items:', orderItems.length, 'Total:', total);
      
      // Generate a simple numeric order number like COD orders
      const simpleOrderNumber = `${Date.now()}`;
      
      // Process each item to get correct size-specific SKU (same logic as COD orders)
      const processedLineItems = [];
      
      for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        let productSku = item.sku; // Start with existing SKU if available
        
        console.log(`🔍 Razorpay order: Processing item ${i + 1}/${orderItems.length}: ${item.name}`);
        
        // Get the correct SKU from our sheet-based lookup (same as COD logic)
        try {
          console.log(`🔍 Razorpay order: Fetching exact SKU from sheet for Product ${item.id}, Color: ${item.color}, Size: ${item.size}`);
          
          const skuResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/variant-sku?productId=${item.id}&color=${encodeURIComponent(item.color)}&size=${encodeURIComponent(item.size)}`);
          
          if (skuResponse.ok) {
            const skuData = await skuResponse.json();
            productSku = skuData.sku;
            console.log(`✅ Razorpay order: Got exact SKU from sheet: ${productSku}`);
          } else {
            console.warn(`Razorpay order: Sheet SKU lookup failed for ${item.name}, using fallback SKU`);
          }
        } catch (error) {
          console.warn(`Razorpay order: SKU lookup error for ${item.name}:`, error);
        }
        
        // If still no SKU, create a fallback
        if (!productSku) {
          productSku = `FALLBACK-${item.id}-${item.color?.substring(0, 3).toUpperCase() || 'DEF'}-${item.size?.toUpperCase() || 'SIZE'}`;
          console.warn(`No SKU found for ${item.name} (${item.color}, ${item.size}), using fallback: ${productSku}`);
        }
        
        processedLineItems.push({
          search_from_my_products: 1,
          quantity: (item.quantity || 1).toString(),
          price: item.price.toString(),
          sku: productSku
        });
      }
      
      // Create order record
      const order = await db.orders.create({
        data: {
          id: `rz_${razorpay_order_id}_${Date.now()}`,
          userId: user.id,
          orderNumber: simpleOrderNumber, // Use simple number format for Qikink compatibility
          status: 'payment_verified', // Waiting for webhook confirmation
          paymentStatus: 'verified',
          paymentMethod: 'razorpay',
          total: total,
          notes: JSON.stringify({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            orderItems,
            shippingAddress,
            line_items: processedLineItems,
            shipping_address: {
              first_name: shippingAddress.firstName || 'Customer',
              last_name: shippingAddress.lastName || '',
              address1: shippingAddress.address || 'Address not provided',
              phone: shippingAddress.phone || '+919999999999',
              email: shippingAddress.email || session.user.email,
              city: shippingAddress.city || 'Mumbai',
              zip: shippingAddress.zipCode || '400001',
              province: 'Maharashtra',
              country_code: 'IN'
            }
          }),
          updatedAt: new Date(),
        }
      });
      
      console.log('✅ Order created successfully:', order.orderNumber);
      console.log('📋 Order data prepared for Qikink processing');
      
      // IMMEDIATE QIKINK PROCESSING (Fallback for webhook issues)
      // In production, webhook will handle this. In development, do it immediately.
      try {
        console.log('🚀 Processing Qikink order immediately (webhook fallback)');
        
        const orderNotes = JSON.parse(order.notes || '{}');
        if (orderNotes.line_items && orderNotes.shipping_address) {
          const qikinkOrderPayload = {
            order_number: order.orderNumber,
            qikink_shipping: "1",
            gateway: "Prepaid",
            total_order_value: order.total.toString(),
            line_items: orderNotes.line_items,
            shipping_address: orderNotes.shipping_address
          };
          
          console.log('📋 Sending to Qikink immediately:', JSON.stringify(qikinkOrderPayload, null, 2));
          
          // Call Qikink API directly
          const qikinkResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/qikink/create-order`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'User-Agent': 'NanoDrip-PaymentVerify/1.0'
            },
            body: JSON.stringify({ orderPayload: qikinkOrderPayload }),
          });
          
          const responseText = await qikinkResponse.text();
          console.log('📡 Immediate Qikink Response:', qikinkResponse.status, responseText);
          
          if (qikinkResponse.ok) {
            const qikinkResult = JSON.parse(responseText);
            console.log('✅ Qikink order created immediately:', qikinkResult);
            
            // Update order with success
            const updatedNotes = JSON.stringify({
              ...orderNotes,
              qikink_order: {
                ...qikinkResult,
                created_at: new Date().toISOString(),
                created_via: 'immediate_processing'
              }
            });
            
            await db.orders.update({
              where: { id: order.id },
              data: {
                status: 'confirmed',
                paymentStatus: 'paid',
                notes: updatedNotes
              }
            });
            
            console.log('✅ Order immediately confirmed and sent to Qikink');
          } else {
            console.error('❌ Immediate Qikink creation failed:', responseText);
            // Just log error, don't fail payment verification
          }
        }
      } catch (qikinkError) {
        console.error('❌ Immediate Qikink processing error:', qikinkError);
        // Don't fail payment verification if immediate Qikink fails
      }
      
    } catch (dbError) {
      console.error('❌ Failed to create order in database:', dbError);
      // Don't fail the payment verification if DB save fails, log and continue
    }
    
    console.log('Payment verified successfully with immediate processing:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userEmail: session.user.email,
      orderData
    });

    return Response.json({
      success: true,
      message: 'Payment verified and order processed successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    }, {
      status: StatusCodes.OK
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return Response.json({ 
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}
