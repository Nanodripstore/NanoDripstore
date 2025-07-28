import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'
import { randomUUID } from 'crypto'

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

    const wishlist = await db.wishlist_items.findMany({
      where: { userId: user.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: StatusCodes.UNAUTHORIZED,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { productId } = await req.json()
    
    if (!productId) {
      return new NextResponse(JSON.stringify({ error: 'Product ID is required' }), {
        status: StatusCodes.BAD_REQUEST,
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

    // Check if product exists
    const product = await db.products.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return new NextResponse(JSON.stringify({ error: 'Product not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if item is already in the wishlist
    const existingItem = await db.wishlist_items.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (existingItem) {
      return new NextResponse(JSON.stringify({ error: 'Product already in wishlist' }), {
        status: StatusCodes.CONFLICT,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Add item to wishlist
    const wishlistItem = await db.wishlist_items.create({
      data: {
        id: randomUUID(),
        users: {
          connect: { id: user.id }
        },
        products: {
          connect: { id: productId }
        }
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json(wishlistItem, { status: StatusCodes.CREATED })
  } catch (error) {
    console.error('Error adding item to wishlist:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
