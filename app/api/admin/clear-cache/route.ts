import LiveSheetSyncService from '@/lib/live-sheet-sync';

export async function POST() {
  try {
    const syncService = new LiveSheetSyncService();
    syncService.clearCache();

    return Response.json({ 
      success: true, 
      message: 'Cache cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return Response.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
