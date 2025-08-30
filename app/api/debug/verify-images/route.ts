export async function GET() {
  const imageIds = [
    { name: 'Acid Washed Oversized', id: '1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H' },
    { name: 'Classic Hoodie', id: '1HqMAyW2445AnZjY7fvXPR4yozQFBONDK' },
    { name: 'Urban Street T-Shirt', id: '1D-tPw9jpFnh0HixTt7GUXTh0ew-YNBuo' }
  ];

  const results = [];

  for (const image of imageIds) {
    try {
      const url = `https://drive.google.com/uc?export=view&id=${image.id}`;
      const response = await fetch(url, {
        method: 'HEAD', // Just get headers, not the full image
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

      results.push({
        name: image.name,
        id: image.id,
        url: url,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        lastModified: response.headers.get('last-modified'),
        etag: response.headers.get('etag'),
        accessible: response.ok
      });
    } catch (error) {
      results.push({
        name: image.name,
        id: image.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return Response.json({
    message: 'Image verification results',
    timestamp: new Date().toISOString(),
    results
  });
}
