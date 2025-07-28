import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// Add a new address
export async function POST(request: NextRequest) {
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
    const { name, street, city, state, zipCode, country, isDefault } = data;

    // Validate required fields
    if (!name || !street || !city || !state || !zipCode || !country) {
      return NextResponse.json({ error: 'All address fields are required' }, { status: 400 });
    }

    // If this is the default address, unset any existing default addresses
    if (isDefault) {
      await db.addresses.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await db.addresses.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        name,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update an address
export async function PUT(request: NextRequest) {
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
    const { id, name, street, city, state, zipCode, country, isDefault } = data;

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = await db.addresses.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found or does not belong to user' }, { status: 404 });
    }

    // If this will be the default address, unset any existing default addresses
    if (isDefault) {
      await db.addresses.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await db.addresses.update({
      where: { id },
      data: {
        name: name || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete an address
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = await db.addresses.findFirst({
      where: {
        id: addressId,
        userId: user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found or does not belong to user' }, { status: 404 });
    }

    await db.addresses.delete({
      where: { id: addressId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
