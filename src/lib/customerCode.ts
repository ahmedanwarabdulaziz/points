/**
 * Customer Code Generation System
 * 
 * This file handles the generation of unique customer codes in the format:
 * [2 letters][5 numbers] e.g., "AH12345"
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getBusinessPrefix } from './businessPrefix';

/**
 * Generate a unique customer code for a customer
 * @param customerId - The customer ID
 * @param businessId - The business ID
 * @returns Promise<string> - The generated customer code
 */
export async function generateCustomerCode(customerId: string, businessId: string): Promise<string> {
  try {
    console.log(`🔍 Generating customer code for customer: ${customerId} in business: ${businessId}`);
    
    // Get the business prefix
    const businessPrefix = await getBusinessPrefix(businessId);
    if (!businessPrefix) {
      throw new Error('Business prefix not found. Please ensure business has a valid prefix.');
    }
    
    console.log(`📋 Business prefix: ${businessPrefix}`);
    
    // Get all existing customer codes for this business
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('businessId', '==', businessId));
    const snapshot = await getDocs(q);
    
    const existingCodes = snapshot.docs
      .map(doc => doc.data().customerCode)
      .filter(code => code && code.startsWith(businessPrefix));
    
    console.log(`📋 Existing customer codes: ${existingCodes.join(', ')}`);
    
    // Generate unique 5-digit number
    const customerNumber = generateUniqueNumber(existingCodes, businessPrefix);
    const customerCode = businessPrefix + customerNumber;
    
    console.log(`✅ Generated customer code: ${customerCode}`);
    
    // Update the customer document with the new code
    await updateCustomerCode(customerId, customerCode);
    
    return customerCode;
    
  } catch (error) {
    console.error('❌ Error generating customer code:', error);
    throw error;
  }
}

/**
 * Generate a unique 5-digit number that doesn't conflict with existing codes
 */
function generateUniqueNumber(existingCodes: string[], businessPrefix: string): string {
  const maxAttempts = 1000;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Generate a 5-digit number
    const number = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const fullCode = businessPrefix + number;
    
    if (!existingCodes.includes(fullCode)) {
      console.log(`🎲 Generated unique number: ${number}`);
      return number;
    }
    
    attempts++;
  }
  
  // If we can't find a unique number, use timestamp-based approach
  const timestamp = Date.now().toString().slice(-5);
  console.log(`🎲 Using timestamp-based number: ${timestamp}`);
  return timestamp;
}

/**
 * Update the customer document with the new customer code
 */
async function updateCustomerCode(customerId: string, customerCode: string): Promise<void> {
  try {
    const customerRef = doc(db, 'users', customerId);
    await updateDoc(customerRef, {
      customerCode,
      updatedAt: new Date()
    });
    
    console.log(`✅ Updated customer ${customerId} with code ${customerCode}`);
  } catch (error) {
    console.error('❌ Error updating customer code:', error);
    throw error;
  }
}

/**
 * Generate QR code URL for a customer code
 * @param customerCode - The customer code
 * @returns string - The QR code URL
 */
export function generateQRCodeUrl(customerCode: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  return `${baseUrl}/send-points?code=${customerCode}`;
}

/**
 * Get customer by customer code
 * @param customerCode - The customer code to search for
 * @returns Promise<User | null> - The customer or null if not found
 */
export async function getCustomerByCode(customerCode: string): Promise<{id: string; name: string; customerCode: string; businessId: string; points?: number} | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('customerCode', '==', customerCode));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const customerData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...customerData
    } as { id: string; name: string; customerCode: string; businessId: string; points?: number };
  } catch (error) {
    console.error('❌ Error getting customer by code:', error);
    return null;
  }
}

/**
 * Validate customer code format
 * @param code - The code to validate
 * @returns boolean - True if valid format
 */
export function validateCustomerCode(code: string): boolean {
  // Format: 2 letters + 5 numbers
  const pattern = /^[A-Z]{2}\d{5}$/;
  return pattern.test(code);
}
