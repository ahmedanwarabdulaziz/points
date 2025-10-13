/**
 * Customer ID Generator
 * Generates unique customer IDs in format: AB1234 (2 letters + 4 numbers)
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Generate a random customer ID in format: AB1234
 * 2 uppercase letters + 4 digits
 */
export const generateCustomerId = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));
  const numbers = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  
  return `${letter1}${letter2}${numbers}`;
};

/**
 * Check if a customer ID already exists
 */
export const customerIdExists = async (customerId: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('customerId', '==', customerId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking customer ID:', error);
    return false;
  }
};

/**
 * Generate a unique customer ID (checks for duplicates)
 */
export const generateUniqueCustomerId = async (maxAttempts: number = 10): Promise<string> => {
  for (let i = 0; i < maxAttempts; i++) {
    const customerId = generateCustomerId();
    const exists = await customerIdExists(customerId);
    
    if (!exists) {
      console.log('✅ Generated unique customer ID:', customerId);
      return customerId;
    }
    
    console.log('⚠️ Customer ID already exists, generating new one...', customerId);
  }
  
  // Fallback: add timestamp suffix if we can't find unique ID
  const fallbackId = generateCustomerId() + Date.now().toString().slice(-2);
  console.log('⚠️ Using fallback customer ID:', fallbackId);
  return fallbackId;
};

/**
 * Validate customer ID format
 */
export const isValidCustomerId = (customerId: string): boolean => {
  // Check format: 2 letters + 4 numbers (exactly 6 characters)
  const regex = /^[A-Z]{2}\d{4}$/;
  return regex.test(customerId);
};


