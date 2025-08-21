#!/usr/bin/env node

// Cache warmup script
// Run this after deployment to pre-load cache

const warmUpCache = async () => {
  try {
    console.log('Starting cache warmup...');
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/admin/warm-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cache warmup completed:', result.message);
    } else {
      console.error('❌ Cache warmup failed:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Cache warmup error:', error);
  }
};

// Run if called directly
if (require.main === module) {
  warmUpCache();
}

module.exports = { warmUpCache };
