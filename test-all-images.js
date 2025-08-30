// Test script to fetch and verify all product images are using proxy URLs

const testAllImages = async () => {
  try {
    console.log('🔍 Testing all product images from API...');
    
    const response = await fetch('http://localhost:3000/api/products/live');
    const data = await response.json();
    
    console.log(`Found ${data.products?.length || 0} products`);
    
    let totalImages = 0;
    let proxyImages = 0;
    let directImages = 0;
    
    data.products?.forEach((product, index) => {
      console.log(`\n=== Product ${index + 1}: ${product.name} ===`);
      console.log('Product Images:', product.images?.length || 0);
      
      // Check product-level images
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img, imgIndex) => {
          totalImages++;
          console.log(`  Image ${imgIndex + 1}: ${img.substring(0, 80)}...`);
          
          if (img.includes('/api/drive-proxy')) {
            proxyImages++;
            console.log(`    ✅ Uses proxy`);
          } else if (img.includes('drive.google.com')) {
            directImages++;
            console.log(`    ❌ Direct Google Drive URL (should be proxied)`);
          } else {
            console.log(`    ℹ️  Non-Google Drive URL`);
          }
        });
      }
      
      // Check variant images
      if (product.variants && Array.isArray(product.variants)) {
        console.log(`Variants: ${product.variants.length}`);
        
        product.variants.forEach((variant, vIndex) => {
          if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
            console.log(`  Variant ${vIndex + 1} (${variant.colorName}): ${variant.images.length} images`);
            
            variant.images.forEach((img, imgIndex) => {
              totalImages++;
              console.log(`    Image ${imgIndex + 1}: ${img.substring(0, 60)}...`);
              
              if (img.includes('/api/drive-proxy')) {
                proxyImages++;
                console.log(`      ✅ Uses proxy`);
              } else if (img.includes('drive.google.com')) {
                directImages++;
                console.log(`      ❌ Direct Google Drive URL (should be proxied)`);
              } else {
                console.log(`      ℹ️  Non-Google Drive URL`);
              }
            });
          }
        });
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total images: ${totalImages}`);
    console.log(`Proxy URLs: ${proxyImages} ✅`);
    console.log(`Direct Google Drive URLs: ${directImages} ${directImages > 0 ? '❌' : '✅'}`);
    console.log(`Other URLs: ${totalImages - proxyImages - directImages}`);
    
    if (directImages === 0) {
      console.log('\n🎉 All Google Drive images are properly using the proxy!');
    } else {
      console.log('\n⚠️  Some images are not using the proxy. This might cause CORS issues in production.');
    }
    
  } catch (error) {
    console.error('❌ Error testing images:', error);
  }
};

testAllImages();
