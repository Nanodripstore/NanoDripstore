import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    // Await params in Next.js 15
    const { slug } = await context.params;
    
    // Since the schema doesn't have a slug field, we'll need to create a slug from the name
    // Get all products
    const products = await db.products.findMany()
    
    // Create slugs for each product and find the one that matches the requested slug
    const product = products.find(p => 
      p.name.toLowerCase().replace(/\s+/g, '-') === slug
    )
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get related products from same category
    const relatedProducts = await db.products.findMany({
      where: {
        category: product.category,
        id: { not: product.id } // Exclude current product
      },
      take: 4
    })
    
    // Format related products
    const relatedWithRating = relatedProducts.map((item: any) => {
      return {
        ...item,
        slug: item.name.toLowerCase().replace(/\s+/g, '-'),
        averageRating: item.rating,
        reviewCount: item.reviews
      }
    })
    
    // Return product with calculated fields
    return Response.json({
      ...product,
      slug: slug,
      averageRating: product.rating,
      reviewCount: product.reviews,
      relatedProducts: relatedWithRating
    })
  } catch (error) {
    console.error('Error fetching product details:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
