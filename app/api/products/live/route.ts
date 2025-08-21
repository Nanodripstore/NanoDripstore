import LiveSheetSyncService from '@/lib/live-sheet-sync';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'product_id';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const refresh = searchParams.get('refresh') === 'true'; // Cache busting parameter
    const timestamp = searchParams.get('t'); // Timestamp for page reloads

    // Check if Google Sheets is properly configured
    const requiredEnvVars = [
      'GOOGLE_SHEETS_PROJECT_ID',
      'GOOGLE_SHEETS_PRIVATE_KEY',
      'GOOGLE_SHEETS_CLIENT_EMAIL',
      'LIVE_SHEET_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => {
      const value = process.env[varName];
      return !value || value.includes('your-') || value.includes('placeholder');
    });

    if (missingVars.length > 0) {
      return Response.json(
        { 
          error: 'Google Sheets not configured',
          message: `Missing or invalid environment variables: ${missingVars.join(', ')}. Please configure Google Sheets API credentials.`,
          products: [],
          pagination: { total: 0, pages: 0, current: 1, hasNext: false, hasPrev: false }
        },
        { status: 500 }
      );
    }

    const syncService = new LiveSheetSyncService();
    
    // Clear cache if refresh is requested or timestamp indicates fresh page load
    if (refresh || timestamp) {
      syncService.clearCache();
      console.log('Cache cleared due to refresh parameter or page reload');
    }
    
    // Fetch data directly from Google Sheet
    const result = await syncService.getProductsFromSheet({
      query,
      category,
      page,
      limit,
      sortBy,
      sortOrder
    });

    return Response.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 1 minute cache, 2 minutes stale
      }
    });
  } catch (error) {
    console.error('Error fetching products from sheet:', error);
    
    // Return helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    let troubleshootingTips = [];
    
    if (errorMessage.includes('Unable to parse range')) {
      troubleshootingTips.push('Sheet range format is invalid - check if sheet exists');
      troubleshootingTips.push('Verify the sheet name and structure');
    } else if (errorMessage.includes('Unable to access spreadsheet')) {
      troubleshootingTips.push('Check LIVE_SHEET_ID is correct');
      troubleshootingTips.push('Ensure service account has access to the sheet');
    } else if (errorMessage.includes('DECODER routines::unsupported')) {
      troubleshootingTips.push('Google Sheets credentials format issue');
      troubleshootingTips.push('Check private key format in .env.local');
    }
    
    return Response.json(
      { 
        error: 'Failed to fetch products from sheet',
        message: errorMessage,
        troubleshooting: {
          commonIssues: [
            'Google Sheets API credentials not properly configured',
            'LIVE_SHEET_ID not set or invalid',
            'Sheet does not exist or is not accessible',
            'Service account does not have permission to access the sheet',
            'Sheet structure does not match expected format'
          ],
          nextSteps: [
            'Check .env.local file for correct Google Sheets configuration',
            'Verify the Google Sheet ID is correct',
            'Ensure the service account has viewer access to the sheet',
            'Check Google Cloud Console for API quotas and errors',
            'Use /api/debug/sheet to test sheet access'
          ],
          specificTips: troubleshootingTips
        },
        products: [],
        pagination: { total: 0, pages: 0, current: 1, hasNext: false, hasPrev: false }
      },
      { status: 500 }
    );
  }
}
