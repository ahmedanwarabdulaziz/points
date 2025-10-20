'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Business, CustomerClass } from '@/types';
import { useEffect, useState, Suspense } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  Building2, 
  Users, 
  QrCode, 
  ArrowRight,
  Star
} from 'lucide-react';

function QRSignupContent() {
  const { assignCustomerToBusiness } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [customerClass, setCustomerClass] = useState<CustomerClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const businessId = searchParams.get('business');
  const classId = searchParams.get('class');

  useEffect(() => {
    const fetchBusinessData = async () => {
      console.log('🔍 Fetching business data...', { businessId, classId });
      console.log('🔍 URL parameters received:', { businessId, classId });
      console.log('🔍 Parameter types:', { 
        businessIdType: typeof businessId, 
        classIdType: typeof classId,
        businessIdLength: businessId?.length,
        classIdLength: classId?.length
      });
      
      // Validate URL parameters
      if (!businessId || businessId.trim() === '' || !classId || classId.trim() === '') {
        console.error('❌ Missing or invalid business/class ID:', { businessId, classId });
        setError('Invalid QR code. Missing business or class information.');
        setLoading(false);
        return;
      }

      // Additional validation for document ID format
      if (businessId.length < 3 || classId.length < 3) {
        console.error('❌ Invalid document ID format:', { businessId, classId });
        setError('Invalid QR code format.');
        setLoading(false);
        return;
      }

      try {
        console.log('📊 Fetching business document...', businessId);
        // Fetch business data
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        console.log('📊 Business doc exists:', businessDoc.exists());
        
        if (!businessDoc.exists()) {
          console.error('❌ Business document not found');
          setError('Business not found.');
          setLoading(false);
          return;
        }
        
        const data = businessDoc.data();
        const businessData = {
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
        };
        console.log('✅ Business data loaded:', businessData);
        setBusiness(businessData);

        console.log('📊 Fetching customer class document...', classId);
        // Fetch customer class data
        const classDoc = await getDoc(doc(db, 'customerClasses', classId));
        console.log('📊 Class doc exists:', classDoc.exists());
        
        if (!classDoc.exists()) {
          console.error('❌ Customer class document not found');
          setError('Customer class not found.');
          setLoading(false);
          return;
        }
        
        const classDocData = classDoc.data();
        const classData = {
          id: classDoc.id,
          businessId: classDocData.businessId || '',
          name: classDocData.name || '',
          type: classDocData.type || 'custom',
          description: classDocData.description || '',
          features: classDocData.features || {},
          isActive: classDocData.isActive !== undefined ? classDocData.isActive : true,
          createdAt: classDocData.createdAt?.toDate?.() || new Date(),
          updatedAt: classDocData.updatedAt?.toDate?.() || new Date()
        };
        console.log('✅ Customer class data loaded:', classData);
        setCustomerClass(classData);

      } catch (error: unknown) {
        console.error('❌ Error fetching business data:', error);
        if (error instanceof Error && error.message && error.message.includes('Invalid document reference')) {
          setError('Invalid QR code. Please scan a valid QR code.');
        } else {
          setError('Failed to load business information.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId, classId]);

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

      console.log('🔍 Starting QR signup process...', { businessId, classId, email: formData.email });
      console.log('🔍 Business and Class IDs for assignment:', { 
        businessId, 
        classId,
        businessIdValid: businessId && businessId.trim() !== '',
        classIdValid: classId && classId.trim() !== '',
        businessIdType: typeof businessId,
        classIdType: typeof classId
      });

      // Create user account using Firebase Auth directly for QR signup
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      console.log('✅ User created successfully:', newUser.uid);

      // Create unified user document with customer data and business/class assignment
      const userData = {
        id: newUser.uid,
        email: newUser.email!,
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Ensure public/global access flag is explicitly set on signup
        globalAccess: true,
        
        // Customer-specific fields with business/class assignment
        name: formData.name,
        businessId: businessId, // Assign to the business from QR code
        classId: classId, // Assign to the class from QR code
        referralCode: generateReferralCode(),
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        status: 'active',
        lastActivity: new Date()
      };

      console.log('🔍 Creating user document with business/class assignment:', userData);
      console.log('🔍 Business and Class IDs in userData:', {
        businessId: userData.businessId,
        classId: userData.classId,
        businessIdValid: userData.businessId && userData.businessId.trim() !== '',
        classIdValid: userData.classId && userData.classId.trim() !== ''
      });

      await setDoc(doc(db, 'users', newUser.uid), userData);
      
      console.log('✅ User document created with business/class assignment');

      // Double-check: Ensure customer is properly assigned using AuthContext function
      console.log('🔍 Double-checking assignment with AuthContext...');
      await assignCustomerToBusiness(newUser.uid, businessId || '', classId || '');
      
      // Verify the assignment was saved correctly
      console.log('🔍 Verifying customer assignment...');
      const verifyDoc = await getDoc(doc(db, 'users', newUser.uid));
      if (verifyDoc.exists()) {
        const verifyData = verifyDoc.data();
        console.log('🔍 Customer data after assignment:', {
          businessId: verifyData.businessId,
          classId: verifyData.classId,
          name: verifyData.name,
          status: verifyData.status
        });
      }
      
      console.log('✅ Customer assignment completed successfully');

      // Redirect to customer dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('❌ QR Signup error:', error);
      console.error('❌ Error details:', {
        code: error instanceof Error ? error.message : 'Unknown error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    } finally {
      setSigningUp(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy-light transition-colors"
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
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Join {business?.name}</h1>
              <p className="text-gray-600">Scan QR Code Signup</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-navy">Business Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{business?.name}</h3>
                <p className="text-gray-600">{business?.description}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-4 w-4 text-orange" />
                  <span className="font-medium text-gray-900">Customer Class: {customerClass?.name}</span>
                </div>
                <p className="text-sm text-gray-600">{customerClass?.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>• {customerClass?.features?.pointsPerDollar || 1} point per dollar spent</p>
                  {(customerClass?.features?.referralBonus || 0) > 0 && (
                    <p>• {customerClass?.features?.referralBonus} bonus points for referrals</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-navy">Create Your Account</h2>
            </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={signingUp}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center ${
                  signingUp
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange text-white hover:bg-orange-light'
                }`}
              >
                {signingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Join {business?.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/signin')}
                  className="text-orange hover:text-orange-light font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QRSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <QRSignupContent />
    </Suspense>
  );
}
