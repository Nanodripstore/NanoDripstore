import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Add admin check here if needed
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await db.products.findMany({
      include: {
        variants: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return Response.json({ products });
  } catch (error) {
    console.error('Error fetching products with variants:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
