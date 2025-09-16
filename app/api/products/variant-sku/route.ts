import LiveSheetSyncService from '@/lib/live-sheet-sync';

// API endpoint to get exact variant SKU from Google Sheets
// GET /api/products/variant-sku?productId=1&color=Black&size=M
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const color = searchParams.get('color');
    const size = searchParams.get('size');

    if (!productId || !color || !size) {
      return Response.json(
        { error: 'Missing required parameters: productId, color, and size are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking up SKU for Product ${productId}, Color: ${color}, Size: ${size}`);

    const syncService = new LiveSheetSyncService();
    const variantSku = await syncService.getVariantSkuFromSheet(
      parseInt(productId),
      color,
      size
    );

    if (!variantSku) {
      console.log(`❌ No SKU found for Product ${productId}, Color: ${color}, Size: ${size}`);
      return Response.json(
        { error: 'Variant SKU not found for the specified combination' },
        { status: 404 }
      );
    }

    console.log(`✅ Found SKU: ${variantSku} for Product ${productId}, Color: ${color}, Size: ${size}`);

    return Response.json({
      success: true,
      productId: parseInt(productId),
      color,
      size,
      sku: variantSku
    });

  } catch (error) {
    console.error('Error fetching variant SKU:', error);
    return Response.json(
      { error: 'Failed to fetch variant SKU from sheet' },
      { status: 500 }
    );
  }
}