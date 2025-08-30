/**
 * ImageKit CDN utilities for converting Google Drive URLs to ImageKit URLs
 * This provides faster, more reliable image loading compared to proxying Google Drive
 */

const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/nanodripstore/';

/**
 * Extracts the Google Drive file ID from various Google Drive URL formats
 */
function extractGoogleDriveFileId(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }

  // Handle different Google Drive URL formats:
  // 1. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 2. https://drive.google.com/open?id=FILE_ID
  // 3. https://drive.google.com/uc?export=download&id=FILE_ID
  // 4. https://drive.google.com/uc?export=view&id=FILE_ID
  // 5. https://drive.google.com/thumbnail?id=FILE_ID&sz=w800

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,           // /file/d/FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,               // ?id=FILE_ID or &id=FILE_ID
    /\/d\/([a-zA-Z0-9_-]+)/,                 // /d/FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts a Google Drive URL to an ImageKit CDN URL
 * @param googleDriveUrl - The original Google Drive URL
 * @param transformations - Optional ImageKit transformations (e.g., 'w-400,h-400,c-maintain_aspect_ratio')
 * @returns ImageKit CDN URL or original URL if conversion fails
 */
export function convertToImageKitUrl(googleDriveUrl: string, transformations?: string): string {
  if (!googleDriveUrl) return '';

  // If it's already an ImageKit URL, return as-is
  if (googleDriveUrl.includes('ik.imagekit.io')) {
    return googleDriveUrl;
  }

  // If it's not a Google Drive URL, return as-is
  if (!googleDriveUrl.includes('drive.google.com')) {
    return googleDriveUrl;
  }

  const fileId = extractGoogleDriveFileId(googleDriveUrl);
  if (!fileId) {
    console.warn('Could not extract file ID from Google Drive URL:', googleDriveUrl);
    return googleDriveUrl; // Return original URL as fallback
  }

  // Build ImageKit URL
  let imagekitUrl = `${IMAGEKIT_BASE_URL}${fileId}`;
  
  // Add transformations if provided
  if (transformations) {
    imagekitUrl += `?tr=${transformations}`;
  }

  return imagekitUrl;
}

/**
 * Converts Google Drive URLs to ImageKit URLs with common transformations
 */
export const ImageKitTransforms = {
  // Thumbnail sizes
  thumbnail: (url: string) => convertToImageKitUrl(url, 'w-200,h-200,c-maintain_aspect_ratio'),
  small: (url: string) => convertToImageKitUrl(url, 'w-400,h-400,c-maintain_aspect_ratio'),
  medium: (url: string) => convertToImageKitUrl(url, 'w-800,h-800,c-maintain_aspect_ratio'),
  large: (url: string) => convertToImageKitUrl(url, 'w-1200,h-1200,c-maintain_aspect_ratio'),
  
  // Product showcase specific
  productCard: (url: string) => convertToImageKitUrl(url, 'w-300,h-400,c-maintain_aspect_ratio,q-80'),
  productDetail: (url: string) => convertToImageKitUrl(url, 'w-600,h-800,c-maintain_aspect_ratio,q-85'),
  productGallery: (url: string) => convertToImageKitUrl(url, 'w-1000,h-1200,c-maintain_aspect_ratio,q-90'),
  
  // Cart and checkout
  cartItem: (url: string) => convertToImageKitUrl(url, 'w-100,h-120,c-maintain_aspect_ratio,q-75'),
  
  // Default - no transformations
  original: (url: string) => convertToImageKitUrl(url),
};

/**
 * Batch converts multiple Google Drive URLs to ImageKit URLs
 */
export function convertMultipleToImageKit(urls: string[], transformations?: string): string[] {
  return urls.map(url => convertToImageKitUrl(url, transformations));
}

/**
 * Test function to verify URL conversion
 */
export function testImageKitConversion() {
  const testUrls = [
    'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
    'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
    'https://drive.google.com/open?id=1ABCDefgh123456789',
    'https://drive.google.com/uc?export=download&id=1XYZabc987654321',
  ];

  console.log('🧪 Testing ImageKit URL Conversion:');
  testUrls.forEach(url => {
    const imagekitUrl = convertToImageKitUrl(url);
    const thumbnailUrl = ImageKitTransforms.thumbnail(url);
    console.log(`Original: ${url}`);
    console.log(`ImageKit: ${imagekitUrl}`);
    console.log(`Thumbnail: ${thumbnailUrl}`);
    console.log('---');
  });
}
