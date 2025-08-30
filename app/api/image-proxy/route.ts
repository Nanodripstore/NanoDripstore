export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Validate that it's a Google Drive URL
    if (!imageUrl.includes('drive.google.com')) {
      return new Response('Only Google Drive URLs are supported', { status: 400 });
    }

    console.log('Proxying image URL:', imageUrl);

    // Fetch the image from Google Drive
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://drive.google.com/',
        'Accept': 'image/*,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new Response(`Failed to fetch image: ${response.statusText}`, { 
        status: response.status 
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': process.env.NODE_ENV === 'production' 
          ? 'public, max-age=300, must-revalidate' // 5 minutes cache with revalidation in production
          : 'public, max-age=3600', // 1 hour cache in development
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Accept, User-Agent',
      },
    });

  } catch (error) {
    console.error('Error proxying image:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
