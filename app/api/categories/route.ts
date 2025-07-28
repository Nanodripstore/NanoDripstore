import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    // Get products from a specific category
    if (category) {
      const products = await db.products.findMany({
        where: { category }
      })
      
      if (products.length === 0) {
        return new Response(JSON.stringify({ error: 'No products found in this category' }), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return Response.json({
        category,
        products
      })
    }
    
    // Get all unique categories
    const products = await db.products.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc'
      }
    })
    
    // Count products per category
    const categoriesWithCount = []
    
    for (const product of products) {
      const count = await db.products.count({
        where: { category: product.category }
      })
      
      categoriesWithCount.push({
        name: product.category,
        slug: product.category.toLowerCase().replace(/ /g, '-'),
        _count: { products: count }
      })
    }
    
    return Response.json(categoriesWithCount)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
