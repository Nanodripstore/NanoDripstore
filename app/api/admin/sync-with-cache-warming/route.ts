import ImageCacheWarmer from '@/lib/image-cache-warmer';

export async function POST(request: Request) {
  try {
    const warmer = new ImageCacheWarmer();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const warmCache = searchParams.get('warmCache') === 'true';
    
    if (warmCache) {
      // Sync products and warm image cache
      console.log('Starting sync with image cache warming...');
      const result = await warmer.syncWithImageWarming();
      
      return Response.json({
        success: true,
        message: 'Product sync completed with image cache warming',
        syncResult: result.syncResult,
        warmingResult: result.warmingResult
      });
    } else {
      // Just sync products without warming
      console.log('Starting regular product sync...');
      const syncService = new (await import('@/lib/live-sheet-sync')).default();
      const result = await syncService.syncFromSheet();
      
      return Response.json({
        success: true,
        message: 'Product sync completed',
        result
      });
    }

  } catch (error) {
    console.error('Error during product sync:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Failed to sync products',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: 'POST to this endpoint to sync products',
    options: {
      warmCache: 'Add ?warmCache=true to sync products and warm image cache',
      example: 'POST /api/admin/sync-with-cache-warming?warmCache=true'
    }
  });
}
