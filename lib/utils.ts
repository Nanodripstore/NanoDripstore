import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes email addresses to prevent duplicate accounts.
 * Handles various characters that email providers treat as equivalent when determining uniqueness.
 * Gmail ignores dots and plus signs in email addresses, so we normalize by removing them.
 */
export function normalizeEmail(email: string): string {
  if (!email) return email;
  
  // Convert to lowercase and trim whitespace
  const lowercaseEmail = email.toLowerCase().trim();
  
  const [username, domain] = lowercaseEmail.split('@');
  
  if (!username || !domain) return lowercaseEmail;
  
  let normalizedUsername = username;
  
  // Gmail and Google Workspace domains
  const gmailDomains = ['gmail.com', 'googlemail.com'];
  const isGmail = gmailDomains.includes(domain);
  
  if (isGmail) {
    // For Gmail: remove dots and handle plus addressing
    normalizedUsername = username.replace(/\./g, ''); // Remove dots
    normalizedUsername = normalizedUsername.split('+')[0]; // Remove everything after +
  } else {
    // For other providers, handle common normalization patterns
    
    // Remove dots for providers that ignore them
    const dotsIgnoredDomains = [
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com', // Microsoft
      'yahoo.com', 'ymail.com', 'rocketmail.com', // Yahoo (some configurations)
    ];
    
    if (dotsIgnoredDomains.includes(domain)) {
      normalizedUsername = normalizedUsername.replace(/\./g, '');
    }
    
    // Handle plus addressing for providers that support it
    const plusAddressingDomains = [
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com', // Microsoft
      'yahoo.com', 'ymail.com', 'rocketmail.com', // Yahoo
      'icloud.com', 'me.com', 'mac.com', // Apple
      'protonmail.com', 'proton.me', // ProtonMail
      'fastmail.com', 'fastmail.fm', // FastMail
    ];
    
    if (plusAddressingDomains.includes(domain)) {
      normalizedUsername = normalizedUsername.split('+')[0];
    }
  }
  
  // Remove common alternative characters that might be treated as equivalent
  normalizedUsername = normalizedUsername
    .replace(/[_-]/g, '') // Remove underscores and hyphens (some providers ignore these)
    .replace(/\s+/g, ''); // Remove any remaining whitespace
  
  return `${normalizedUsername}@${domain}`;
}

/**
 * Converts Google Drive sharing URLs to ImageKit CDN URLs for fast, reliable image loading
 * This uses ImageKit's Web Proxy feature with the full Google Drive URL
 */
export function convertGoogleDriveUrl(url: string, colorVariant?: string): string {
  if (!url) return '';
  
  try {
    // If it's already an ImageKit URL, return as-is
    if (url.includes('ik.imagekit.io')) {
      return url;
    }

    // If it's not a Google Drive URL, return as-is
    if (!url.includes('drive.google.com')) {
      return url;
    }

    // Extract the file ID from common Drive links
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,           // /file/d/FILE_ID
      /[?&]id=([a-zA-Z0-9_-]+)/,               // ?id=FILE_ID or &id=FILE_ID
      /\/d\/([a-zA-Z0-9_-]+)/,                 // /d/FILE_ID
    ];

    let fileId = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }

    if (!fileId) {
      console.warn('Could not extract file ID from Google Drive URL:', url);
      return url; // Return original URL as fallback
    }

    // Create the Google Drive direct download URL
    const googleDriveDirectUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Build ImageKit Web Proxy URL with transformations BEFORE the external URL
    const imagekitUrl = `https://ik.imagekit.io/nanodripstore/tr:w-800,h-800,c-maintain_aspect_ratio,q-85/${googleDriveDirectUrl}`;
    
    return imagekitUrl;
  } catch (error) {
    console.warn('Error converting Google Drive URL to ImageKit:', error);
    return url;
  }
}

// Alternative function name for compatibility
export function getDriveDirectLink(url: string, colorVariant?: string): string {
  return convertGoogleDriveUrl(url, colorVariant);
}

/**
 * ImageKit transformation utilities for different use cases
 */
export const ImageKitTransforms = {
  // Thumbnail sizes
  thumbnail: (url: string) => convertToImageKitUrl(url, 'w-200,h-200,c-maintain_aspect_ratio,q-80'),
  small: (url: string) => convertToImageKitUrl(url, 'w-400,h-400,c-maintain_aspect_ratio,q-80'),
  medium: (url: string) => convertToImageKitUrl(url, 'w-800,h-800,c-maintain_aspect_ratio,q-85'),
  large: (url: string) => convertToImageKitUrl(url, 'w-1200,h-1200,c-maintain_aspect_ratio,q-90'),
  
  // Product showcase specific
  productCard: (url: string) => convertToImageKitUrl(url, 'w-300,h-400,c-maintain_aspect_ratio,q-80'),
  productDetail: (url: string) => convertToImageKitUrl(url, 'w-600,h-800,c-maintain_aspect_ratio,q-85'),
  productGallery: (url: string) => convertToImageKitUrl(url, 'w-1000,h-1200,c-maintain_aspect_ratio,q-90'),
  
  // Cart and checkout
  cartItem: (url: string) => convertToImageKitUrl(url, 'w-100,h-120,c-maintain_aspect_ratio,q-75'),
  
  // Default - optimized but full size
  optimized: (url: string) => convertToImageKitUrl(url, 'c-maintain_aspect_ratio,q-85'),
};

