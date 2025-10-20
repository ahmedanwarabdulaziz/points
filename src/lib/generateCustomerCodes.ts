/**
 * Generate Customer Codes for Existing Customers
 * 
 * This utility generates customer codes for customers who don't have them yet.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { generateCustomerCode, generateQRCodeUrl } from './customerCode';

/**
 * Generate customer codes for all customers in a business
 */
export async function generateCustomerCodesForBusiness(businessId: string): Promise<{
  success: number;
  errors: number;
  total: number;
}> {
  try {
    console.log(`🚀 Generating customer codes for business: ${businessId}`);
    
    // Get all customers for this business
    const customersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'customer'),
      where('businessId', '==', businessId)
    );
    
    const customersSnapshot = await getDocs(customersQuery);
    console.log(`📊 Found ${customersSnapshot.docs.length} customers for business ${businessId}`);
    
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
      
      try {
        console.log(`🔄 Processing customer: ${customerId} (${customerData.name || 'No name'})`);
        
        // Generate customer code
        const customerCode = await generateCustomerCode(customerId, businessId);
        
        if (customerCode) {
          // Generate QR code URL
          const qrCodeUrl = generateQRCodeUrl(customerCode);
          
          // Update customer document
          await updateDoc(doc(db, 'users', customerId), {
            customerCode: customerCode,
            qrCodeUrl: qrCodeUrl,
            updatedAt: new Date()
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
    
    const result = {
      success: successCount,
      errors: errorCount,
      total: customersSnapshot.docs.length
    };
    
    console.log('📊 Summary:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error generating customer codes:', error);
    throw error;
  }
}

/**
 * Generate customer code for a specific customer
 */
export async function generateCustomerCodeForCustomer(customerId: string, businessId: string): Promise<boolean> {
  try {
    console.log(`🔍 Generating customer code for customer: ${customerId}`);
    
    // Check if customer already has a code
    const customerDoc = await getDoc(doc(db, 'users', customerId));
    if (!customerDoc.exists()) {
      console.error(`❌ Customer ${customerId} not found`);
      return false;
    }
    
    const customerData = customerDoc.data();
    if (customerData.customerCode) {
      console.log(`⏭️ Customer ${customerId} already has code: ${customerData.customerCode}`);
      return true;
    }
    
    // Generate customer code
    const customerCode = await generateCustomerCode(customerId, businessId);
    
    if (customerCode) {
      // Generate QR code URL
      const qrCodeUrl = generateQRCodeUrl(customerCode);
      
      // Update customer document
      await updateDoc(doc(db, 'users', customerId), {
        customerCode: customerCode,
        qrCodeUrl: qrCodeUrl,
        updatedAt: new Date()
      });
      
      console.log(`✅ Generated customer code for ${customerId}: ${customerCode}`);
      return true;
    } else {
      console.error(`❌ Failed to generate code for customer ${customerId}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error generating customer code for ${customerId}:`, error);
    return false;
  }
}
