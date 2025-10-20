#!/usr/bin/env node

/**
 * Fix Customer Codes Script
 * 
 * This script generates customer codes for customers who don't have them.
 * It ensures all customers have proper customerCode and qrCodeUrl fields.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
  authDomain: "cadeala-cd61d.firebaseapp.com",
  projectId: "cadeala-cd61d",
  storageBucket: "cadeala-cd61d.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Generate customer code function
function generateCustomerCode(customerId, businessId) {
  // Generate a unique customer code
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${businessId.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}

// Generate QR code URL function
function generateQRCodeUrl(customerCode) {
  return `https://cadeala.app/qr-signup?code=${customerCode}`;
}

async function fixCustomerCodes() {
  try {
    console.log('🔧 Starting customer code fix process...\n');
    
    // Get all customers
    const usersRef = collection(db, 'users');
    const customersQuery = query(usersRef, where('role', '==', 'customer'));
    const customersSnapshot = await getDocs(customersQuery);
    
    console.log(`📊 Found ${customersSnapshot.docs.length} customers to check`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const customerDoc of customersSnapshot.docs) {
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;
      
      console.log(`\n🔍 Checking customer: ${customerData.name || customerData.email}`);
      console.log(`   - Has customerCode: ${!!customerData.customerCode}`);
      console.log(`   - Has businessId: ${!!customerData.businessId}`);
      console.log(`   - Has classId: ${!!customerData.classId}`);
      
      // Skip if customer already has a code
      if (customerData.customerCode) {
        console.log(`   ✅ Customer already has code: ${customerData.customerCode}`);
        skippedCount++;
        continue;
      }
      
      // Skip if customer doesn't have business assignment
      if (!customerData.businessId) {
        console.log(`   ⚠️  Customer not assigned to business, skipping...`);
        skippedCount++;
        continue;
      }
      
      try {
        // Generate customer code
        const customerCode = generateCustomerCode(customerId, customerData.businessId);
        const qrCodeUrl = generateQRCodeUrl(customerCode);
        
        console.log(`   🔧 Generating code: ${customerCode}`);
        
        // Update customer document
        await updateDoc(doc(db, 'users', customerId), {
          customerCode: customerCode,
          qrCodeUrl: qrCodeUrl,
          updatedAt: new Date()
        });
        
        console.log(`   ✅ Customer code generated and saved`);
        fixedCount++;
        
      } catch (error) {
        console.log(`   ❌ Error fixing customer: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Customer code fix completed!`);
    console.log(`   - Fixed: ${fixedCount} customers`);
    console.log(`   - Skipped: ${skippedCount} customers`);
    console.log(`   - Total processed: ${customersSnapshot.docs.length} customers`);
    
  } catch (error) {
    console.error('❌ Error in fixCustomerCodes:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixCustomerCodes()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixCustomerCodes };
