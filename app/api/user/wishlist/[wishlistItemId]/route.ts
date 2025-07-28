import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

// Using dynamic route segments: [wishlistItemId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { wishlistItemId: string } }
) {
  try {
    const wishlistItemId = params.wishlistItemId

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

    // Check if wishlist item exists and belongs to the user
    const wishlistItem = await db.wishlist_items.findUnique({
      where: { id: wishlistItemId }
    })

    if (!wishlistItem) {
      return new NextResponse(JSON.stringify({ error: 'Wishlist item not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (wishlistItem.userId !== user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized to remove this item' }), {
        status: StatusCodes.FORBIDDEN,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Delete the wishlist item
    await db.wishlist_items.delete({
      where: { id: wishlistItemId }
    })

    return new NextResponse(JSON.stringify({ message: 'Wishlist item removed successfully' }), {
      status: StatusCodes.OK,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error removing wishlist item:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
