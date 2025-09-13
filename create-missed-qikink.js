/**
 * Create manual Qikink order for the most recent missed payment
 */

const createMissedQikinkOrder = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🎯 Creating Qikink order for missed payment...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/test/manual-qikink-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: '1757756363374' // The most recent order that was missed
      })
    });
    
    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
};

createMissedQikinkOrder();