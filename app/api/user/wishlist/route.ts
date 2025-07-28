import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  try {
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

    return Response.json(wishlist)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const { productId } = await req.json()
    
    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: StatusCodes.BAD_REQUEST })
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

    // Check if product exists
    const product = await db.products.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Check if item is already in the wishlist
    const existingItem = await db.wishlist_items.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (existingItem) {
      return Response.json({ error: 'Product already in wishlist' }, { status: StatusCodes.CONFLICT })
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

    return Response.json(wishlistItem, { status: StatusCodes.CREATED })
  } catch (error) {
    console.error('Error adding item to wishlist:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
