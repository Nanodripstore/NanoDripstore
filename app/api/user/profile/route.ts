import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        addresses: true,
        cart_items: {
          include: {
            products: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        wishlist_items: {
          include: {
            products: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        orders: {
          include: {
            order_items: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format the response to match the expected structure
    const formattedResponse = {
      id: user.id,
      name: user.name,
      email: user.email || '',
      phone: user.phone,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      addresses: user.addresses,
      cart: user.cart_items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size,
        image: item.image,
        quantity: item.quantity
      })),
      cartCount: user.cart_items.length,
      wishlist: user.wishlist_items.map(item => ({
        id: item.id,
        name: item.products.name,
        price: item.products.price,
        image: item.products.images[0] || ''
      })),
      wishlistCount: user.wishlist_items.length,
      orders: user.orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString()
      }))
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    const { name, phone } = data;

    // Check if the name is already taken by another user
    if (name && name !== user.name) {
      const existingUser = await db.user.findUnique({
        where: { name }
      });
      
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined
      }
    });

    // Don't return the password
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
