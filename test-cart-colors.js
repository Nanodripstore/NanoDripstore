// Test script to verify cart color-specific image functionality
const testCartColors = () => {
  console.log('Testing cart color-specific image selection logic...');
  
  // Mock product data similar to what comes from Google Sheets
  const mockProduct = {
    id: 'acid-washed-tshirt',
    name: 'Acid Washed T-Shirt',
    images: [
      'https://drive.google.com/file/d/image1/view',  // Black
      'https://drive.google.com/file/d/image2/view',  // White  
      'https://drive.google.com/file/d/image3/view'   // Gray
    ],
    colors: JSON.stringify([
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray', value: '#808080' }
    ])
  };
  
  // Mock cart items with different colors
  const cartItems = [
    { productId: 'acid-washed-tshirt', color: 'Black', quantity: 1 },
    { productId: 'acid-washed-tshirt', color: 'White', quantity: 1 },
    { productId: 'acid-washed-tshirt', color: 'Gray', quantity: 1 }
  ];
  
  // Test the color-specific image selection logic
  cartItems.forEach((cartItem) => {
    let selectedImage = mockProduct.images[0]; // Default to first image
    
    if (cartItem.color && mockProduct.images.length > 1) {
      try {
        const colors = JSON.parse(mockProduct.colors);
        const colorIndex = colors.findIndex(color => color.name === cartItem.color);
        
        if (colorIndex >= 0 && colorIndex < mockProduct.images.length) {
          selectedImage = mockProduct.images[colorIndex];
        }
        
        console.log(`✅ Cart item with color "${cartItem.color}" should show image: ${selectedImage}`);
      } catch (error) {
        console.log('❌ Error parsing colors:', error);
      }
    }
  });
};

testCartColors();
