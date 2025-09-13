// Debug utility to test Razorpay configuration
// Run this in browser console on checkout page to debug issues

window.razorpayDebug = {
  // Test payment with minimal data
  testBasicPayment: () => {
    const options = {
      key: 'rzp_test_RGp69ZrZQmsQGG',
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      name: 'NanoDrip Store Test',
      description: 'Test Payment',
      order_id: 'test_order_' + Date.now(),
      prefill: {
        name: 'Rahul Kumar',
        email: 'test@razorpay.com',
        contact: '+919999999999'
      },
      theme: {
        color: '#000000'
      },
      handler: (response) => {
        console.log('✅ Payment Success:', response);
        alert('Payment Successful! Check console for details.');
      },
      modal: {
        ondismiss: () => {
          console.log('❌ Payment Dismissed');
          alert('Payment was dismissed');
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      console.error('Razorpay not loaded');
    }
  },

  // Check current configuration
  checkConfig: () => {
    console.log('🔍 Razorpay Debug Info:');
    console.log('- Razorpay loaded:', !!window.Razorpay);
    console.log('- Key ID:', 'rzp_test_RGp69ZrZQmsQGG');
    console.log('- Environment:', 'test');
    
    // Check if API is working
    fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100, currency: 'INR' })
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ API Test:', data);
    })
    .catch(err => {
      console.error('❌ API Error:', err);
    });
  },

  // Load Razorpay script manually
  loadScript: () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      window.razorpayDebug.testBasicPayment();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
    };
    document.head.appendChild(script);
  }
};

console.log('🚀 Razorpay Debug Utils Loaded!');
console.log('Usage:');
console.log('- window.razorpayDebug.checkConfig() - Check configuration');
console.log('- window.razorpayDebug.testBasicPayment() - Test payment');
console.log('- window.razorpayDebug.loadScript() - Load and test');
