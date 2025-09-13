import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { StatusCodes } from 'http-status-codes';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, {
        status: StatusCodes.UNAUTHORIZED
      });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return Response.json({ error: 'Order ID required' }, {
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

    // Find order by order number (Razorpay order ID)
    const order = await db.orders.findFirst({
      where: {
        AND: [
          { userId: user.id },
          { orderNumber: orderId }
        ]
      }
    });

    if (!order) {
      return Response.json({ error: 'Order not found' }, {
        status: StatusCodes.NOT_FOUND
      });
    }

    return Response.json({
      orderId: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });

  } catch (error) {
    console.error('Error checking order status:', error);
    return Response.json({ 
      error: 'Failed to check order status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}