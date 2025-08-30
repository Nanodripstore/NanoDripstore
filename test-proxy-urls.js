// Test the new proxy-based URL conversion

function convertGoogleDriveUrl(url) {
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
    return `/api/drive-proxy?url=${encodeURIComponent(driveUrl)}`;
  } catch (error) {
    console.warn('Error converting Google Drive URL:', error);
    return url;
  }
}

function getGoogleDriveUrlVariants(url) {
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

// Test cases
const testUrls = [
  'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
  'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
  'https://picsum.photos/400/400'
];

console.log('🔄 Testing Proxy-Based Google Drive URL Conversion:');
console.log('==================================================');

testUrls.forEach((url, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log('Original:', url);
  console.log('Proxied:', convertGoogleDriveUrl(url));
  
  if (url.includes('drive.google.com')) {
    console.log('Fallback URLs:');
    const variants = getGoogleDriveUrlVariants(url);
    variants.forEach((variant, i) => {
      console.log(`  ${i + 1}. ${variant}`);
    });
  }
});
