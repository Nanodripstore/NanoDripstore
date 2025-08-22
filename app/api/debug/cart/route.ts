import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ 
        error: 'Not authenticated',
        session: null 
      })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })

    if (!user) {
      return Response.json({ 
        error: 'User not found',
        userEmail: session.user.email 
      })
    }

    const cartItems = await db.cart_items.findMany({
      where: { userId: user.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true
          }
        }
      }
    })

    return Response.json({
      user: {
        id: user.id,
        email: user.email
      },
      cartItems: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        quantityType: typeof item.quantity,
        color: item.color,
        size: item.size,
        productName: item.products?.name,
        productPrice: item.products?.price
      })),
      totalItems: cartItems.length
    })
  } catch (error) {
    console.error('Debug cart error:', error)
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
