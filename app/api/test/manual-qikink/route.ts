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

    console.log('🧪 Manual webhook test started by:', session.user.email);

    // Get the most recent Razorpay order for this user
    const recentOrder = await db.orders.findFirst({
      where: {
        AND: [
          { 
            users: { email: session.user.email }
          },
          { paymentMethod: 'razorpay' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!recentOrder) {
      return Response.json({ error: 'No Razorpay orders found for this user' }, { status: 404 });
    }

    console.log('📋 Found recent order:', recentOrder.orderNumber, 'Status:', recentOrder.status);

    // Try to create Qikink order
    try {
      const orderNotes = recentOrder.notes ? JSON.parse(recentOrder.notes) : {};
      console.log('📦 Order notes keys:', Object.keys(orderNotes));
      
      if (orderNotes.line_items && orderNotes.shipping_address) {
        const qikinkOrderPayload = {
          order_number: recentOrder.orderNumber,
          qikink_shipping: "1",
          gateway: "Prepaid",
          total_order_value: recentOrder.total.toString(),
          line_items: orderNotes.line_items,
          shipping_address: orderNotes.shipping_address
        };
        
        console.log('🚀 Manual Qikink payload:', JSON.stringify(qikinkOrderPayload, null, 2));
        
        // Call Qikink API
        const qikinkResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/qikink/create-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'NanoDrip-Manual-Test/1.0'
          },
          body: JSON.stringify({ orderPayload: qikinkOrderPayload }),
        });
        
        const responseText = await qikinkResponse.text();
        console.log('📄 Manual Qikink response status:', qikinkResponse.status);
        console.log('📄 Manual Qikink response:', responseText);
        
        if (qikinkResponse.ok) {
          const qikinkResult = JSON.parse(responseText);
          
          // Update order status
          await db.orders.update({
            where: { id: recentOrder.id },
            data: {
              status: 'confirmed_manual',
              notes: `${recentOrder.notes}\n\nManual Qikink order created: ${JSON.stringify(qikinkResult)} at ${new Date().toISOString()}`
            }
          });
          
          return Response.json({
            success: true,
            message: 'Qikink order created manually',
            orderNumber: recentOrder.orderNumber,
            qikinkResult
          });
        } else {
          return Response.json({
            success: false,
            message: 'Qikink order creation failed',
            orderNumber: recentOrder.orderNumber,
            error: responseText,
            status: qikinkResponse.status
          });
        }
      } else {
        return Response.json({
          success: false,
          message: 'Missing required order data for Qikink',
          orderNumber: recentOrder.orderNumber,
          availableKeys: Object.keys(orderNotes),
          orderNotes: orderNotes
        });
      }
    } catch (error) {
      console.error('❌ Manual test error:', error);
      return Response.json({
        success: false,
        message: 'Manual test failed with error',
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