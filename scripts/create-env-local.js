#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Firebase Admin SDK Configuration
# Replace these placeholder values with your actual Firebase service account credentials

# Project ID (this is correct)
FIREBASE_PROJECT_ID=cadeala-cd61d

# Service Account Email (replace with your actual service account email)
# Get this from Firebase Console > Project Settings > Service Accounts
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cadeala-cd61d.iam.gserviceaccount.com

# Private Key (replace with your actual private key)
# Get this from the downloaded JSON file from Firebase Console
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

# Instructions:
# 1. Go to https://console.firebase.google.com/
# 2. Select project: cadeala-cd61d
# 3. Go to Project Settings (gear icon) > Service Accounts
# 4. Click "Generate new private key"
# 5. Download the JSON file
# 6. Copy the values from the JSON file to replace the placeholders above
# 7. Make sure to keep the private key secure and never commit it to version control

# Example of what the values should look like:
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@cadeala-cd61d.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists!');
    console.log('📝 If you want to update it, please delete the existing file first.');
    console.log('📄 Current content:');
    console.log(fs.readFileSync(envPath, 'utf8'));
    return;
  }

  // Create the .env.local file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env.local file created successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select project: cadeala-cd61d');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Download the JSON file');
  console.log('6. Open .env.local and replace the placeholder values');
  console.log('');
  console.log('🔒 Security Note: Never commit .env.local to version control!');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  console.log('');
  console.log('📝 Manual creation:');
  console.log('Create a file named .env.local in your project root with this content:');
  console.log('');
  console.log(envContent);
}
