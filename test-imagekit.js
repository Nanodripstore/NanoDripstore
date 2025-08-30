// Test script for ImageKit URL conversion

const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/nanodripstore/';

function extractGoogleDriveFileId(url) {
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }

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

function convertToImageKitUrl(googleDriveUrl, transformations) {
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

const ImageKitTransforms = {
  thumbnail: (url) => convertToImageKitUrl(url, 'w-200,h-200,c-maintain_aspect_ratio'),
  small: (url) => convertToImageKitUrl(url, 'w-400,h-400,c-maintain_aspect_ratio'),
  medium: (url) => convertToImageKitUrl(url, 'w-800,h-800,c-maintain_aspect_ratio'),
  large: (url) => convertToImageKitUrl(url, 'w-1200,h-1200,c-maintain_aspect_ratio'),
  productCard: (url) => convertToImageKitUrl(url, 'w-300,h-400,c-maintain_aspect_ratio,q-80'),
  productDetail: (url) => convertToImageKitUrl(url, 'w-600,h-800,c-maintain_aspect_ratio,q-85'),
  productGallery: (url) => convertToImageKitUrl(url, 'w-1000,h-1200,c-maintain_aspect_ratio,q-90'),
  cartItem: (url) => convertToImageKitUrl(url, 'w-100,h-120,c-maintain_aspect_ratio,q-75'),
  original: (url) => convertToImageKitUrl(url),
};

console.log('🖼️ Testing ImageKit URL Conversion\n');

// Test URLs from your actual data
const testUrls = [
  'https://drive.google.com/file/d/1HqMAyW2445AnZjY7fvXPR4yozQFBONDK/view?usp=sharing',
  'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
  'https://drive.google.com/open?id=1ABCDefgh123456789',
  'https://drive.google.com/uc?export=download&id=1XYZabc987654321',
];

console.log('🧪 Testing Basic URL Conversion:');
testUrls.forEach((url, index) => {
  const imagekitUrl = convertToImageKitUrl(url);
  const fileId = extractGoogleDriveFileId(url);
  console.log(`${index + 1}. Original: ${url}`);
  console.log(`   File ID:  ${fileId}`);
  console.log(`   ImageKit: ${imagekitUrl}`);
  console.log('');
});

console.log('🎨 Testing Different Transformations:');

const testUrl = testUrls[0];
console.log(`Using: ${testUrl}`);
console.log('');
console.log('Transformed URLs:');
console.log(`Thumbnail:     ${ImageKitTransforms.thumbnail(testUrl)}`);
console.log(`Small:         ${ImageKitTransforms.small(testUrl)}`);
console.log(`Medium:        ${ImageKitTransforms.medium(testUrl)}`);
console.log(`Large:         ${ImageKitTransforms.large(testUrl)}`);
console.log(`Product Card:  ${ImageKitTransforms.productCard(testUrl)}`);
console.log(`Product Detail: ${ImageKitTransforms.productDetail(testUrl)}`);
console.log(`Cart Item:     ${ImageKitTransforms.cartItem(testUrl)}`);
console.log(`Original:      ${ImageKitTransforms.original(testUrl)}`);

console.log('\n✅ All conversions completed!');
