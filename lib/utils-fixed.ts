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
 * Converts Google Drive sharing URLs to direct view URLs for image display
 * Uses simple regex pattern to extract file ID from various Google Drive URL formats
 * This approach uses the direct Google Drive view method
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  
  try {
    // If it's already in the correct uc?export=view format, return as-is
    if (url.includes('drive.google.com/uc?export=view&id=')) {
      return url;
    }

    // Extract the file ID from common Drive links
    const match = url.match(/[-\w]{25,}/);
    if (!match) return url; // if no ID found, return original

    const fileId = match[0];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.warn('Error converting Google Drive URL:', error);
    return url;
  }
}

// Alternative function name for compatibility
export function getDriveDirectLink(url: string): string {
  return convertGoogleDriveUrl(url);
}
