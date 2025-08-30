const { 
  convertGoogleDriveUrl, 
  convertToImageKitUrl, 
  getGoogleDriveThumbnailUrl,
  getGoogleDriveUrlVariants 
} = require('./lib/utils.ts');

console.log('=== Final Verification Test ===\n');

// Test different Google Drive URL formats
const testUrls = [
  'https://drive.google.com/file/d/1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H/view?usp=sharing',
  'https://drive.google.com/uc?export=view&id=1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H',
  'https://drive.google.com/open?id=1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H',
  'https://picsum.photos/400/400' // Non-Google Drive URL
];

console.log('1. convertGoogleDriveUrl Test:');
testUrls.forEach((url, index) => {
  const result = convertGoogleDriveUrl(url);
  console.log(`  ${index + 1}. ${url}`);
  console.log(`     → ${result}\n`);
});

console.log('2. convertToImageKitUrl Test:');
testUrls.forEach((url, index) => {
  const result = convertToImageKitUrl(url);
  console.log(`  ${index + 1}. ${url}`);
  console.log(`     → ${result}\n`);
});

console.log('3. getGoogleDriveThumbnailUrl Test:');
const sampleFileId = '1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H';
const thumbnailUrl = getGoogleDriveThumbnailUrl(sampleFileId);
console.log(`  File ID: ${sampleFileId}`);
console.log(`  Thumbnail: ${thumbnailUrl}\n`);

console.log('4. getGoogleDriveUrlVariants Test:');
const variants = getGoogleDriveUrlVariants(sampleFileId);
console.log(`  File ID: ${sampleFileId}`);
console.log(`  Direct: ${variants.direct}`);
console.log(`  Thumbnail: ${variants.thumbnail}`);
console.log(`  ImageKit Direct: ${variants.imagekitDirect}`);
console.log(`  ImageKit Thumbnail: ${variants.imagekitThumbnail}\n`);

console.log('=== Verification Complete ===');
