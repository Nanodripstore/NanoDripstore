import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { StatusCodes } from 'http-status-codes';
import { paymentRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting for payment endpoints
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
    const { amount, currency = 'INR', metadata } = body;

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, {
        status: StatusCodes.BAD_REQUEST
      });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(amount, currency);

    // Log order creation for debugging
    console.log('✅ Razorpay order created:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      userEmail: session.user.email,
      metadata
    });

    // Additional debug info (removed sensitive environment variables for security)

    return Response.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    }, {
      status: StatusCodes.CREATED
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return Response.json({ 
      error: 'Failed to create payment order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}
