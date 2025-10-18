#!/usr/bin/env node

console.log('🔍 CADEALA Environment Variables Checker');
console.log('=====================================\n');

// Check if we're in Vercel environment
const isVercel = process.env.VERCEL === '1';
console.log(`🌐 Environment: ${isVercel ? 'Vercel' : 'Local'}`);

// Required environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'NEXT_PUBLIC_CLOUDINARY_API_SECRET'
];

console.log('\n📋 Environment Variables Status:');
console.log('================================');

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ MISSING';
  const displayValue = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'Not set';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    allSet = false;
  }
});

console.log('\n🎯 Summary:');
console.log('===========');

if (allSet) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log('❌ Some environment variables are missing.');
  console.log('\n📝 To fix this in Vercel:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add the missing variables with their values');
  console.log('5. Redeploy your project');
}

console.log('\n🔧 Firebase Configuration:');
console.log('========================');
console.log(`API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing'}`);
console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing'}`);
console.log(`Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Missing'}`);

console.log('\n☁️ Cloudinary Configuration:');
console.log('===========================');
console.log(`Cloud Name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Missing'}`);
console.log(`API Key: ${process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'Set' : 'Missing'}`);
console.log(`API Secret: ${process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET ? 'Set' : 'Missing'}`);

if (isVercel) {
  console.log('\n🚀 Vercel Deployment Info:');
  console.log('==========================');
  console.log(`Vercel URL: ${process.env.VERCEL_URL || 'Not available'}`);
  console.log(`Deployment ID: ${process.env.VERCEL_DEPLOYMENT_ID || 'Not available'}`);
  console.log(`Git Commit: ${process.env.VERCEL_GIT_COMMIT_SHA || 'Not available'}`);
}
