import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, {
        status: StatusCodes.UNAUTHORIZED
      })
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

    const cartItems = await db.cart_items.findMany({
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

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.products.price * item.quantity)
    }, 0)

    return Response.json({
      items: cartItems,
      subtotal,
      count: cartItems.length
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const { productId, quantity, size, color, variantId, sku } = await req.json()
    
    if (!productId || quantity === undefined) {
      return Response.json({ error: 'Product ID and quantity are required' }, { status: StatusCodes.BAD_REQUEST })
    }

    if (quantity < 1) {
      return Response.json({ error: 'Quantity must be at least 1' }, { status: StatusCodes.BAD_REQUEST })
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

    // Check if item is already in the cart
    const existingCartItem = await db.cart_items.findFirst({
      where: {
        userId: user.id,
        productId,
        ...(size && { size }),
        ...(color && { color }),
        ...(variantId && { variantId })
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update the quantity if item exists
      cartItem = await db.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
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
    } else {
      // Generate unique ID for new cart item
      const uniqueId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Get detailed product info
      const productDetails = await db.products.findUnique({
        where: { id: productId },
        select: {
          name: true,
          price: true,
          images: true
        }
      })
      
      if (!productDetails) {
        return Response.json({ error: 'Product details not found' }, { status: StatusCodes.NOT_FOUND })
      }
      
      // Add new item to cart
      cartItem = await db.cart_items.create({
        data: {
          id: uniqueId,
          userId: user.id,
          productId: productId,
          quantity,
          name: productDetails.name || 'Unknown Product',
          price: productDetails.price || 0,
          image: productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : '',
          type: 'tshirt', // Default type
          size: size || '',
          color: color || '',
          variantId: variantId ? parseInt(variantId.toString()) : null,
          sku: sku || null,
          updatedAt: new Date()
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
    }

    return Response.json(cartItem, { 
      status: existingCartItem ? StatusCodes.OK : StatusCodes.CREATED 
    })
  } catch (error) {
    console.error('Error adding item to cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const { productId, quantity, size, color, variantId, sku } = await req.json()
    
    if (!productId || quantity === undefined) {
      return Response.json({ error: 'Product ID and quantity are required' }, { status: StatusCodes.BAD_REQUEST })
    }

    if (quantity < 1) {
      return Response.json({ error: 'Quantity must be at least 1' }, { status: StatusCodes.BAD_REQUEST })
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

    // Find the cart item to update or create
    const existingCartItem = await db.cart_items.findFirst({
      where: {
        userId: user.id,
        productId,
        size: size || '',
        color: color || ''
        // Removed variantId check since we're setting it to null for sheet-based products
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update the quantity if item exists
      cartItem = await db.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity // Set exact quantity, not adding
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
    } else {
      // Generate unique ID for new cart item
      const uniqueId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Get detailed product info
      const productDetails = await db.products.findUnique({
        where: { id: productId },
        select: {
          name: true,
          price: true,
          images: true
        }
      })
      
      if (!productDetails) {
        return Response.json({ error: 'Product details not found' }, { status: StatusCodes.NOT_FOUND })
      }
      
      // Add new item to cart with the required fields
      cartItem = await db.cart_items.create({
        data: {
          id: uniqueId,
          userId: user.id,
          productId: productId,
          quantity,
          name: productDetails.name || 'Unknown Product',
          price: productDetails.price || 0,
          image: productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : '',
          type: 'tshirt', // Default type
          size: size || '',
          color: color || '',
          variantId: null, // Set to null for sheet-based products to avoid foreign key constraint
          sku: sku || null,
          updatedAt: new Date()
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
    }

    return Response.json(cartItem, { 
      status: existingCartItem ? StatusCodes.OK : StatusCodes.CREATED 
    })
  } catch (error) {
    console.error('Error updating item in cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function DELETE(req: Request) {
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

    // Check if a specific cart item ID was provided in the URL query
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (id) {
      // Delete specific cart item by ID
      await db.cart_items.delete({
        where: {
          id: id,
          userId: user.id
        }
      })
      
      return Response.json({ message: 'Cart item removed successfully' }, { status: StatusCodes.OK })
    } else {
      // Check if product details are provided in the request body
      try {
        const body = await req.json()
        const { productId, color, size } = body

        if (productId) {
          // Delete specific cart item by product details
          const whereClause: any = {
            userId: user.id,
            productId: productId
          }
          
          if (color) whereClause.color = color
          if (size) whereClause.size = size
          // Removed variantId check since we're setting it to null for sheet-based products

          const deletedItems = await db.cart_items.deleteMany({
            where: whereClause
          })

          return Response.json({ 
            message: 'Cart item removed successfully',
            deletedCount: deletedItems.count 
          }, { status: StatusCodes.OK })
        }
      } catch (error) {
        // If body parsing fails, fall back to clearing all items
        console.log('No specific item details provided, clearing all cart items')
      }

      // Clear all cart items for the user
      await db.cart_items.deleteMany({
        where: { userId: user.id }
      })

      return Response.json({ message: 'Cart cleared successfully' }, { status: StatusCodes.OK })
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