/**
 * Helper function to convert Google Drive URL to ImageKit with custom transformations
 */
function convertToImageKitUrl(googleDriveUrl: string, transformations?: string): string {
  if (!googleDriveUrl) return '';

  // If it's already an ImageKit URL, return as-is
  if (googleDriveUrl.includes('ik.imagekit.io')) {
    return googleDriveUrl;
  }

  // If it's not a Google Drive URL, return as-is
  if (!googleDriveUrl.includes('drive.google.com')) {
    return googleDriveUrl;
  }

  // Extract file ID using the same logic as convertGoogleDriveUrl
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  let fileId = null;
  for (const pattern of patterns) {
    const match = googleDriveUrl.match(pattern);
    if (match && match[1]) {
      fileId = match[1];
      break;
    }
  }

  if (!fileId) {
    console.warn('Could not extract file ID from Google Drive URL:', googleDriveUrl);
    return googleDriveUrl;
  }

  // Create the Google Drive direct download URL
  const googleDriveDirectUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  // Build ImageKit URL with transformations BEFORE the external URL
  let imagekitUrl = `https://ik.imagekit.io/nanodripstore/`;
  
  // Add transformations if provided (before the URL)
  if (transformations) {
    imagekitUrl += `tr:${transformations}/`;
  }
  
  imagekitUrl += googleDriveDirectUrl;

  return imagekitUrl;
}

/**
 * Get ImageKit thumbnail URL with specific size
 */
export function getGoogleDriveThumbnailUrl(url: string, size: number = 800): string {
  if (!url) return '';
  
  try {
    // Extract the file ID from common Drive links
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    let fileId = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }

    if (!fileId) return url; // if no ID found, return original

    // Create the Google Drive direct URL
    const googleDriveDirectUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Return ImageKit URL with thumbnail transformation BEFORE the URL
    return `https://ik.imagekit.io/nanodripstore/tr:w-${size},h-${size},c-maintain_aspect_ratio,q-80/${googleDriveDirectUrl}`;
  } catch (error) {
    console.warn('Error creating ImageKit thumbnail URL:', error);
    return url;
  }
}

/**
 * Get multiple ImageKit URL formats with different transformations for fallback strategies
 */
export function getGoogleDriveUrlVariants(url: string): string[] {
  if (!url) return [];
  
  try {
    // Extract the file ID from common Drive links
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    let fileId = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }

    if (!fileId) return [url]; // if no ID found, return original

    // Create different Google Drive URLs for fallback
    const googleDriveUrls = [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
    ];

    // Return different ImageKit transformations for fallback with transformations BEFORE the URL
    const variants = [
      `https://ik.imagekit.io/nanodripstore/tr:w-800,h-800,c-maintain_aspect_ratio,q-85/${googleDriveUrls[0]}`,
      `https://ik.imagekit.io/nanodripstore/tr:w-600,h-600,c-maintain_aspect_ratio,q-80/${googleDriveUrls[1]}`,
      `https://ik.imagekit.io/nanodripstore/tr:w-400,h-400,c-maintain_aspect_ratio,q-80/${googleDriveUrls[2]}`,
      `https://ik.imagekit.io/nanodripstore/${googleDriveUrls[0]}` // Original without transformations
    ];

    return variants;
  } catch (error) {
    console.warn('Error creating ImageKit URL variants:', error);
    return [url];
  }
}

/**
 * Filters out empty, undefined, or whitespace-only image URLs
 * @param images Array of image URLs
 * @returns Array of valid image URLs
 */
export function getValidImages(images: string[] | undefined | null): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter((img: string) => img && typeof img === 'string' && img.trim().length > 0);
}

/**
 * Gets the first valid image from an array of images
 * @param images Array of image URLs
 * @returns First valid image URL or empty string if none found
 */
export function getFirstValidImage(images: string[] | undefined | null): string {
  const validImages = getValidImages(images);
  return validImages.length > 0 ? validImages[0] : '';
}

/**
 * Get a safe image URL that is never empty (always returns a valid URL)
 * @param url Image URL to validate
 * @param fallback Fallback URL (defaults to placeholder)
 * @returns A valid image URL (never empty)
 */
export function getSafeImageUrl(url: string | undefined | null, fallback: string = '/placeholder-image.svg'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  return url.trim();
}
