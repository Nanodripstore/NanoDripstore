import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Add admin check here if needed
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, colorName, colorValue, sku, price, stockQuantity } = body;

    // Validate required fields
    if (!productId || !colorName || !colorValue || !sku) {
      return Response.json(
        { error: 'Missing required fields: productId, colorName, colorValue, sku' },
        { status: 400 }
      );
    }

    console.log('Creating variant:', { productId, colorName, colorValue, sku });

    // Check if product exists
    const product = await db.products.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if variant with same color already exists for this product
    const existingVariant = await db.product_variants.findFirst({
      where: {
        productId,
        colorName
      }
    });

    if (existingVariant) {
      console.log('Existing variant found:', existingVariant);
      return Response.json(
        { error: `A variant with color "${colorName}" already exists for this product` },
        { status: 409 }
      );
    }

    // Check if SKU is already in use
    const existingSku = await db.product_variants.findUnique({
      where: { sku }
    });

    if (existingSku) {
      return Response.json(
        { error: 'This SKU is already in use by another variant' },
        { status: 409 }
      );
    }

    // Create the variant
    const variant = await db.product_variants.create({
      data: {
        productId,
        colorName,
        colorValue,
        sku,
        price: price || null,
        stockQuantity: stockQuantity || 0,
        isAvailable: true
      }
    });

    return Response.json({ variant }, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, colorName, colorValue, sku, price, stockQuantity, isAvailable } = body;

    if (!id) {
      return Response.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    // Check if variant exists
    const existingVariant = await db.product_variants.findUnique({
      where: { id }
    });

    if (!existingVariant) {
      return Response.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    // If SKU is being changed, check if new SKU is available
    if (sku && sku !== existingVariant.sku) {
      const existingSku = await db.product_variants.findUnique({
        where: { sku }
      });

      if (existingSku) {
        return Response.json(
          { error: 'This SKU is already in use by another variant' },
          { status: 409 }
        );
      }
    }

    // Update the variant
    const updatedVariant = await db.product_variants.update({
      where: { id },
      data: {
        ...(colorName && { colorName }),
        ...(colorValue && { colorValue }),
        ...(sku && { sku }),
        ...(price !== undefined && { price: price || null }),
        ...(stockQuantity !== undefined && { stockQuantity }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

    return Response.json({ variant: updatedVariant });
  } catch (error) {
    console.error('Error updating variant:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
