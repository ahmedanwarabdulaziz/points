'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as AppUser, Business } from '@/types';
import { generateCustomerCode, generateQRCodeUrl } from '@/lib/customerCode';
import { generateBusinessPrefix } from '@/lib/businessPrefix';

// Generate a unique referral code
  const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const assignCustomerToBusiness = async (customerId: string, businessId: string, classId: string, referredBy?: string) => {
    try {
      console.log('🔍 assignCustomerToBusiness called with:', { customerId, businessId, classId, referredBy });
      
      const customerRef = doc(db, 'users', customerId);
      console.log('🔍 Updating customer document:', customerRef.path);
      
      // Ensure business has a prefix first
      console.log('🔍 Ensuring business has prefix...');
      await generateBusinessPrefix('Business', businessId);
      
      // Generate customer code if not already exists
      const customerDoc = await getDoc(customerRef);
      const customerData = customerDoc.data();
      
      let customerCode = customerData?.customerCode;
      let qrCodeUrl = customerData?.qrCodeUrl;
      
      if (!customerCode) {
        console.log('🔍 Generating customer code for customer:', customerId);
        customerCode = await generateCustomerCode(customerId, businessId);
        qrCodeUrl = generateQRCodeUrl(customerCode);
        console.log('✅ Generated customer code:', customerCode);
      }
      
      await updateDoc(customerRef, {
        businessId: businessId,
        classId: classId,
        referredBy: referredBy || null,
        customerCode: customerCode,
        qrCodeUrl: qrCodeUrl,
        updatedAt: new Date(),
        lastActivity: new Date()
      });

      console.log('✅ Customer document updated successfully');

      // Update the customer data in state if it's the current user
      // Note: This function is called from outside the component context
      // so we can't access appUser state directly here
      console.log('✅ Customer assigned to business and class:', { customerId, businessId, classId });
    } catch (error) {
      console.error('❌ Error assigning customer to business:', error);
      throw error;
    }
  };

  const validateAndFixCustomerAssignment = async (customerId: string) => {
    try {
      console.log('🔍 Validating customer assignment:', customerId);
      
      const customerRef = doc(db, 'users', customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        console.error('❌ Customer document not found:', customerId);
        return false;
      }
      
      const customerData = customerDoc.data();
      
      // Check if customer has businessId and classId
      if (!customerData.businessId || !customerData.classId) {
        console.log('⚠️ Customer missing business/class assignment:', {
          customerId,
          businessId: customerData.businessId || 'MISSING',
          classId: customerData.classId || 'MISSING'
        });
        
        // Try to find a default business and class to assign
        const businessesQuery = query(collection(db, 'businesses'), where('status', '==', 'approved'));
        const businessesSnapshot = await getDocs(businessesQuery);
        
        if (businessesSnapshot.empty) {
          console.error('❌ No approved businesses found for assignment');
          return false;
        }
        
        // Get the first approved business
        const businessDoc = businessesSnapshot.docs[0];
        const businessId = businessDoc.id;
        
        // Find the General class for this business
        const classesQuery = query(
          collection(db, 'customerClasses'),
          where('businessId', '==', businessId),
          where('name', '==', 'General')
        );
        const classesSnapshot = await getDocs(classesQuery);
        
        if (classesSnapshot.empty) {
          console.error('❌ No General class found for business:', businessId);
          return false;
        }
        
        const classId = classesSnapshot.docs[0].id;
        
        // Assign customer to business and class
        await assignCustomerToBusiness(customerId, businessId, classId);
        
        console.log('✅ Customer auto-assigned to business and class:', { customerId, businessId, classId });
        return true;
      }
      
      // Validate that the assigned business and class exist
      const businessDoc = await getDoc(doc(db, 'businesses', customerData.businessId));
      const classDoc = await getDoc(doc(db, 'customerClasses', customerData.classId));
      
      if (!businessDoc.exists()) {
        console.error('❌ Assigned business not found:', customerData.businessId);
        return false;
      }
      
      if (!classDoc.exists()) {
        console.error('❌ Assigned class not found:', customerData.classId);
        return false;
      }
      
      console.log('✅ Customer assignment is valid:', {
        customerId,
        business: businessDoc.data().name,
        class: classDoc.data().name
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error validating customer assignment:', error);
      return false;
    }
  };

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  business: Business | null;
  customer: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'admin' | 'business' | 'customer', customerName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: 'admin' | 'business' | 'customer') => Promise<void>;
  assignCustomerToBusiness: (customerId: string, businessId: string, classId: string, referredBy?: string) => Promise<void>;
  validateAndFixCustomerAssignment: (customerId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  business: null,
  customer: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  updateUserRole: async () => {},
  assignCustomerToBusiness: async () => {},
  validateAndFixCustomerAssignment: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [customer, setCustomer] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            setAppUser(userData);
            
            // Fetch business data if user is a business
            if (userData.role === 'business') {
              const businessDoc = await getDoc(doc(db, 'businesses', user.uid));
              if (businessDoc.exists()) {
                setBusiness(businessDoc.data() as Business);
              }
            } else {
              setBusiness(null);
            }
            
            // Customer data is now part of the user document
            if (userData.role === 'customer') {
              // Customer data is already in userData, no need to fetch separately
              setCustomer(userData);
            } else {
              setCustomer(null);
            }
          } else {
            // User document doesn't exist, create it
            const userData: AppUser = {
              id: user.uid,
              email: user.email!,
              role: 'customer', // Default role
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(doc(db, 'users', user.uid), userData);
            setAppUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAppUser(null);
          setBusiness(null);
          setCustomer(null);
        }
      } else {
        setAppUser(null);
        setBusiness(null);
        setCustomer(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('❌ Signin error:', error);
      
      // Handle specific Firebase Auth errors
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found') {
          throw new Error('No account found with this email address. Please sign up first.');
        } else if (firebaseError.code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please try again.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else if (firebaseError.code === 'auth/user-disabled') {
          throw new Error('This account has been disabled. Please contact support.');
        } else if (firebaseError.code === 'auth/too-many-requests') {
          throw new Error('Too many failed attempts. Please try again later.');
        }
      }
      throw new Error('Sign in failed. Please check your credentials and try again.');
    }
  };

  const signUp = async (email: string, password: string, role: 'admin' | 'business' | 'customer' = 'customer', customerName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create unified user document in Firestore
      const userData: AppUser = {
        id: user.uid,
        email: user.email!,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add customer-specific fields if role is customer
      if (role === 'customer' && customerName) {
        userData.name = customerName;
        // Note: businessId and classId will be assigned when they scan QR or use referral
        // For now, they remain empty until customer joins a business
        userData.businessId = ''; // Will be assigned when they scan QR or use referral
        userData.classId = ''; // Will be assigned when they scan QR or use referral
        userData.referralCode = generateReferralCode();
        userData.points = 0;
        userData.totalEarned = 0;
        userData.totalRedeemed = 0;
        userData.status = 'active';
        userData.lastActivity = new Date();
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      setAppUser(userData);
    } catch (error: unknown) {
      console.error('❌ Signup error:', error);
      
      // Handle specific Firebase Auth errors
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          throw new Error('This email address is already registered. Please use a different email or try signing in instead.');
        } else if (firebaseError.code === 'auth/weak-password') {
          throw new Error('Password is too weak. Please choose a stronger password.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        } else if (firebaseError.code === 'auth/operation-not-allowed') {
          throw new Error('Email/password accounts are not enabled. Please contact support.');
        }
      }
      throw new Error('Signup failed. Please try again later.');
    }
  };

  const updateUserRole = async (role: 'admin' | 'business' | 'customer') => {
    if (!user) return;
    
    await updateDoc(doc(db, 'users', user.uid), {
      role,
      updatedAt: new Date(),
    });
    
    setAppUser(prev => prev ? { ...prev, role, updatedAt: new Date() } : null);
  };

  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
    setBusiness(null);
    setCustomer(null);
  };

  const value = {
    user,
    appUser,
    business,
    customer,
    loading,
    signIn,
    signUp,
    logout,
    updateUserRole,
    assignCustomerToBusiness,
    validateAndFixCustomerAssignment,
  };

  // Debug: Log the function availability
  console.log('🔍 AuthContext value validateAndFixCustomerAssignment:', typeof validateAndFixCustomerAssignment);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
