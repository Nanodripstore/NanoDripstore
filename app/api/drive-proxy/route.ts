import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for production to avoid repeated requests to Google Drive
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let url = searchParams.get('url');
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    // Validate that it's a Google Drive URL
    if (!url.includes('drive.google.com')) {
      return new NextResponse('Invalid URL - only Google Drive URLs are supported', { status: 400 });
    }

    console.log(`Proxying image: ${url}`);

    // Production-specific debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('Production proxy request:', {
        url: url,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        timestamp: new Date().toISOString()
      });
      
      // Check cache first in production
      const cacheKey = url;
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached image for:', url);
        return new NextResponse(cached.data, {
          status: 200,
          headers: {
            'Content-Type': cached.contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Proxy-Cache': 'HIT',
            'X-Proxy-Debug': 'enabled',
            'X-Proxy-Timestamp': new Date().toISOString(),
          },
        });
      }
    }

    // Retry logic for better reliability
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add different user agents and headers to avoid detection
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
        
        const userAgent = userAgents[attempt % userAgents.length];
        
        response = await fetch(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            // Add cache busting for production
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (response.ok) {
          console.log(`Successfully fetched image on attempt ${attempt}`);
          break;
        } else {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          console.warn(`Attempt ${attempt} failed: ${lastError.message}`);
          
          // If we get a 403 or 429, try different URL formats
          if ((response.status === 403 || response.status === 429) && attempt < maxRetries) {
            const fileId = url.match(/[-\w]{25,}/)?.[0];
            if (fileId) {
              // Try different Google Drive URL formats
              const alternativeUrls = [
                `https://drive.google.com/uc?export=view&id=${fileId}`,
                `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
                `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
              ];
              
              if (alternativeUrls[attempt - 1] && alternativeUrls[attempt - 1] !== url) {
                url = alternativeUrls[attempt - 1];
                console.log(`Trying alternative URL format: ${url}`);
                continue;
              }
            }
          }
          
          if (attempt < maxRetries) {
            // Wait before retrying with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } catch (fetchError: any) {
        lastError = fetchError;
        console.warn(`Attempt ${attempt} failed with error:`, fetchError.message);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!response || !response.ok) {
      console.error('All retry attempts failed:', lastError?.message || 'Unknown error');
      return new NextResponse('Failed to fetch image after multiple attempts', { 
        status: response?.status || 500 
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    console.log(`Successfully proxied image, size: ${imageBuffer.byteLength} bytes`);

    // Cache in production for future requests
    if (process.env.NODE_ENV === 'production') {
      const cacheKey = url;
      imageCache.set(cacheKey, {
        data: imageBuffer,
        contentType: contentType,
        timestamp: Date.now()
      });
      
      // Cleanup old cache entries (keep cache size reasonable)
      if (imageCache.size > 100) {
        const oldestKey = imageCache.keys().next().value;
        imageCache.delete(oldestKey);
      }
    }

    // Add additional headers for production debugging
    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Proxy-Cache': 'MISS',
    };

    // Add debug headers in production
    if (process.env.NODE_ENV === 'production') {
      responseHeaders['X-Proxy-Debug'] = 'enabled';
      responseHeaders['X-Proxy-Timestamp'] = new Date().toISOString();
      responseHeaders['X-Proxy-Size'] = imageBuffer.byteLength.toString();
    }

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('Error proxying image:', error);
    return new NextResponse(`Internal server error: ${error.message}`, { status: 500 });
  }
}
