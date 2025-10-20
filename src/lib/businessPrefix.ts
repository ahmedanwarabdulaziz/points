/**
 * Business Prefix Generation System
 * 
 * This file handles the generation of unique 2-letter prefixes for businesses
 * to be used in customer codes (e.g., "AH12345" where "AH" is the business prefix)
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';

/**
 * Generate a unique 2-letter prefix for a business
 * @param businessName - The name of the business
 * @param businessId - The ID of the business
 * @returns Promise<string> - The generated prefix
 */
export async function generateBusinessPrefix(businessName: string, businessId: string): Promise<string> {
  try {
    console.log(`🔍 Generating prefix for business: ${businessName} (${businessId})`);
    
    // Get all existing prefixes
    const prefixesRef = collection(db, 'businessPrefixes');
    const prefixesSnapshot = await getDocs(prefixesRef);
    const existingPrefixes = prefixesSnapshot.docs.map(doc => doc.data().prefix);
    
    console.log(`📋 Existing prefixes: ${existingPrefixes.join(', ')}`);
    
    // Try to generate prefix from business name
    const businessWords = businessName.trim().split(/\s+/);
    let prefix = '';
    
    // Strategy 1: First two letters of first word
    if (businessWords[0].length >= 2) {
      prefix = businessWords[0].substring(0, 2).toUpperCase();
      if (!existingPrefixes.includes(prefix)) {
        return await saveBusinessPrefix(businessId, prefix);
      }
    }
    
    // Strategy 2: First letter of first two words
    if (businessWords.length >= 2) {
      prefix = (businessWords[0][0] + businessWords[1][0]).toUpperCase();
      if (!existingPrefixes.includes(prefix)) {
        return await saveBusinessPrefix(businessId, prefix);
      }
    }
    
    // Strategy 3: First letter + second letter of first word
    if (businessWords[0].length >= 3) {
      prefix = (businessWords[0][0] + businessWords[0][2]).toUpperCase();
      if (!existingPrefixes.includes(prefix)) {
        return await saveBusinessPrefix(businessId, prefix);
      }
    }
    
    // Strategy 4: First letter + third letter of first word
    if (businessWords[0].length >= 4) {
      prefix = (businessWords[0][0] + businessWords[0][3]).toUpperCase();
      if (!existingPrefixes.includes(prefix)) {
        return await saveBusinessPrefix(businessId, prefix);
      }
    }
    
    // Strategy 5: Generate random prefix if all else fails
    prefix = generateRandomPrefix(existingPrefixes);
    return await saveBusinessPrefix(businessId, prefix);
    
  } catch (error) {
    console.error('❌ Error generating business prefix:', error);
    throw new Error('Failed to generate business prefix');
  }
}

/**
 * Save the business prefix to the database
 */
async function saveBusinessPrefix(businessId: string, prefix: string): Promise<string> {
  try {
    const prefixData = {
      businessId,
      prefix,
      createdAt: new Date()
    };
    
    await addDoc(collection(db, 'businessPrefixes'), prefixData);
    console.log(`✅ Saved prefix ${prefix} for business ${businessId}`);
    return prefix;
  } catch (error) {
    console.error('❌ Error saving business prefix:', error);
    throw error;
  }
}

/**
 * Generate a random 2-letter prefix that doesn't conflict with existing ones
 */
function generateRandomPrefix(existingPrefixes: string[]): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const prefix = letters[Math.floor(Math.random() * letters.length)] + 
                  letters[Math.floor(Math.random() * letters.length)];
    
    if (!existingPrefixes.includes(prefix)) {
      console.log(`🎲 Generated random prefix: ${prefix}`);
      return prefix;
    }
    
    attempts++;
  }
  
  // If we can't find a unique prefix, append a number
  const randomPrefix = letters[Math.floor(Math.random() * letters.length)] + 
                      letters[Math.floor(Math.random() * letters.length)];
  const numberedPrefix = randomPrefix + Math.floor(Math.random() * 10);
  
  console.log(`🎲 Generated numbered prefix: ${numberedPrefix}`);
  return numberedPrefix;
}

/**
 * Get the business prefix for a specific business
 * @param businessId - The business ID
 * @returns Promise<string | null> - The business prefix or null if not found
 */
export async function getBusinessPrefix(businessId: string): Promise<string | null> {
  try {
    const prefixesRef = collection(db, 'businessPrefixes');
    const q = query(prefixesRef, where('businessId', '==', businessId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const prefixData = snapshot.docs[0].data();
    return prefixData.prefix;
  } catch (error) {
    console.error('❌ Error getting business prefix:', error);
    return null;
  }
}
