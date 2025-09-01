import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get('category')
    const productId = searchParams.get('id')
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Get a single product by ID
    if (productId) {
      const product = await db.products.findUnique({
        where: { id: parseInt(productId) },
        include: {
          order_items: true,
          variants: true
        }
      })
      
      if (!product) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return Response.json(product)
    }
    
    // Build the query based on filters
    const where: any = {}
    
    if (categorySlug) {
      // Filter products directly by category string
      where.category = categorySlug
    }
    
    if (featured) {
      where.featured = true
    }
    
    // Get products with pagination
    const products = await db.products.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit
    })
    
    // Get total count for pagination
    const totalCount = await db.products.count({ where })
    
    return Response.json({
      products,
      totalCount
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
