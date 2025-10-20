'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Business, CustomerClass, User } from '@/types';
import { useEffect, useState, Suspense } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  Building2, 
  Users, 
  QrCode, 
  ArrowRight,
  Star,
  Gift,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { validateReferralByCustomerId, getBusinessReferralSettings } from '@/lib/referral';

function ReferralSignupContent() {
  const { assignCustomerToBusiness } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [customerClass, setCustomerClass] = useState<CustomerClass | null>(null);
  const [referralClass, setReferralClass] = useState<CustomerClass | null>(null);
  const [referrer, setReferrer] = useState<User | null>(null);
  const [referralSettings, setReferralSettings] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const referrerId = searchParams.get('ref');
  const businessId = searchParams.get('business');
  // Note: We no longer need classId from URL since we'll use the referral class

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!referrerId || !businessId) {
        setError('Invalid referral link. Please check the link and try again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        console.log('🔍 Validating referral with ID:', referrerId);
        console.log('🔍 Business ID:', businessId);

        // Validate referral by customer ID and get referrer info
        const referralValidation = await validateReferralByCustomerId(referrerId);
        console.log('🔍 Referral validation result:', referralValidation);
        
        if (!referralValidation.isValid || !referralValidation.referrer) {
          console.error('❌ Referral validation failed:', referralValidation);
          setError('Invalid referral link. Please check the link and try again.');
          setLoading(false);
          return;
        }

        setReferrer(referralValidation.referrer);

        // Fetch business data
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          setBusiness({
            id: businessDoc.id,
            name: data.name || '',
            description: data.description || '',
            ownerId: data.ownerId || '',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            settings: data.settings || {
              allowReferrals: true,
              defaultPointsPerDollar: 1
            }
          });
        }

        // Find the referral class for this business
        const referralClassQuery = query(
          collection(db, 'customerClasses'),
          where('businessId', '==', businessId),
          where('name', '==', 'Referral')
        );
        const referralClassSnapshot = await getDocs(referralClassQuery);
        
        if (!referralClassSnapshot.empty) {
          const referralClassDoc = referralClassSnapshot.docs[0];
          const referralClassData = referralClassDoc.data();
          setReferralClass({
            id: referralClassDoc.id,
            businessId: referralClassData.businessId || '',
            name: referralClassData.name || '',
            type: referralClassData.type || 'permanent',
            description: referralClassData.description || '',
            features: referralClassData.features || {},
            isActive: referralClassData.isActive !== undefined ? referralClassData.isActive : true,
            createdAt: referralClassData.createdAt?.toDate?.() || new Date(),
            updatedAt: referralClassData.updatedAt?.toDate?.() || new Date()
          });
          console.log('✅ Found referral class:', referralClassDoc.id);
        } else {
          console.error('❌ No referral class found for business:', businessId);
          setError('Referral class not found for this business. Please contact support.');
          setLoading(false);
          return;
        }

        // Get referral settings
        const settings = await getBusinessReferralSettings(businessId);
        setReferralSettings(settings);

      } catch (error: unknown) {
        console.error('❌ Error fetching referral data:', error);
        setError('Failed to load referral information.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [referrerId, businessId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!formData.password) {
      setError('Please enter a password.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSigningUp(true);

      console.log('🔍 Starting referral signup process...', { 
        referrerId, 
        businessId, 
        email: formData.email 
      });

      // Create user account using Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      console.log('✅ User account created:', user.uid);

      // Create user document with standard structure (same as regular signup)
      const userData: User = {
        id: user.uid,
        email: user.email!,
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Ensure public/global access flag is present on signup
        globalAccess: true,
        name: formData.name,
        businessId: '', // Will be set by assignCustomerToBusiness
        classId: '', // Will be set by assignCustomerToBusiness
        referralCode: generateReferralCode(),
        referredBy: referrerId!,
        points: 0, // Start with 0 points, will be updated by assignCustomerToBusiness
        totalEarned: 0,
        totalRedeemed: 0,
        status: 'active',
        lastActivity: new Date(),
        referralCount: 0,
        referralPoints: 0
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ User document created with standard structure');

      // Use the standard assignCustomerToBusiness function to ensure consistent structure
      await assignCustomerToBusiness(user.uid, businessId!, referralClass?.id || '', referrerId!);
      console.log('✅ Customer assigned to business using standard function');

      console.log('✅ Referral signup completed successfully');
      router.push('/dashboard?welcome=true&referral=true');
    } catch (error: unknown) {
      console.error('❌ Referral signup error:', error);
      
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          setError('This email address is already registered. Please use a different email or try signing in instead.');
        } else if (firebaseError.code === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSigningUp(false);
    }
  };

  // Generate referral code function
  const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral information...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">
            <QrCode className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-4">Invalid Referral Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange-light transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy mb-2">Join via Referral</h1>
            <p className="text-gray-600">You&apos;ve been invited to join {business?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Referral Info */}
        <div className="bg-gradient-to-r from-orange to-orange-light rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎉 You&apos;re Invited!</h2>
              <p className="text-orange-100 mb-4">
                {referrer?.name} invited you to join {business?.name}
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-lg font-bold">+{(referralSettings as { refereePoints?: number })?.refereePoints || 50}</div>
                  <div className="text-sm text-orange-100">Bonus Points</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-lg font-bold">+{(referralSettings as { referrerPoints?: number })?.referrerPoints || 100}</div>
                  <div className="text-sm text-orange-100">Points for {referrer?.name}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Gift className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm text-orange-100">Referral Bonus</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-navy mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Business Information
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{business?.name}</h4>
                <p className="text-gray-600 text-sm">{business?.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{referralClass?.name || 'Referral'}</h4>
                <p className="text-gray-600 text-sm">{referralClass?.description || 'Special class for referred customers'}</p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-navy mb-4 flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Create Your Account
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={signingUp}
                className="w-full bg-orange text-white py-3 px-4 rounded-lg hover:bg-orange-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {signingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join with Referral Bonus
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-navy mb-4 text-center">What You Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-orange text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-navy mb-2">Bonus Points</h4>
              <p className="text-gray-600 text-sm">Get {(referralSettings as { refereePoints?: number })?.refereePoints || 50} bonus points just for joining!</p>
            </div>
            <div className="text-center">
              <div className="bg-navy text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-navy mb-2">Join the Community</h4>
              <p className="text-gray-600 text-sm">Become part of {business?.name}&apos;s customer community</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-navy mb-2">Earn More Rewards</h4>
              <p className="text-gray-600 text-sm">Start earning points on every purchase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReferralSignup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ReferralSignupContent />
    </Suspense>
  );
}
