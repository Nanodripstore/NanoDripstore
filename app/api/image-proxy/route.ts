export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const cacheBuster = searchParams.get('cb'); // Cache busting parameter

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Validate that it's a Google Drive URL
    if (!imageUrl.includes('drive.google.com')) {
      return new Response('Only Google Drive URLs are supported', { status: 400 });
    }

    console.log('Proxying image URL:', imageUrl, 'Cache buster:', cacheBuster);

    // Fetch the image from Google Drive with better headers
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://drive.google.com/',
        'Accept': 'image/webp,image/avif,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText, 'URL:', imageUrl);
      return new Response(`Failed to fetch image: ${response.statusText}`, { 
        status: response.status 
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log('Successfully proxied image:', imageUrl, 'Type:', contentType, 'Size:', imageBuffer.byteLength);

    // Return the image with headers that prevent caching based on URL
    const etag = `"${cacheBuster || 'default'}-${imageBuffer.byteLength}"`;
    
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, must-revalidate', // 5 minutes with revalidation
        'ETag': etag, // Unique ETag based on cache buster and content
        'Vary': 'Accept, User-Agent, cb', // Vary by cache buster parameter
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error proxying image:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
