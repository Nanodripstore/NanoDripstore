import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

// Using dynamic route segments: [cartItemId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const cartItemId = params.cartItemId
    const { quantity } = await req.json()

    if (quantity === undefined || quantity < 1) {
      return new NextResponse(JSON.stringify({ error: 'Valid quantity is required' }), {
        status: StatusCodes.BAD_REQUEST,
        headers: { 'Content-Type': 'application/json' }
      })
    }

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
      return new NextResponse(JSON.stringify({ error: 'Cart item not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (cartItem.userId !== user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized to update this item' }), {
        status: StatusCodes.FORBIDDEN,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify item exists
    if (!cartItem.products) {
      return new NextResponse(JSON.stringify({ 
        error: 'Product not available'
      }), {
        status: StatusCodes.BAD_REQUEST,
        headers: { 'Content-Type': 'application/json' }
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

    return NextResponse.json(updatedCartItem)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const cartItemId = params.cartItemId

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

    // Check if cart item exists and belongs to the user
    const cartItem = await db.cart_items.findUnique({
      where: { id: cartItemId }
    })

    if (!cartItem) {
      return new NextResponse(JSON.stringify({ error: 'Cart item not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (cartItem.userId !== user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized to remove this item' }), {
        status: StatusCodes.FORBIDDEN,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Delete the cart item
    await db.cart_items.delete({
      where: { id: cartItemId }
    })

    return new NextResponse(JSON.stringify({ message: 'Cart item removed successfully' }), {
      status: StatusCodes.OK,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
