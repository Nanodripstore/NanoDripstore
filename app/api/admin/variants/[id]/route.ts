import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const variantId = parseInt(params.id);

    if (isNaN(variantId)) {
      return Response.json(
        { error: 'Invalid variant ID' },
        { status: 400 }
      );
    }

    // Check if variant exists
    const existingVariant = await db.product_variants.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      return Response.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Check if variant is being used in any cart items
    const cartItemsCount = await db.cart_items.count({
      where: { variantId }
    });

    if (cartItemsCount > 0) {
      return Response.json(
        { error: 'Cannot delete variant that is currently in use in cart items' },
        { status: 409 }
      );
    }

    // Delete the variant
    await db.product_variants.delete({
      where: { id: variantId }
    });

    return Response.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const variantId = parseInt(params.id);
    
    if (isNaN(variantId)) {
      return Response.json(
        { error: 'Invalid variant ID' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { colorName, colorValue, sku, price, stockQuantity, isAvailable } = body;

    // Check if variant exists
    const existingVariant = await db.product_variants.findUnique({
      where: { id: variantId }
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

    // If color name is being changed, check if new color is available for this product
    if (colorName && colorName !== existingVariant.colorName) {
      const existingColor = await db.product_variants.findFirst({
        where: {
          productId: existingVariant.productId,
          colorName: colorName,
          id: { not: variantId }
        }
      });

      if (existingColor) {
        return Response.json(
          { error: `A variant with color "${colorName}" already exists for this product` },
          { status: 409 }
        );
      }
    }

    // Update the variant
    const updatedVariant = await db.product_variants.update({
      where: { id: variantId },
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
