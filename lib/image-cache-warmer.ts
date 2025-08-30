import LiveSheetSyncService from './live-sheet-sync';

export class ImageCacheWarmer {
  private syncService: LiveSheetSyncService;

  constructor() {
    this.syncService = new LiveSheetSyncService();
  }

  // Pre-warm image URLs by making HEAD requests
  async warmImageCache(imageUrls: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    console.log(`Starting to warm cache for ${imageUrls.length} images...`);

    // Process images in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (url) => {
          try {
            const response = await fetch(url, {
              method: 'HEAD',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (response.ok) {
              results.success++;
              console.log(`✓ Warmed: ${url}`);
            } else {
              results.failed++;
              results.errors.push(`${url}: ${response.status} ${response.statusText}`);
              console.warn(`✗ Failed: ${url} (${response.status})`);
            }
          } catch (error) {
            results.failed++;
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            results.errors.push(`${url}: ${errorMsg}`);
            console.error(`✗ Error: ${url}`, errorMsg);
          }
        })
      );

      // Small delay between batches to be respectful
      if (i + batchSize < imageUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Cache warming complete: ${results.success} success, ${results.failed} failed`);
    return results;
  }

  // Extract all image URLs from products
  extractImageUrls(products: any[]): string[] {
    const urls = new Set<string>();

    products.forEach(product => {
      // Product images
      if (Array.isArray(product.images)) {
        product.images.forEach((img: string) => {
          if (img && img.trim()) urls.add(img.trim());
        });
      }

      // Variant images
      if (Array.isArray(product.variants)) {
        product.variants.forEach((variant: any) => {
          if (Array.isArray(variant.images)) {
            variant.images.forEach((img: string) => {
              if (img && img.trim()) urls.add(img.trim());
            });
          }
          if (variant.image && variant.image.trim()) {
            urls.add(variant.image.trim());
          }
        });
      }
    });

    return Array.from(urls);
  }

  // Full sync with image warming
  async syncWithImageWarming(): Promise<{
    syncResult: any;
    warmingResult: any;
  }> {
    console.log('Starting product sync with image warming...');
    
    // First, sync the products
    const syncResult = await this.syncService.syncFromSheet();
    console.log('Product sync completed');

    // Get the latest products to extract image URLs
    const productsData = await this.syncService.getProductsFromSheet({});
    const imageUrls = this.extractImageUrls(productsData.products);

    // Process URLs to convert Google Drive links to direct view links
    const processedUrls = imageUrls
      .map(url => this.processImageUrl(url))
      .filter(url => url !== null) as string[];

    // Warm the cache for processed URLs
    const warmingResult = await this.warmImageCache(processedUrls);

    return {
      syncResult,
      warmingResult
    };
  }

  // Same image processing logic as in other files
  private processImageUrl(url: string): string | null {
    if (!url || url.trim().length === 0) {
      return null;
    }

    const trimmedUrl = url.trim();

    // If it's already a direct HTTP/HTTPS URL (not a Google Drive share link), return as is
    if (trimmedUrl.startsWith('http') && !trimmedUrl.includes('drive.google.com/file/d/')) {
      return trimmedUrl;
    }

    // Handle local paths (skip these for warming)
    if (trimmedUrl.startsWith('/')) {
      return null;
    }

    // Handle Google Drive shareable links
    const driveShareMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveShareMatch) {
      const fileId = driveShareMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Handle Google Drive direct view links (already optimized)
    if (trimmedUrl.includes('drive.google.com/uc?')) {
      return trimmedUrl;
    }

    // Handle bare Google Drive file IDs
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
}

export default ImageCacheWarmer;
