'use client';

import { createContext, useContext, useEffect, useState } from &apos;react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from &apos;firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from &apos;firebase/firestore';
import { auth, db } from &apos;@/lib/firebase';
import { User as AppUser, Business, Customer } from &apos;@/types';

// Generate a unique referral code
  const generateReferralCode = (): string => {
    const chars = &apos;ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = &apos;';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const assignCustomerToBusiness = async (customerId: string, businessId: string, classId: string, referredBy?: string) => {
    try {
      console.log(&apos;🔍 assignCustomerToBusiness called with:&apos;, { customerId, businessId, classId, referredBy });
      
      const customerRef = doc(db, &apos;users&apos;, customerId);
      console.log(&apos;🔍 Updating customer document:&apos;, customerRef.path);
      
      await updateDoc(customerRef, {
        businessId: businessId,
        classId: classId,
        referredBy: referredBy || null,
        updatedAt: new Date(),
        lastActivity: new Date()
      });

      console.log(&apos;✅ Customer document updated successfully&apos;);

      // Update the customer data in state if it&apos;s the current user
      if (appUser && appUser.id === customerId) {
        console.log(&apos;🔍 Updating appUser state with business/class assignment&apos;);
        setAppUser(prev => ({
          ...prev,
          businessId: businessId,
          classId: classId,
          referredBy: referredBy || null,
          updatedAt: new Date(),
          lastActivity: new Date()
        }));
      }

      console.log(&apos;✅ Customer assigned to business and class:&apos;, { customerId, businessId, classId });
    } catch (error) {
      console.error(&apos;❌ Error assigning customer to business:&apos;, error);
      throw error;
    }
  };

  const validateAndFixCustomerAssignment = async (customerId: string) => {
    try {
      console.log(&apos;🔍 Validating customer assignment:&apos;, customerId);
      
      const customerRef = doc(db, &apos;users&apos;, customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        console.error(&apos;❌ Customer document not found:&apos;, customerId);
        return false;
      }
      
      const customerData = customerDoc.data();
      
      // Check if customer has businessId and classId
      if (!customerData.businessId || !customerData.classId) {
        console.log(&apos;⚠️ Customer missing business/class assignment:&apos;, {
          customerId,
          businessId: customerData.businessId || &apos;MISSING&apos;,
          classId: customerData.classId || &apos;MISSING&apos;
        });
        
        // Try to find a default business and class to assign
        const businessesQuery = query(collection(db, &apos;businesses&apos;), where(&apos;status&apos;, &apos;==&apos;, &apos;approved&apos;));
        const businessesSnapshot = await getDocs(businessesQuery);
        
        if (businessesSnapshot.empty) {
          console.error(&apos;❌ No approved businesses found for assignment&apos;);
          return false;
        }
        
        // Get the first approved business
        const businessDoc = businessesSnapshot.docs[0];
        const businessId = businessDoc.id;
        
        // Find the General class for this business
        const classesQuery = query(
          collection(db, &apos;customerClasses&apos;),
          where(&apos;businessId&apos;, &apos;==&apos;, businessId),
          where(&apos;name&apos;, &apos;==&apos;, &apos;General&apos;)
        );
        const classesSnapshot = await getDocs(classesQuery);
        
        if (classesSnapshot.empty) {
          console.error(&apos;❌ No General class found for business:&apos;, businessId);
          return false;
        }
        
        const classId = classesSnapshot.docs[0].id;
        
        // Assign customer to business and class
        await assignCustomerToBusiness(customerId, businessId, classId);
        
        console.log(&apos;✅ Customer auto-assigned to business and class:&apos;, { customerId, businessId, classId });
        return true;
      }
      
      // Validate that the assigned business and class exist
      const businessDoc = await getDoc(doc(db, &apos;businesses&apos;, customerData.businessId));
      const classDoc = await getDoc(doc(db, &apos;customerClasses&apos;, customerData.classId));
      
      if (!businessDoc.exists()) {
        console.error(&apos;❌ Assigned business not found:&apos;, customerData.businessId);
        return false;
      }
      
      if (!classDoc.exists()) {
        console.error(&apos;❌ Assigned class not found:&apos;, customerData.classId);
        return false;
      }
      
      console.log(&apos;✅ Customer assignment is valid:&apos;, {
        customerId,
        business: businessDoc.data().name,
        class: classDoc.data().name
      });
      
      return true;
    } catch (error) {
      console.error(&apos;❌ Error validating customer assignment:&apos;, error);
      return false;
    }
  };

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  business: Business | null;
  customer: Customer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: &apos;admin&apos; | &apos;business&apos; | &apos;customer&apos;, customerName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: &apos;admin&apos; | &apos;business&apos; | &apos;customer&apos;) => Promise<void>;
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
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(&apos;useAuth must be used within an AuthProvider&apos;);
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, &apos;users&apos;, user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            setAppUser(userData);
            
            // Fetch business data if user is a business
            if (userData.role === &apos;business&apos;) {
              const businessDoc = await getDoc(doc(db, &apos;businesses&apos;, user.uid));
              if (businessDoc.exists()) {
                setBusiness(businessDoc.data() as Business);
              }
            } else {
              setBusiness(null);
            }
            
            // Customer data is now part of the user document
            if (userData.role === &apos;customer&apos;) {
              // Customer data is already in userData, no need to fetch separately
              setCustomer(userData as Customer);
            } else {
              setCustomer(null);
            }
          } else {
            // User document doesn&apos;t exist, create it
            const userData: AppUser = {
              id: user.uid,
              email: user.email!,
              role: &apos;customer&apos;, // Default role
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(doc(db, &apos;users&apos;, user.uid), userData);
            setAppUser(userData);
          }
        } catch (error) {
          console.error(&apos;Error fetching user data:&apos;, error);
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
      console.error(&apos;❌ Signin error:&apos;, error);
      
      // Handle specific Firebase Auth errors
      if (error.code === &apos;auth/user-not-found&apos;) {
        throw new Error(&apos;No account found with this email address. Please sign up first.&apos;);
      } else if (error.code === &apos;auth/wrong-password&apos;) {
        throw new Error(&apos;Incorrect password. Please try again.&apos;);
      } else if (error.code === &apos;auth/invalid-email&apos;) {
        throw new Error(&apos;Please enter a valid email address.&apos;);
      } else if (error.code === &apos;auth/user-disabled&apos;) {
        throw new Error(&apos;This account has been disabled. Please contact support.&apos;);
      } else if (error.code === &apos;auth/too-many-requests&apos;) {
        throw new Error(&apos;Too many failed attempts. Please try again later.&apos;);
      } else {
        throw new Error(&apos;Sign in failed. Please check your credentials and try again.&apos;);
      }
    }
  };

  const signUp = async (email: string, password: string, role: &apos;admin&apos; | &apos;business&apos; | &apos;customer&apos; = &apos;customer&apos;, customerName?: string) => {
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
      if (role === &apos;customer&apos; && customerName) {
        userData.name = customerName;
        // Note: businessId and classId will be assigned when they scan QR or use referral
        // For now, they remain empty until customer joins a business
        userData.businessId = &apos;'; // Will be assigned when they scan QR or use referral
        userData.classId = &apos;'; // Will be assigned when they scan QR or use referral
        userData.referralCode = generateReferralCode();
        userData.points = 0;
        userData.totalEarned = 0;
        userData.totalRedeemed = 0;
        userData.status = &apos;active';
        userData.lastActivity = new Date();
      }

      await setDoc(doc(db, &apos;users&apos;, user.uid), userData);
      setAppUser(userData);
    } catch (error: unknown) {
      console.error(&apos;❌ Signup error:&apos;, error);
      
      // Handle specific Firebase Auth errors
      if (error.code === &apos;auth/email-already-in-use&apos;) {
        throw new Error(&apos;This email address is already registered. Please use a different email or try signing in instead.&apos;);
      } else if (error.code === &apos;auth/weak-password&apos;) {
        throw new Error(&apos;Password is too weak. Please choose a stronger password.&apos;);
      } else if (error.code === &apos;auth/invalid-email&apos;) {
        throw new Error(&apos;Please enter a valid email address.&apos;);
      } else if (error.code === &apos;auth/operation-not-allowed&apos;) {
        throw new Error(&apos;Email/password accounts are not enabled. Please contact support.&apos;);
      } else {
        throw new Error(&apos;Signup failed. Please try again later.&apos;);
      }
    }
  };

  const updateUserRole = async (role: &apos;admin&apos; | &apos;business&apos; | &apos;customer&apos;) => {
    if (!user) return;
    
    await updateDoc(doc(db, &apos;users&apos;, user.uid), {
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
  console.log(&apos;🔍 AuthContext value validateAndFixCustomerAssignment:&apos;, typeof validateAndFixCustomerAssignment);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
