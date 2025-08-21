import LiveSheetSyncService from '@/lib/live-sheet-sync';

export async function POST() {
  try {
    const syncService = new LiveSheetSyncService();
    
    // Pre-load common data patterns to warm the cache
    const warmUpTasks = [
      // Load first page of products
      syncService.getProductsFromSheet({ page: 1, limit: 12 }),
      // Load popular categories
      syncService.getProductsFromSheet({ category: 'tshirt', page: 1, limit: 12 }),
      syncService.getProductsFromSheet({ category: 'hoodie', page: 1, limit: 12 }),
      // Load bestsellers
      syncService.getProductsFromSheet({ sortBy: 'is_bestseller', sortOrder: 'desc', page: 1, limit: 12 }),
    ];

    await Promise.allSettled(warmUpTasks);

    return Response.json({ 
      success: true, 
      message: 'Cache warmed up successfully' 
    });
  } catch (error) {
    console.error('Error warming up cache:', error);
    return Response.json(
      { error: 'Failed to warm up cache' },
      { status: 500 }
    );
  }
}
