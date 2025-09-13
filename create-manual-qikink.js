/**
 * Manual Qikink order creation for the missed order
 */

const createManualQikinkOrder = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔧 Creating manual Qikink order for the missed payment...\n');
  
  try {
    // Get the order details from the recent payment
    const orderNumber = '1757755977744'; // From the logs
    
    const response = await fetch(`${baseUrl}/api/test/manual-qikink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: orderNumber,
        testMode: true
      })
    });
    
    const result = await response.json();
    console.log('✅ Manual Qikink order result:', result);
    
  } catch (error) {
    console.log('❌ Manual order creation failed:', error.message);
  }
};

createManualQikinkOrder();