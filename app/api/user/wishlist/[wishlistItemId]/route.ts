import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

// Using dynamic route segments: [wishlistItemId]
export async function DELETE(
  req: Request,
  context: { params: Promise<{ wishlistItemId: string }> }
) {
  try {
    const { wishlistItemId } = await context.params

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
      return Response.json({ error: 'User not found' }, {
        status: StatusCodes.NOT_FOUND
      })
    }

    // Check if wishlist item exists and belongs to the user
    const wishlistItem = await db.wishlist_items.findUnique({
      where: { id: wishlistItemId }
    })

    if (!wishlistItem) {
      return Response.json({ error: 'Wishlist item not found' }, {
        status: StatusCodes.NOT_FOUND
      })
    }

    if (wishlistItem.userId !== user.id) {
      return Response.json({ error: 'Not authorized to remove this item' }, {
        status: StatusCodes.FORBIDDEN
      })
    }

    // Delete the wishlist item
    await db.wishlist_items.delete({
      where: { id: wishlistItemId }
    })

    return Response.json({ message: 'Wishlist item removed successfully' }, {
      status: StatusCodes.OK
    })
  } catch (error) {
    console.error('Error removing wishlist item:', error)
    return Response.json({ error: 'Internal server error' }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR
    })
  }
}
