import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get counts for dashboard
    const [productCount, variantCount, orderCount] = await Promise.all([
      prisma.products.count(),
      prisma.product_variants.count(),
      prisma.orders.count().catch(() => 0) // Handle if orders table doesn't exist yet
    ]);

    // Get recent products
    const recentProducts = await prisma.products.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true
      }
    });

    return Response.json({
      stats: {
        products: productCount,
        variants: variantCount,
        orders: orderCount
      },
      recentProducts
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return Response.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
