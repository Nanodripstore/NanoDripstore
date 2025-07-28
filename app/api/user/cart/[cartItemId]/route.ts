import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

// Using dynamic route segments: [cartItemId]
export async function PATCH(
  req: Request,
  context: { params: { cartItemId: string } }
) {
  try {
    const cartItemId = context.params.cartItemId
    const { quantity } = await req.json()

    if (quantity === undefined || quantity < 1) {
      return Response.json({ error: 'Valid quantity is required' }, {
        status: StatusCodes.BAD_REQUEST
      })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Check if cart item exists and belongs to the user
    const cartItem = await db.cart_items.findUnique({
      where: { id: cartItemId },
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

    if (!cartItem) {
      return Response.json({ error: 'Cart item not found' }, { status: StatusCodes.NOT_FOUND })
    }

    if (cartItem.userId !== user.id) {
      return Response.json({ error: 'Not authorized to update this item' }, { status: StatusCodes.FORBIDDEN })
    }

    // Verify item exists
    if (!cartItem.products) {
      return Response.json({ 
        error: 'Product not available'
      }, {
        status: StatusCodes.BAD_REQUEST
      })
    }

    // Update the cart item
    const updatedCartItem = await db.cart_items.update({
      where: { id: cartItemId },
      data: { quantity },
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

    return Response.json(updatedCartItem)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function DELETE(
  req: Request,
  context: { params: { cartItemId: string } }
) {
  try {
    const cartItemId = context.params.cartItemId

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Check if cart item exists and belongs to the user
    const cartItem = await db.cart_items.findUnique({
      where: { id: cartItemId }
    })

    if (!cartItem) {
      return Response.json({ error: 'Cart item not found' }, { status: StatusCodes.NOT_FOUND })
    }

    if (cartItem.userId !== user.id) {
      return Response.json({ error: 'Not authorized to remove this item' }, { status: StatusCodes.FORBIDDEN })
    }

    // Delete the cart item
    await db.cart_items.delete({
      where: { id: cartItemId }
    })

    return Response.json({ message: 'Cart item removed successfully' }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
