/**
 * Generate Customer Codes for Existing Customers
 * 
 * This script generates customer codes for all existing customers who don't have one yet.
 * Run this script to ensure all customers have QR codes.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * Generate a unique customer code for a customer
 */
async function generateCustomerCode(customerId, businessId) {
  try {
    console.log(`🔍 Generating customer code for customer: ${customerId} in business: ${businessId}`);
    
    // Get the business prefix
    const businessPrefixDoc = await db.collection('businessPrefixes').doc(businessId).get();
    if (!businessPrefixDoc.exists) {
      console.log(`⚠️ No business prefix found for business: ${businessId}`);
      return null;
    }
    
    const businessPrefix = businessPrefixDoc.data().prefix;
    console.log(`📋 Business prefix: ${businessPrefix}`);
    
    // Get all existing customer codes for this business
    const existingCodesSnapshot = await db.collection('users')
      .where('businessId', '==', businessId)
      .where('customerCode', '!=', null)
      .get();
    
    const existingCodes = existingCodesSnapshot.docs.map(doc => doc.data().customerCode).filter(Boolean);
    console.log(`📊 Found ${existingCodes.length} existing customer codes`);
    
    // Generate a unique code
    let customerCode;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      customerCode = `${businessPrefix}${randomNumber}`;
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique customer code after maximum attempts');
      }
    } while (existingCodes.includes(customerCode));
    
    console.log(`✅ Generated unique customer code: ${customerCode}`);
    return customerCode;
  } catch (error) {
    console.error(`❌ Error generating customer code for ${customerId}:`, error);
    return null;
  }
}

/**
 * Generate QR code URL for customer code
 */
function generateQRCodeUrl(customerCode) {
  return `https://cadeala.com/send-points?code=${customerCode}`;
}

/**
 * Main function to generate customer codes for all customers
 */
async function generateCustomerCodesForAllCustomers() {
  try {
    console.log('🚀 Starting customer code generation for all customers...');
    
    // Get all customers
    const customersSnapshot = await db.collection('users')
      .where('role', '==', 'customer')
      .get();
    
    console.log(`📊 Found ${customersSnapshot.docs.length} customers`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const customerDoc of customersSnapshot.docs) {
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;
      
      // Skip if customer already has a code
      if (customerData.customerCode) {
        console.log(`⏭️ Customer ${customerId} already has code: ${customerData.customerCode}`);
        continue;
      }
      
      // Skip if customer doesn't have a businessId
      if (!customerData.businessId) {
        console.log(`⚠️ Customer ${customerId} has no businessId, skipping`);
        continue;
      }
      
      try {
        console.log(`\n🔄 Processing customer: ${customerId} (${customerData.name || 'No name'})`);
        
        // Generate customer code
        const customerCode = await generateCustomerCode(customerId, customerData.businessId);
        
        if (customerCode) {
          // Generate QR code URL
          const qrCodeUrl = generateQRCodeUrl(customerCode);
          
          // Update customer document
          await db.collection('users').doc(customerId).update({
            customerCode: customerCode,
            qrCodeUrl: qrCodeUrl,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Updated customer ${customerId} with code: ${customerCode}`);
          successCount++;
        } else {
          console.log(`❌ Failed to generate code for customer ${customerId}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing customer ${customerId}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully processed: ${successCount} customers`);
    console.log(`❌ Errors: ${errorCount} customers`);
    console.log(`📊 Total customers: ${customersSnapshot.docs.length}`);
    
  } catch (error) {
    console.error('❌ Error in main function:', error);
  }
}

// Run the script
if (require.main === module) {
  generateCustomerCodesForAllCustomers()
    .then(() => {
      console.log('🎉 Customer code generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  generateCustomerCodesForAllCustomers,
  generateCustomerCode
};
