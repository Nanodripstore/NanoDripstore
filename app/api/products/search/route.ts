import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit
    
    // Build the where clause based on search parameters
    const where: any = {
      // Search by name or description
      ...(query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      } : {}),
      // Filter by category
      ...(category ? { category } : {}),
    }
    
    // Count total matching products for pagination metadata
    const total = await db.products.count({ where })
    
    // Query products with filters, sorting and pagination
    const products = await db.products.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    })
    
    // Products already have rating so we don't need to calculate it
    const formattedProducts = products.map((product: any) => {
      return {
        ...product,
        averageRating: product.rating,
        reviewCount: product.reviews
      }
    })
    
    return Response.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
