import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    // Validate that it's a Google Drive URL
    if (!url.includes('drive.google.com')) {
      return new NextResponse('Invalid URL - only Google Drive URLs are supported', { status: 400 });
    }

    // Fetch the image from Google Drive
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch image from Google Drive:', response.status, response.statusText);
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
