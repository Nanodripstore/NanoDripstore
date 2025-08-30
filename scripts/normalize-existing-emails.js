#!/usr/bin/env node

/**
 * Script to normalize existing email addresses in the database
 * This should be run once after deploying the email normalization feature
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

async function normalizeExistingEmails() {
  try {
    console.log('🔄 Starting email normalization process...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });
    
    console.log(`📊 Found ${users.length} users to check`);
    
    let updatedCount = 0;
    const duplicates = [];
    
    for (const user of users) {
      const normalizedEmail = normalizeEmail(user.email);
      
      if (normalizedEmail !== user.email) {
        console.log(`📧 Normalizing: ${user.email} → ${normalizedEmail}`);
        
        // Check if the normalized email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });
        
        if (existingUser && existingUser.id !== user.id) {
          console.log(`⚠️  Duplicate found: ${user.email} and ${existingUser.email} both normalize to ${normalizedEmail}`);
          duplicates.push({
            original1: user.email,
            original2: existingUser.email,
            normalized: normalizedEmail
          });
        } else {
          // Safe to update
          await prisma.user.update({
            where: { id: user.id },
            data: { email: normalizedEmail }
          });
          updatedCount++;
        }
      }
    }
    
    // Also normalize pending users
    const pendingUsers = await prisma.pendingUser.findMany({
      select: { id: true, email: true }
    });
    
    console.log(`📊 Found ${pendingUsers.length} pending users to check`);
    
    for (const pendingUser of pendingUsers) {
      const normalizedEmail = normalizeEmail(pendingUser.email);
      
      if (normalizedEmail !== pendingUser.email) {
        console.log(`📧 Normalizing pending user: ${pendingUser.email} → ${normalizedEmail}`);
        
        // Check if the normalized email already exists
        const existingPendingUser = await prisma.pendingUser.findUnique({
          where: { email: normalizedEmail }
        });
        
        if (existingPendingUser && existingPendingUser.id !== pendingUser.id) {
          console.log(`⚠️  Duplicate pending user found, removing older one`);
          // Remove the current pending user (keep the existing one)
          await prisma.pendingUser.delete({
            where: { id: pendingUser.id }
          });
        } else {
          // Safe to update
          await prisma.pendingUser.update({
            where: { id: pendingUser.id },
            data: { email: normalizedEmail }
          });
          updatedCount++;
        }
      }
    }
    
    console.log(`✅ Email normalization complete!`);
    console.log(`📊 Updated ${updatedCount} email addresses`);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate cases that need manual review:`);
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. "${dup.original1}" and "${dup.original2}" both normalize to "${dup.normalized}"`);
      });
      console.log(`🔧 Please manually resolve these duplicates before running the script again.`);
    }
    
  } catch (error) {
    console.error('❌ Error during email normalization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
normalizeExistingEmails();
