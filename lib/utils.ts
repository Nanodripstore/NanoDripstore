import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes email addresses to prevent duplicate accounts.
 * Handles various characters that email providers commonly ignore or treat as equivalent.
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
 * Converts Google Drive sharing URLs to proxied URLs that avoid CORS issues
 * Uses a local Next.js API route to proxy the images server-side
 */
export function convertGoogleDriveUrl(url: string, colorVariant?: string): string {
  if (!url) return '';
  
  try {
    // If it's not a Google Drive URL, return as-is
    if (!url.includes('drive.google.com')) {
      return url;
    }

    // If it's already a proxied URL, return as-is
    if (url.includes('/api/drive-proxy')) {
      return url;
    }

    // Extract the file ID from common Drive links
    const match = url.match(/[-\w]{25,}/);
    if (!match) return url; // if no ID found, return original

    const fileId = match[0];
    
    // Create different Google Drive URL formats to try
    const driveUrls = [
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
    ];

    // Use the first URL format with our proxy
    const driveUrl = driveUrls[0];
    let proxyUrl = `/api/drive-proxy?url=${encodeURIComponent(driveUrl)}`;
    
    // Add color variant as cache-busting parameter to ensure unique requests
    if (colorVariant) {
      proxyUrl += `&variant=${encodeURIComponent(colorVariant)}`;
    }
    
    return proxyUrl;
  } catch (error) {
    console.warn('Error converting Google Drive URL:', error);
    return url;
  }
}

// Alternative function name for compatibility
export function getDriveDirectLink(url: string, colorVariant?: string): string {
  return convertGoogleDriveUrl(url, colorVariant);
}

/**
 * Alternative Google Drive URL format that might work better for some files
 * This uses the thumbnail endpoint which can sometimes bypass CORS issues
 */
export function getGoogleDriveThumbnailUrl(url: string, size: number = 800): string {
  if (!url) return '';
  
  try {
    // Extract the file ID from common Drive links
    const match = url.match(/[-\w]{25,}/);
    if (!match) return url; // if no ID found, return original

    const fileId = match[0];
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
    return `/api/drive-proxy?url=${encodeURIComponent(thumbnailUrl)}`;
  } catch (error) {
    console.warn('Error creating Google Drive thumbnail URL:', error);
    return url;
  }
}

/**
 * Get multiple Google Drive URL formats for fallback strategies
 */
export function getGoogleDriveUrlVariants(url: string): string[] {
  if (!url) return [];
  
  try {
    // Extract the file ID from common Drive links
    const match = url.match(/[-\w]{25,}/);
    if (!match) return [url]; // if no ID found, return original

    const fileId = match[0];
    
    const variants = [
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
    ];

    // Return proxied versions of all variants
    return variants.map(variant => `/api/drive-proxy?url=${encodeURIComponent(variant)}`);
  } catch (error) {
    console.warn('Error creating Google Drive URL variants:', error);
    return [url];
  }
}
