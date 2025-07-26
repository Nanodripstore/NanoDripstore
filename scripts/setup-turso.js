#!/usr/bin/env node
/**
 * Turso Database Migration Script
 * This script helps you set up your Turso database with the required schema
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Turso Database Migration Script');
console.log('=====================================');

// Check if environment variables are set
const requiredEnvVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.log('\n📝 Please set these in your .env.local file and try again.');
  console.log('📖 See TURSO_SETUP.md for detailed instructions.');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('📦 Pushing schema to Turso database...');

try {
  // Push the schema to Turso
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Schema pushed successfully!');
  console.log('🎉 Your Turso database is ready to use!');
  
} catch (error) {
  console.error('❌ Failed to push schema to Turso:');
  console.error(error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Verify your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
  console.log('2. Make sure your Turso database exists');
  console.log('3. Check your internet connection');
  process.exit(1);
}
