import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { User, ReferralRecord, ReferralSettings } from '@/types';
import QRCode from 'qrcode';

/**
 * Generate a unique referral code for a customer
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a referral link for a customer
 */
export function generateReferralLink(customerId: string, businessId: string, classId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  // Note: We don't include classId in the URL since we'll always use the referral class
  return `${baseUrl}/referral-signup?ref=${customerId}&business=${businessId}`;
}

/**
 * Generate QR code for referral link
 */
export async function generateReferralQRCode(customerId: string, businessId: string, classId: string): Promise<string> {
  const referralLink = generateReferralLink(customerId, businessId, classId);
  
  return QRCode.toDataURL(referralLink, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1e3a8a', // Navy blue
      light: '#ffffff', // White
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Get referral settings for a business
 */
export async function getBusinessReferralSettings(businessId: string): Promise<ReferralSettings | null> {
  try {
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    if (businessDoc.exists()) {
      const businessData = businessDoc.data();
      return businessData.referralSettings || {
        enabled: true,
        referrerPoints: 100,
        refereePoints: 50,
        maxReferralsPerCustomer: 10,
        expiryDays: 30
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching referral settings:', error);
    return null;
  }
}

/**
 * Update referral settings for a business
 */
export async function updateBusinessReferralSettings(
  businessId: string, 
  settings: ReferralSettings
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'businesses', businessId), {
      referralSettings: settings
    });
    return true;
  } catch (error) {
    console.error('Error updating referral settings:', error);
    return false;
  }
}

/**
 * Create a referral record when someone signs up via referral
 */
export async function createReferralRecord(
  referrerId: string,
  refereeId: string,
  refereeEmail: string,
  refereeName: string,
  businessId: string,
  classId: string,
  referrerPoints: number,
  refereePoints: number
): Promise<string | null> {
  try {
    const referralRecord: Omit<ReferralRecord, 'id'> = {
      referrerId,
      refereeId,
      refereeEmail,
      refereeName,
      businessId,
      classId,
      status: 'completed',
      referrerPoints,
      refereePoints,
      createdAt: new Date(),
      completedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'referrals'), referralRecord);
    return docRef.id;
  } catch (error) {
    console.error('Error creating referral record:', error);
    return null;
  }
}

/**
 * Award points to referrer and referee
 */
export async function awardReferralPoints(
  referrerId: string,
  refereeId: string,
  referrerPoints: number,
  refereePoints: number
): Promise<boolean> {
  try {
    // Update referrer's points
    const referrerDoc = await getDoc(doc(db, 'users', referrerId));
    if (referrerDoc.exists()) {
      const referrerData = referrerDoc.data() as User;
      const newPoints = (referrerData.points || 0) + referrerPoints;
      const newTotalEarned = (referrerData.totalEarned || 0) + referrerPoints;
      const newReferralCount = (referrerData.referralCount || 0) + 1;
      const newReferralPoints = (referrerData.referralPoints || 0) + referrerPoints;

      await updateDoc(doc(db, 'users', referrerId), {
        points: newPoints,
        totalEarned: newTotalEarned,
        referralCount: newReferralCount,
        referralPoints: newReferralPoints,
        updatedAt: new Date()
      });
    }

    // Update referee's points
    const refereeDoc = await getDoc(doc(db, 'users', refereeId));
    if (refereeDoc.exists()) {
      const refereeData = refereeDoc.data() as User;
      const newPoints = (refereeData.points || 0) + refereePoints;
      const newTotalEarned = (refereeData.totalEarned || 0) + refereePoints;

      await updateDoc(doc(db, 'users', refereeId), {
        points: newPoints,
        totalEarned: newTotalEarned,
        updatedAt: new Date()
      });
    }

    return true;
  } catch (error) {
    console.error('Error awarding referral points:', error);
    return false;
  }
}

/**
 * Get referral history for a customer
 */
export async function getCustomerReferralHistory(customerId: string): Promise<ReferralRecord[]> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', customerId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ReferralRecord));
  } catch (error) {
    console.error('Error fetching referral history:', error);
    return [];
  }
}

/**
 * Get referral analytics for a business
 */
export async function getBusinessReferralAnalytics(businessId: string): Promise<{
  totalReferrals: number;
  totalReferrerPoints: number;
  totalRefereePoints: number;
  recentReferrals: ReferralRecord[];
}> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('businessId', '==', businessId)
    );
    const querySnapshot = await getDocs(q);
    
    const referrals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ReferralRecord));

    const totalReferrals = referrals.length;
    const totalReferrerPoints = referrals.reduce((sum, ref) => sum + ref.referrerPoints, 0);
    const totalRefereePoints = referrals.reduce((sum, ref) => sum + ref.refereePoints, 0);
    const recentReferrals = referrals
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalReferrals,
      totalReferrerPoints,
      totalRefereePoints,
      recentReferrals
    };
  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    return {
      totalReferrals: 0,
      totalReferrerPoints: 0,
      totalRefereePoints: 0,
      recentReferrals: []
    };
  }
}

/**
 * Validate referral code and get referrer info
 */
export async function validateReferralCode(referralCode: string): Promise<{
  isValid: boolean;
  referrer?: User;
  businessId?: string;
  classId?: string;
}> {
  try {
    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode),
      where('role', '==', 'customer')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { isValid: false };
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerData = referrerDoc.data() as User;
    
    return {
      isValid: true,
      referrer: referrerData,
      businessId: referrerData.businessId,
      classId: referrerData.classId
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { isValid: false };
  }
}

/**
 * Validate referral by customer ID and get referrer info
 */
export async function validateReferralByCustomerId(customerId: string): Promise<{
  isValid: boolean;
  referrer?: User;
  businessId?: string;
  classId?: string;
}> {
  try {
    console.log('🔍 Validating customer ID:', customerId);
    const userDoc = await getDoc(doc(db, 'users', customerId));
    
    if (!userDoc.exists()) {
      console.error('❌ User document does not exist for ID:', customerId);
      return { isValid: false };
    }

    const referrerData = userDoc.data() as User;
    console.log('🔍 User data found:', {
      id: referrerData.id,
      role: referrerData.role,
      businessId: referrerData.businessId,
      classId: referrerData.classId,
      name: referrerData.name
    });
    
    // Check if user is a customer and has business/class assigned
    if (referrerData.role !== 'customer') {
      console.error('❌ User is not a customer, role:', referrerData.role);
      return { isValid: false };
    }
    
    if (!referrerData.businessId) {
      console.error('❌ User has no businessId');
      return { isValid: false };
    }
    
    if (!referrerData.classId) {
      console.error('❌ User has no classId');
      return { isValid: false };
    }
    
    console.log('✅ Referral validation successful');
    return {
      isValid: true,
      referrer: referrerData,
      businessId: referrerData.businessId,
      classId: referrerData.classId
    };
  } catch (error) {
    console.error('Error validating referral by customer ID:', error);
    return { isValid: false };
  }
}
