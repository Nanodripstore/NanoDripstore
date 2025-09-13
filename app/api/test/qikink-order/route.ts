import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    
    if (!orderId) {
      return Response.json({ error: 'Order ID required' }, { status: 400 });
    }

    console.log('🧪 Testing Qikink order creation for order:', orderId);

    // Find the order - try both COD format (orderNumber) and Razorpay format (in notes)
    const order = await db.orders.findFirst({
      where: {
        OR: [
          { orderNumber: orderId }, // For COD orders
          { 
            AND: [
              { paymentMethod: 'razorpay' },
              { notes: { contains: orderId } }
            ]
          } // For Razorpay orders
        ]
      }
    });

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('📋 Found order:', order.orderNumber, 'Status:', order.status);

    // Try to create Qikink order
    try {
      const orderNotes = order.notes ? JSON.parse(order.notes) : {};
      console.log('📦 Order notes keys:', Object.keys(orderNotes));
      
      if (orderNotes.line_items && orderNotes.shipping_address) {
        const qikinkOrderPayload = {
          order_number: order.orderNumber, // Use the simple numeric order number directly
          qikink_shipping: "1",
          gateway: order.paymentMethod === 'razorpay' ? "Prepaid" : "COD", // Dynamic gateway based on payment method
          total_order_value: order.total.toString(),
          line_items: orderNotes.line_items,
          shipping_address: orderNotes.shipping_address
        };
        
        console.log('🚀 Test Qikink payload:', JSON.stringify(qikinkOrderPayload, null, 2));
        
        // Call Qikink API
        const qikinkResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/qikink/create-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'NanoDrip-Test/1.0'
          },
          body: JSON.stringify({ orderPayload: qikinkOrderPayload }),
        });
        
        const responseText = await qikinkResponse.text();
        console.log('📄 Test Qikink response status:', qikinkResponse.status);
        console.log('📄 Test Qikink response:', responseText);
        
        if (qikinkResponse.ok) {
          const qikinkResult = JSON.parse(responseText);
          return Response.json({
            success: true,
            message: 'Qikink order created successfully',
            order: order.orderNumber,
            qikinkResult
          });
        } else {
          return Response.json({
            success: false,
            message: 'Qikink order creation failed',
            order: order.orderNumber,
            error: responseText,
            status: qikinkResponse.status
          });
        }
      } else {
        return Response.json({
          success: false,
          message: 'Missing required order data',
          order: order.orderNumber,
          availableKeys: Object.keys(orderNotes)
        });
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      return Response.json({
        success: false,
        message: 'Test failed with error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}