import LiveSheetSyncService from '@/lib/live-sheet-sync';

export async function POST() {
  try {
    console.log('Manual sync triggered');
    const syncService = new LiveSheetSyncService();
    const result = await syncService.syncFromSheet();
    
    return Response.json({
      success: true,
      message: 'Products synced successfully from live sheet',
      ...result
    });
  } catch (error) {
    console.error('Live sync error:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Failed to sync from live sheet', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check sync status and last sync time
    const lastSyncTime = process.env.LAST_SYNC_TIME || 'Never';
    const sheetId = process.env.LIVE_SHEET_ID || 'Not configured';
    
    return Response.json({
      success: true,
      sheetId: sheetId,
      lastSync: lastSyncTime,
      status: sheetId !== 'Not configured' ? 'Ready' : 'Not configured'
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
