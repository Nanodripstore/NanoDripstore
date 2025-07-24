import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = await request.json()
    const { productId, name, price, color, size, image, type, quantity } = data

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        color,
        size
      }
    })

    if (existingItem) {
      // Update to exact quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity }
      })
      return NextResponse.json(updatedItem)
    } else {
      // Create new cart item with exact quantity
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          name,
          price,
          color,
          size,
          image,
          type,
          quantity,
        }
      })
      return NextResponse.json(cartItem)
    }
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = await request.json()
    const { productId, name, price, color, size, image, type, quantity = 1 } = data

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        color,
        size
      }
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
      return NextResponse.json(updatedItem)
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          name,
          price,
          color,
          size,
          image,
          type,
          quantity,
        }
      })
      return NextResponse.json(cartItem)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
        userId: user.id // Ensure user can only delete their own items
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
