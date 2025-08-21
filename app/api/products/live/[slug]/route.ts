import LiveSheetSyncService from '@/lib/live-sheet-sync';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true'; // Cache busting parameter
    const timestamp = searchParams.get('t'); // Timestamp for page reloads

    if (!slug) {
      return Response.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

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
          message: `Missing or invalid environment variables: ${missingVars.join(', ')}. Please configure Google Sheets API credentials.`
        },
        { status: 500 }
      );
    }

    const syncService = new LiveSheetSyncService();
    
    // Clear cache if refresh is requested or timestamp indicates fresh page load
    if (refresh || timestamp) {
      syncService.clearCache();
      console.log('Cache cleared due to refresh parameter or page reload for product slug');
    }
    
    // Fetch single product by slug from Google Sheet
    const product = await syncService.getProductBySlug(slug);

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 1 minute cache, 2 minutes stale
      }
    });

  } catch (error) {
    console.error('Error fetching product from sheet:', error);
    return Response.json(
      { 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
