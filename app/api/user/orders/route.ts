import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: StatusCodes.UNAUTHORIZED,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const orders = await db.orders.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                name: true,
                description: true,
                images: true  // Changed from imageUrl to images which is an array in your schema
              }
            }
          }
        }
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
