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
      orderBy: { createdAt: 'desc' }
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

    const { productId, name, price, image, type, category } = await req.json()
    
    if (!productId || !name || price === undefined || price === null || !image) {
      return Response.json({ error: 'Product data is required (productId, name, price, image)' }, { status: StatusCodes.BAD_REQUEST })
    }

    // Convert productId to number since the database expects an integer
    const productIdInt = parseInt(productId)
    
    if (isNaN(productIdInt)) {
      return Response.json({ error: 'Invalid product ID' }, { status: StatusCodes.BAD_REQUEST })
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

    // Check if item is already in the wishlist
    const existingItem = await db.wishlist_items.findFirst({
      where: {
        userId: user.id,
        productId: productIdInt
      }
    })

    if (existingItem) {
      return Response.json({ error: 'Product already in wishlist' }, { status: StatusCodes.CONFLICT })
    }

    // Add item to wishlist with product data stored directly
    const wishlistItem = await db.wishlist_items.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        productId: productIdInt,
        name: name,
        price: parseFloat(price),
        image: image,
        type: type || 'tshirt',
        category: category || null
      }
    })

    return Response.json(wishlistItem, { status: StatusCodes.CREATED })
  } catch (error) {
    console.error('Error adding item to wishlist:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
