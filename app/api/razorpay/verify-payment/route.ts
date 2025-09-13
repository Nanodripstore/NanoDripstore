import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { db } from '@/lib/db';
import { StatusCodes } from 'http-status-codes';
import { paymentRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
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
            line_items: orderItems.map((item: any) => ({
              search_from_my_products: 1,
              quantity: (item.quantity || 1).toString(),
              price: item.price.toString(),
              sku: item.sku || `SKU-${item.id}-${item.color?.substring(0,3).toUpperCase() || 'DEF'}`
            })),
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
      
    } catch (dbError) {
      console.error('❌ Failed to create order in database:', dbError);
      // Don't fail the payment verification if DB save fails, log and continue
    }
    
    console.log('Payment verified successfully:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userEmail: session.user.email,
      orderData
    });

    return Response.json({
      success: true,
      message: 'Payment verified successfully',
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
