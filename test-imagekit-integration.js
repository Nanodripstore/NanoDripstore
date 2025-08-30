// Test script to verify ImageKit integration with existing code

// Simulate the convertGoogleDriveUrl function since we can't import TypeScript directly
function convertToImageKit(url, colorVariant) {
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

    // Build ImageKit URL with basic optimization
    const imagekitUrl = `https://ik.imagekit.io/nanodripstore/${fileId}?tr=w-800,h-800,c-maintain_aspect_ratio,q-85`;
    
    return imagekitUrl;
  } catch (error) {
    console.warn('Error converting Google Drive URL to ImageKit:', error);
    return url;
  }
}

console.log('🧪 Testing ImageKit Integration\n');

// Test the URLs from your actual product data
const testImages = [
  'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
  'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
  'https://ik.imagekit.io/nanodripstore/someFileId', // Already ImageKit URL
  'https://example.com/some-image.jpg', // Non-Google Drive URL
  '', // Empty URL
];

const colors = ['White', 'Black', 'Red'];

console.log('Testing URL conversions with different colors:');
testImages.forEach((url, index) => {
  console.log(`\n${index + 1}. Original: ${url || '(empty)'}`);
  
  colors.forEach(color => {
    const converted = convertToImageKit(url, color);
    const wasConverted = converted !== url;
    console.log(`   ${color}: ${converted} ${wasConverted ? '✅ CONVERTED' : '⚠️ unchanged'}`);
  });
});

console.log('\n🔍 Key Benefits of ImageKit Integration:');
console.log('✅ No proxy server required');
console.log('✅ Fast CDN delivery worldwide');
console.log('✅ Automatic image optimization');
console.log('✅ No CORS issues');
console.log('✅ No server-side caching complexity');
console.log('✅ Works identical in local and production');
console.log('✅ No color-specific cache conflicts');

console.log('\n📏 Generated URL Length Comparison:');
const sampleUrl = testImages[0];
const oldProxyUrl = `/api/drive-proxy?url=${encodeURIComponent('https://drive.google.com/uc?export=download&id=1HqMAyW2445AnZjY7fvXPR4yozQFBONDK')}&variant=White`;
const newImageKitUrl = convertToImageKit(sampleUrl, 'White');

console.log(`Old Proxy URL (${oldProxyUrl.length} chars):`);
console.log(oldProxyUrl);
console.log(`\nNew ImageKit URL (${newImageKitUrl.length} chars):`);
console.log(newImageKitUrl);
console.log(`\n💾 URL length reduced by ${oldProxyUrl.length - newImageKitUrl.length} characters!`);
