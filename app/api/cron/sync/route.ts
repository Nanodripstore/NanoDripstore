import LiveSheetSyncService from '@/lib/live-sheet-sync';

// This endpoint will be called by a cron job or webhook
export async function POST(request: Request) {
  try {
    // Check if request is authorized (optional security)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET;
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Automated sync started at:', new Date().toISOString());
    
    const syncService = new LiveSheetSyncService();
    const result = await syncService.syncFromSheet();
    
    // Update last sync time
    process.env.LAST_SYNC_TIME = new Date().toISOString();
    
    console.log('Automated sync completed:', result);
    
    return Response.json({
      success: true,
      message: 'Automated sync completed',
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    console.error('Automated sync failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Automated sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Cron sync endpoint is ready',
    timestamp: new Date().toISOString()
  });
}
