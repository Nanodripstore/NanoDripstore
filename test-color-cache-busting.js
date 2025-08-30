// Test script to verify that different colors generate different proxy URLs
// This ensures proper cache busting for color-specific images

// Simulate the convertGoogleDriveUrl function
function convertGoogleDriveUrl(url, colorVariant) {
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

// Sample image URLs for testing
const testImages = [
  'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
  'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
  'https://drive.google.com/file/d/1ABCDefgh123456789/view?usp=sharing'
];

const colors = ['White', 'Black', 'Red', 'Blue', 'Green'];

console.log('🧪 Testing Color-Specific Cache Busting URLs\n');

testImages.forEach((imageUrl, index) => {
  console.log(`📸 Image ${index + 1}: ${imageUrl}`);
  console.log('Generated Proxy URLs:');
  
  colors.forEach(color => {
    const proxyUrl = convertGoogleDriveUrl(imageUrl, color);
    console.log(`  ${color.padEnd(8)}: ${proxyUrl}`);
  });
  
  // Test without color variant
  const defaultUrl = convertGoogleDriveUrl(imageUrl);
  console.log(`  Default : ${defaultUrl}`);
  
  console.log('');
});

console.log('✅ Each color should generate a unique proxy URL with variant parameter');
console.log('✅ This ensures browser caching works correctly for color-specific images');
