// Test size-specific SKU lookup
console.log('🧪 Testing Size-Specific SKU Lookup');

fetch('/api/products/variant-sku?productId=4&color=Green&size=L', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ L Size SKU Result:', data);
  
  // Test with different size
  return fetch('/api/products/variant-sku?productId=4&color=Green&size=M', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
})
.then(response => response.json())
.then(data => {
  console.log('✅ M Size SKU Result:', data);
  
  // Test with different size
  return fetch('/api/products/variant-sku?productId=4&color=Green&size=S', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
})
.then(response => response.json())
.then(data => {
  console.log('✅ S Size SKU Result:', data);
})
.catch(error => {
  console.error('❌ Test error:', error);
});