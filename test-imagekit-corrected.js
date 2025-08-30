// Test script for corrected ImageKit Web Proxy URL format

// Simulate the corrected convertGoogleDriveUrl function
function convertToImageKitWebProxy(googleDriveUrl) {
  if (!googleDriveUrl) return '';

  // If it's already an ImageKit URL, return as-is
  if (googleDriveUrl.includes('ik.imagekit.io')) {
    return googleDriveUrl;
  }

  // If it's not a Google Drive URL, return as-is
  if (!googleDriveUrl.includes('drive.google.com')) {
    return googleDriveUrl;
  }

  // Extract the file ID from common Drive links
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,           // /file/d/FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,               // ?id=FILE_ID or &id=FILE_ID
    /\/d\/([a-zA-Z0-9_-]+)/,                 // /d/FILE_ID
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
    return googleDriveUrl; // Return original URL as fallback
  }

  // Create the Google Drive direct download URL
  const googleDriveDirectUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  
  // Build ImageKit Web Proxy URL with the full Google Drive URL
  const imagekitUrl = `https://ik.imagekit.io/nanodripstore/${googleDriveDirectUrl}?tr=w-800,h-800,c-maintain_aspect_ratio,q-85`;
  
  return imagekitUrl;
}

console.log('🧪 Testing Corrected ImageKit Web Proxy URL Format\n');

// Test the problematic URL from the error
const problematicUrl = 'https://drive.google.com/file/d/1D-tPw9jpFnh0HixTt7GUXTh0ew-YNBuo/view?usp=sharing';

console.log('🚫 Previous WRONG format:');
console.log(`https://ik.imagekit.io/nanodripstore/1D-tPw9jpFnh0HixTt7GUXTh0ew-YNBuo?tr=w-800,h-800,c-maintain_aspect_ratio,q-85`);

console.log('\n✅ Corrected ImageKit Web Proxy format:');
const correctedUrl = convertToImageKitWebProxy(problematicUrl);
console.log(correctedUrl);

console.log('\n📋 Testing with multiple URLs:');

const testUrls = [
  'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
  'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
  'https://drive.google.com/file/d/1D-tPw9jpFnh0HixTt7GUXTh0ew-YNBuo/view?usp=sharing',
];

testUrls.forEach((url, index) => {
  const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  const imagekitUrl = convertToImageKitWebProxy(url);
  
  console.log(`\n${index + 1}. File ID: ${fileId}`);
  console.log(`   Original: ${url}`);
  console.log(`   ImageKit: ${imagekitUrl}`);
});

console.log('\n🔍 Key Differences:');
console.log('❌ WRONG: https://ik.imagekit.io/nanodripstore/FILE_ID');
console.log('✅ CORRECT: https://ik.imagekit.io/nanodripstore/https://drive.google.com/uc?export=view&id=FILE_ID');

console.log('\n✨ This should now work with ImageKit Web Proxy!');
