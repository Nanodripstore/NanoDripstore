// Test script to debug color-specific image loading issues

const testColorImageMapping = async () => {
  try {
    console.log('🔍 Testing Color-Specific Image Mapping...');
    
    const response = await fetch('http://localhost:3000/api/products/live');
    const data = await response.json();
    
    console.log(`Found ${data.products?.length || 0} products`);
    
    data.products?.forEach((product, index) => {
      console.log(`\n=== Product ${index + 1}: ${product.name} ===`);
      console.log('Product-level images:', product.images?.length || 0);
      console.log('Product colors:', product.colors);
      console.log('Variants:', product.variants?.length || 0);
      
      // Test variant-based image mapping
      if (product.variants && product.variants.length > 0) {
        console.log('\n--- Variant Analysis ---');
        
        // Group variants by color
        const colorGroups = {};
        product.variants.forEach((variant, vIndex) => {
          const colorName = variant.colorName;
          if (!colorGroups[colorName]) {
            colorGroups[colorName] = [];
          }
          colorGroups[colorName].push(variant);
          
          console.log(`  Variant ${vIndex + 1}: ${colorName}`);
          console.log(`    Has images: ${variant.images && variant.images.length > 0 ? 'Yes (' + variant.images.length + ')' : 'No'}`);
          if (variant.images && variant.images.length > 0) {
            console.log(`    First image: ${variant.images[0].substring(0, 80)}...`);
            
            // Check if it's using proxy
            if (variant.images[0].includes('/api/drive-proxy')) {
              console.log(`    ✅ Uses proxy`);
            } else if (variant.images[0].includes('drive.google.com')) {
              console.log(`    ❌ Direct Google Drive URL - potential CORS issue!`);
            }
          }
        });
        
        console.log('\n--- Color Groups ---');
        Object.keys(colorGroups).forEach(colorName => {
          const variantsForColor = colorGroups[colorName];
          console.log(`  Color "${colorName}": ${variantsForColor.length} variants`);
          
          // Check if all variants for this color have the same images
          const firstVariantImages = variantsForColor[0].images || [];
          const allSameImages = variantsForColor.every(variant => {
            const variantImages = variant.images || [];
            return variantImages.length === firstVariantImages.length &&
                   variantImages.every((img, i) => img === firstVariantImages[i]);
          });
          
          console.log(`    All variants have same images: ${allSameImages ? 'Yes' : 'No'}`);
          if (firstVariantImages.length > 0) {
            console.log(`    Representative image: ${firstVariantImages[0].substring(0, 60)}...`);
          }
        });
      }
      
      // Test fallback to product-level images
      console.log('\n--- Product-Level Fallback ---');
      if (product.images && product.images.length > 0) {
        console.log(`Available product images: ${product.images.length}`);
        
        // If we have colors and multiple images, test the index mapping
        let colors = [];
        try {
          colors = typeof product.colors === 'string' 
            ? JSON.parse(product.colors || '[]') 
            : product.colors || [];
        } catch (e) {
          console.log('Error parsing colors:', e.message);
        }
        
        if (colors.length > 0 && product.images.length > 1) {
          console.log('Testing color-to-image index mapping:');
          colors.forEach((color, colorIndex) => {
            if (colorIndex < product.images.length) {
              console.log(`  ${color.name} (index ${colorIndex}) → ${product.images[colorIndex].substring(0, 60)}...`);
              
              // Check proxy usage
              if (product.images[colorIndex].includes('/api/drive-proxy')) {
                console.log(`    ✅ Uses proxy`);
              } else if (product.images[colorIndex].includes('drive.google.com')) {
                console.log(`    ❌ Direct Google Drive URL - potential CORS issue!`);
              }
            } else {
              console.log(`  ${color.name} (index ${colorIndex}) → No corresponding image`);
            }
          });
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing color image mapping:', error);
  }
};

testColorImageMapping();
