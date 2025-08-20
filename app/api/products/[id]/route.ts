import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15
    const { id } = await context.params;
    
    let product;
    
    // Try to parse as ID first
    const productId = parseInt(id);
    if (!isNaN(productId)) {
      // Get product by ID with variants
      product = await db.products.findUnique({
        where: { id: productId },
        include: {
          variants: {
            orderBy: { createdAt: 'asc' } // Order by creation date, first uploaded first
          }
        }
      });
    } else {
      // If not a number, treat as slug and search by name
      const products = await db.products.findMany({
        include: {
          variants: {
            orderBy: { createdAt: 'asc' } // Order by creation date, first uploaded first
          }
        }
      });
      product = products.find(p => 
        p.name.toLowerCase().replace(/\s+/g, '-') === id
      );
    }
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: StatusCodes.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return product data including SKU
    return Response.json({
      ...product,
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      averageRating: product.rating,
      reviewCount: product.reviews
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
