#!/usr/bin/env node

/**
 * Test script to demonstrate enhanced email normalization
 * Shows how various email formats are normalized to prevent duplicates
 */

// Copy of the normalizeEmail function from lib/utils.ts
function normalizeEmail(email) {
  if (!email) return email;
  
  // Convert to lowercase and trim whitespace
  const lowercaseEmail = email.toLowerCase().trim();
  
  const [username, domain] = lowercaseEmail.split('@');
  
  if (!username || !domain) return lowercaseEmail;
  
  let normalizedUsername = username;
  
  // Gmail and Google Workspace domains
  const gmailDomains = ['gmail.com', 'googlemail.com'];
  const isGmail = gmailDomains.includes(domain);
  
  if (isGmail) {
    // For Gmail: remove dots and handle plus addressing
    normalizedUsername = username.replace(/\./g, ''); // Remove dots
    normalizedUsername = normalizedUsername.split('+')[0]; // Remove everything after +
  } else {
    // For other providers, handle common normalization patterns
    
    // Remove dots for providers that ignore them
    const dotsIgnoredDomains = [
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com', // Microsoft
      'yahoo.com', 'ymail.com', 'rocketmail.com', // Yahoo (some configurations)
    ];
    
    if (dotsIgnoredDomains.includes(domain)) {
      normalizedUsername = normalizedUsername.replace(/\./g, '');
    }
    
    // Handle plus addressing for providers that support it
    const plusAddressingDomains = [
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com', // Microsoft
      'yahoo.com', 'ymail.com', 'rocketmail.com', // Yahoo
      'icloud.com', 'me.com', 'mac.com', // Apple
      'protonmail.com', 'proton.me', // ProtonMail
      'fastmail.com', 'fastmail.fm', // FastMail
    ];
    
    if (plusAddressingDomains.includes(domain)) {
      normalizedUsername = normalizedUsername.split('+')[0];
    }
  }
  
  // Remove common alternative characters that might be treated as equivalent
  normalizedUsername = normalizedUsername
    .replace(/[_-]/g, '') // Remove underscores and hyphens (some providers ignore these)
    .replace(/\s+/g, ''); // Remove any remaining whitespace
  
  return `${normalizedUsername}@${domain}`;
}

// Test cases demonstrating various normalizations
const testEmails = [
  // Gmail variations
  'john.doe@gmail.com',
  'johndoe@gmail.com',
  'j.o.h.n.d.o.e@gmail.com',
  'john.doe+shopping@gmail.com',
  'john.doe+newsletter@gmail.com',
  'John.Doe@Gmail.com',
  'JOHN.DOE@GMAIL.COM',
  
  // Google Workspace
  'jane.smith@googlemail.com',
  'janesmith@googlemail.com',
  
  // Microsoft variations
  'user.name@outlook.com',
  'username@outlook.com',
  'user.name+tag@hotmail.com',
  'user_name@live.com',
  'user-name@msn.com',
  
  // Yahoo variations
  'test.user@yahoo.com',
  'testuser@yahoo.com',
  'test.user+tag@ymail.com',
  
  // Apple variations
  'apple.user+tag@icloud.com',
  'apple_user@me.com',
  'apple-user@mac.com',
  
  // ProtonMail variations
  'proton.user+tag@protonmail.com',
  'proton_user@proton.me',
  
  // Other providers (minimal normalization)
  'user.name@otherprovider.com',
  'User.Name+Tag@SomeProvider.org',
];

console.log('🧪 Enhanced Email Normalization Test Results:');
console.log('=' * 60);

const normalizedGroups = new Map();

testEmails.forEach(email => {
  const normalized = normalizeEmail(email);
  const original = normalizedGroups.get(normalized) || [];
  original.push(email);
  normalizedGroups.set(normalized, original);
});

normalizedGroups.forEach((emails, normalized) => {
  if (emails.length > 1) {
    console.log(`\n📧 Normalized to: ${normalized}`);
    console.log('   Original variations:');
    emails.forEach(email => {
      console.log(`   - ${email}`);
    });
  } else {
    console.log(`\n✅ ${emails[0]} → ${normalized}`);
  }
});

console.log('\n🎯 Summary:');
console.log(`- Total test emails: ${testEmails.length}`);
console.log(`- Unique normalized emails: ${normalizedGroups.size}`);
console.log(`- Duplicate groups prevented: ${testEmails.length - normalizedGroups.size}`);

console.log('\n🛡️  Characters handled:');
console.log('- Dots (.) in Gmail and some other providers');
console.log('- Plus addressing (+tag) for multiple providers');
console.log('- Underscores (_) and hyphens (-) normalization');
console.log('- Case normalization (uppercase/lowercase)');
console.log('- Whitespace trimming');
