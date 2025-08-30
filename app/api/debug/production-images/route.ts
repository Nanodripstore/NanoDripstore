import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testUrl = searchParams.get('testUrl');
    
    // Basic diagnostics
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasSheetId: !!process.env.LIVE_SHEET_ID,
      hasGoogleCreds: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      testResults: {}
    };

    // Test Google Drive URL conversion
    if (testUrl) {
      console.log('Testing URL:', testUrl);
      
      try {
        // Test proxy endpoint
        const proxyUrl = `/api/drive-proxy?url=${encodeURIComponent(testUrl)}`;
        diagnostics.testResults = {
          originalUrl: testUrl,
          proxyUrl: proxyUrl,
          message: 'Proxy URL generated successfully'
        };

        // Try to fetch the image through the proxy
        const fullProxyUrl = `${request.nextUrl.origin}${proxyUrl}`;
        console.log('Testing proxy fetch:', fullProxyUrl);
        
        const startTime = Date.now();
        const proxyResponse = await fetch(fullProxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NanoDrip-Diagnostics/1.0)'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        const endTime = Date.now();

        diagnostics.testResults.proxyTest = {
          status: proxyResponse.status,
          statusText: proxyResponse.statusText,
          contentType: proxyResponse.headers.get('content-type'),
          contentLength: proxyResponse.headers.get('content-length'),
          responseTime: `${endTime - startTime}ms`,
          success: proxyResponse.ok
        };

        if (!proxyResponse.ok) {
          const errorText = await proxyResponse.text();
          diagnostics.testResults.proxyTest.error = errorText;
        }

      } catch (error: any) {
        diagnostics.testResults.error = {
          message: error.message,
          type: error.constructor.name,
          stack: error.stack
        };
      }
    }

    // Test some sample Google Drive URLs
    const sampleUrls = [
      'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
      'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing'
    ];

    diagnostics.sampleUrlTests = [];
    
    for (const url of sampleUrls) {
      const proxyUrl = `/api/drive-proxy?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${url.match(/[-\w]{25,}/)?.[0]}`)}`;
      
      try {
        const fullProxyUrl = `${request.nextUrl.origin}${proxyUrl}`;
        const response = await fetch(fullProxyUrl, {
          method: 'HEAD', // Just check headers, don't download full image
          signal: AbortSignal.timeout(5000)
        });

        diagnostics.sampleUrlTests.push({
          originalUrl: url,
          proxyUrl: proxyUrl,
          status: response.status,
          success: response.ok,
          contentType: response.headers.get('content-type')
        });
      } catch (error: any) {
        diagnostics.sampleUrlTests.push({
          originalUrl: url,
          proxyUrl: proxyUrl,
          error: error.message,
          success: false
        });
      }
    }

    return NextResponse.json(diagnostics, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: true,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
