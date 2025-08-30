// Test script to check product data and color-image mapping
const testProductData = async () => {
  try {
    console.log('Fetching product data...');
    const response = await fetch('http://localhost:3000/api/products/live');
    const data = await response.json();
    
    console.log('Total products:', data.products?.length || 0);
    
    // Find acid washed products
    const acidWashedProducts = data.products?.filter(p => 
      p.name && p.name.toLowerCase().includes('acid washed')
    ) || [];
    
    console.log('Acid Washed products found:', acidWashedProducts.length);
    
    acidWashedProducts.forEach((product, index) => {
      console.log(`\n=== Product ${index + 1}: ${product.name} ===`);
      console.log('ID:', product.id);
      console.log('Images:', product.images || 'NO IMAGES');
      console.log('Image URLs:', [
        product.image_url_1,
        product.image_url_2, 
        product.image_url_3,
        product.image_url_4
      ].filter(Boolean));
      console.log('Colors:', product.colors || 'NO COLORS');
      console.log('Variants:', product.variants?.length || 0, 'variants');
      
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant, vIndex) => {
          console.log(`  Variant ${vIndex + 1}:`, {
            colorName: variant.colorName,
            colorValue: variant.colorValue,
            images: variant.images || 'NO VARIANT IMAGES'
          });
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

testProductData();
