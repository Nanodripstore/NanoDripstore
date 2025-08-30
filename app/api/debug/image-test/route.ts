import LiveSheetSyncService from '@/lib/live-sheet-sync';
import { convertGoogleDriveUrl } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    // Get products from sheet
    const syncService = new LiveSheetSyncService();
    const result = await syncService.getProductsFromSheet({ limit: 3 });
    
    if (!result.products || result.products.length === 0) {
      return Response.json({ error: 'No products found' });
    }

    // Test image URL processing for each product
    const imageTests = result.products.map(product => {
      return {
        productId: product.id,
        productName: product.name,
        defaultImages: product.images || [],
        variants: product.variants?.map((variant: any) => ({
          colorName: variant.colorName,
          originalImages: variant.images || [],
          processedImages: (variant.images || []).map((img: string) => convertGoogleDriveUrl(img))
        })) || [],
        firstImageTest: {
          original: product.images?.[0] || 'No image',
          processed: product.images?.[0] ? convertGoogleDriveUrl(product.images[0]) : 'No image'
        }
      };
    });

    return Response.json({
      timestamp: new Date().toISOString(),
      totalProducts: result.products.length,
      imageTests,
      summary: {
        allProductsHaveImages: imageTests.every(test => test.firstImageTest.original !== 'No image'),
        uniqueImages: [...new Set(imageTests.map(test => test.firstImageTest.processed))].length,
        totalVariants: imageTests.reduce((sum, test) => sum + test.variants.length, 0)
      }
    });

  } catch (error) {
    console.error('Image test error:', error);
    return Response.json({ 
      error: 'Failed to test images', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
