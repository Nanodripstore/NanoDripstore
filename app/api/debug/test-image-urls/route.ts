export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return Response.json(
        { error: 'Please provide an array of URLs to test' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      urls.map(async (url: string) => {
        const processedUrl = processImageUrl(url);
        const testResult = await testImageUrl(processedUrl);
        
        return {
          original: url,
          processed: processedUrl,
          ...testResult
        };
      })
    );

    return Response.json({
      success: true,
      results,
      summary: {
        total: results.length,
        accessible: results.filter(r => r.accessible).length,
        fast: results.filter(r => r.loadTime && r.loadTime < 1000).length
      }
    });

  } catch (error) {
    console.error('Error testing image URLs:', error);
    return Response.json(
      { error: 'Failed to test image URLs' },
      { status: 500 }
    );
  }
}

// Enhanced image URL processor (same as in live-sheet-sync.ts)
function processImageUrl(url: string): string | null {
  if (!url || url.trim().length === 0) {
    return null;
  }

  const trimmedUrl = url.trim();

  // If it's already a direct HTTP/HTTPS URL (not a Google Drive share link), return as is
  if (trimmedUrl.startsWith('http') && !trimmedUrl.includes('drive.google.com/file/d/')) {
    return trimmedUrl;
  }

  // Handle local paths (fallback for existing local images)
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // Handle Google Drive shareable links
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveShareMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveShareMatch) {
    const fileId = driveShareMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Handle Google Drive direct view links (already optimized)
  if (trimmedUrl.includes('drive.google.com/uc?')) {
    return trimmedUrl;
  }

  // Handle bare Google Drive file IDs (28+ characters, alphanumeric with hyphens/underscores)
  if (/^[a-zA-Z0-9_-]{28,}$/.test(trimmedUrl)) {
    return `https://drive.google.com/uc?export=view&id=${trimmedUrl}`;
  }

  // Handle other cloud storage providers
  if (trimmedUrl.includes('cloudinary.com') || 
      trimmedUrl.includes('amazonaws.com') || 
      trimmedUrl.includes('s3.') ||
      trimmedUrl.includes('firebasestorage.googleapis.com')) {
    return trimmedUrl;
  }

  return null;
}

// Test if an image URL is accessible and measure load time
async function testImageUrl(url: string | null): Promise<{
  accessible: boolean;
  loadTime?: number;
  error?: string;
  status?: number;
}> {
  if (!url) {
    return { accessible: false, error: 'Invalid URL' };
  }

  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'HEAD', // Just check headers, don't download the image
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const loadTime = Date.now() - startTime;

    return {
      accessible: response.ok,
      loadTime,
      status: response.status
    };

  } catch (error) {
    const loadTime = Date.now() - startTime;
    return {
      accessible: false,
      loadTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET() {
  return Response.json({
    message: 'POST to this endpoint with { "urls": ["url1", "url2"] } to test image URLs',
    example: {
      urls: [
        'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
        '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        'https://drive.google.com/uc?export=view&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
      ]
    }
  });
}
