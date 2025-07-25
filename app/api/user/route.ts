import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fast initial load - just basic user info
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // If user doesn't exist, create them
    if (!user) {
      console.log("Creating new user:", session.user.email)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }
      })
    }

    // Get related data separately for better performance
    const [addresses, cartCount, wishlistCount, recentOrders] = await Promise.all([
      prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { isDefault: 'desc' }
      }),
      prisma.cartItem.count({
        where: { userId: user.id }
      }),
      prisma.wishlistItem.count({
        where: { userId: user.id }
      }),
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Get cart items only when needed (first 10 for activity display)
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      ...user,
      addresses,
      cart: cartItems,
      cartCount,
      wishlist: [], // Load separately if needed
      wishlistCount,
      orders: recentOrders
    })
  } catch (error) {
    console.error('Error fetching/creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const data = await request.json()
    const { name, phone } = data

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
