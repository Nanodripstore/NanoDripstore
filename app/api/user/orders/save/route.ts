import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const { qikinkOrderData } = await req.json()
    
    if (!qikinkOrderData) {
      return Response.json({ error: 'Order data is required' }, { status: StatusCodes.BAD_REQUEST })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Save the order to local database
    const order = await db.orders.create({
      data: {
        id: `qk_${qikinkOrderData.order_number || Date.now()}`,
        userId: user.id,
        orderNumber: qikinkOrderData.order_number || `ORD_${Date.now()}`,
        status: qikinkOrderData.status || 'pending',
        total: parseFloat(qikinkOrderData.total_order_value || '0'),
        notes: JSON.stringify(qikinkOrderData), // Store the full Qikink response as JSON in notes field
        updatedAt: new Date(),
      }
    })

    return Response.json({ 
      success: true, 
      orderId: order.id,
      message: 'Order saved successfully'
    })
  } catch (error) {
    console.error('Error saving order:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
