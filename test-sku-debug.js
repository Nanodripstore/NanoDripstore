const testSkuLookup = async () => {
  console.log('Testing SKU lookup for Green + L...');
  
  // Test the exact API call that should be made
  const testCases = [
    { productId: '1', color: 'Green', size: 'L' },
    { productId: '1', color: 'Green', size: 'S' },
    { productId: '1', color: 'green', size: 'l' }, // Test case sensitivity
    { productId: '1', color: 'Green', size: 'M' },
  ];
  
  for (const testCase of testCases) {
    try {
      const url = `http://localhost:3000/api/products/variant-sku?productId=${testCase.productId}&color=${encodeURIComponent(testCase.color)}&size=${encodeURIComponent(testCase.size)}`;
      console.log(`\n🔍 Testing: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ SUCCESS: ${testCase.color} + ${testCase.size} → SKU: ${data.sku}`);
      } else {
        console.log(`❌ FAILED: ${testCase.color} + ${testCase.size} → Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`💥 ERROR: ${testCase.color} + ${testCase.size} → ${error.message}`);
    }
  }
};

// Run the test
testSkuLookup();