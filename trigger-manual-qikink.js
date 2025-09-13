/**
 * Trigger manual Qikink order creation for the missed order
 */

const triggerManualQikinkOrder = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🎯 Triggering manual Qikink order creation...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/test/manual-qikink-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: '1757755977744' // The order that was missed
      })
    });
    
    const result = await response.json();
    console.log('✅ Manual Qikink order result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Manual order creation failed:', error.message);
  }
};

triggerManualQikinkOrder();