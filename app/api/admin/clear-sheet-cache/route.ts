import LiveSheetSyncService from '@/lib/live-sheet-sync';

export async function POST() {
  try {
    const syncService = new LiveSheetSyncService();
    syncService.clearCache();
    
    return Response.json({
      success: true,
      message: 'Sheet cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing sheet cache:', error);
    return Response.json(
      { 
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: 'Use POST to clear sheet cache',
    endpoints: {
      clearCache: 'POST /api/admin/clear-sheet-cache',
      refreshProducts: 'GET /api/products/live?refresh=true',
      refreshProduct: 'GET /api/products/live/[slug]?refresh=true'
    }
  });
}
