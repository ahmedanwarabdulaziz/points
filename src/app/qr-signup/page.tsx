'use client';

import { useAuth } from &apos;@/contexts/AuthContext';
import { useRouter, useSearchParams } from &apos;next/navigation';
import { useEffect, useState } from &apos;react';
import { db, auth } from &apos;@/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from &apos;firebase/firestore';
import { createUserWithEmailAndPassword } from &apos;firebase/auth';
import { 
  Building2, 
  Users, 
  QrCode, 
  CheckCircle,
  ArrowRight,
  Star
} from &apos;lucide-react';

export default function QRSignupPage() {
  const { user, signUp, assignCustomerToBusiness } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<any>(null);
  const [customerClass, setCustomerClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [formData, setFormData] = useState({
    name: &apos;',
    email: &apos;',
    password: &apos;',
    confirmPassword: &apos;'
  });
  const [error, setError] = useState(&apos;');

  const businessId = searchParams.get(&apos;business&apos;);
  const classId = searchParams.get(&apos;class&apos;);

  useEffect(() => {
    const fetchBusinessData = async () => {
      console.log(&apos;🔍 Fetching business data...&apos;, { businessId, classId });
      console.log(&apos;🔍 URL parameters received:&apos;, { businessId, classId });
      console.log(&apos;🔍 Parameter types:&apos;, { 
        businessIdType: typeof businessId, 
        classIdType: typeof classId,
        businessIdLength: businessId?.length,
        classIdLength: classId?.length
      });
      
      // Validate URL parameters
      if (!businessId || businessId.trim() === &apos;' || !classId || classId.trim() === &apos;') {
        console.error(&apos;❌ Missing or invalid business/class ID:&apos;, { businessId, classId });
        setError(&apos;Invalid QR code. Missing business or class information.&apos;);
        setLoading(false);
        return;
      }

      // Additional validation for document ID format
      if (businessId.length < 3 || classId.length < 3) {
        console.error(&apos;❌ Invalid document ID format:&apos;, { businessId, classId });
        setError(&apos;Invalid QR code format.&apos;);
        setLoading(false);
        return;
      }

      try {
        console.log(&apos;📊 Fetching business document...&apos;, businessId);
        // Fetch business data
        const businessDoc = await getDoc(doc(db, &apos;businesses&apos;, businessId));
        console.log(&apos;📊 Business doc exists:&apos;, businessDoc.exists());
        
        if (!businessDoc.exists()) {
          console.error(&apos;❌ Business document not found&apos;);
          setError(&apos;Business not found.&apos;);
          setLoading(false);
          return;
        }
        
        const businessData = { id: businessDoc.id, ...businessDoc.data() };
        console.log(&apos;✅ Business data loaded:&apos;, businessData);
        setBusiness(businessData);

        console.log(&apos;📊 Fetching customer class document...&apos;, classId);
        // Fetch customer class data
        const classDoc = await getDoc(doc(db, &apos;customerClasses&apos;, classId));
        console.log(&apos;📊 Class doc exists:&apos;, classDoc.exists());
        
        if (!classDoc.exists()) {
          console.error(&apos;❌ Customer class document not found&apos;);
          setError(&apos;Customer class not found.&apos;);
          setLoading(false);
          return;
        }
        
        const classData = { id: classDoc.id, ...classDoc.data() };
        console.log(&apos;✅ Customer class data loaded:&apos;, classData);
        setCustomerClass(classData);

      } catch (error) {
        console.error(&apos;❌ Error fetching business data:&apos;, error);
        if (error.message && error.message.includes(&apos;Invalid document reference&apos;)) {
          setError(&apos;Invalid QR code. Please scan a valid QR code.&apos;);
        } else {
          setError(&apos;Failed to load business information.&apos;);
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
    setError(&apos;');

    // Validation
    if (!formData.name.trim()) {
      setError(&apos;Please enter your name.&apos;);
      return;
    }
    if (!formData.email.trim()) {
      setError(&apos;Please enter your email.&apos;);
      return;
    }
    if (!formData.password) {
      setError(&apos;Please enter a password.&apos;);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(&apos;Passwords do not match.&apos;);
      return;
    }
    if (formData.password.length < 6) {
      setError(&apos;Password must be at least 6 characters.&apos;);
      return;
    }

    try {
      setSigningUp(true);

      console.log(&apos;🔍 Starting QR signup process...&apos;, { businessId, classId, email: formData.email });
      console.log(&apos;🔍 Business and Class IDs for assignment:&apos;, { 
        businessId, 
        classId,
        businessIdValid: businessId && businessId.trim() !== &apos;',
        classIdValid: classId && classId.trim() !== &apos;'
      });

      // Create user account using Firebase Auth directly for QR signup
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      console.log(&apos;✅ User created successfully:&apos;, newUser.uid);

      // Create unified user document with customer data and business/class assignment
      const userData = {
        id: newUser.uid,
        email: newUser.email!,
        role: &apos;customer&apos;,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Customer-specific fields with business/class assignment
        name: formData.name,
        businessId: businessId, // Assign to the business from QR code
        classId: classId, // Assign to the class from QR code
        referralCode: generateReferralCode(),
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        status: &apos;active&apos;,
        lastActivity: new Date()
      };

      console.log(&apos;🔍 Creating user document with business/class assignment:&apos;, userData);

      await setDoc(doc(db, &apos;users&apos;, newUser.uid), userData);
      
      console.log(&apos;✅ User document created with business/class assignment&apos;);

      // Double-check: Ensure customer is properly assigned using AuthContext function
      console.log(&apos;🔍 Double-checking assignment with AuthContext...&apos;);
      await assignCustomerToBusiness(newUser.uid, businessId, classId);
      
      console.log(&apos;✅ Customer assignment completed successfully&apos;);

      // Redirect to customer dashboard
      router.push(&apos;/dashboard&apos;);
    } catch (error: unknown) {
      console.error(&apos;❌ QR Signup error:&apos;, error);
      console.error(&apos;❌ Error details:&apos;, {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError(error.message || &apos;Failed to create account. Please try again.&apos;);
    } finally {
      setSigningUp(false);
    }
  };

  const generateReferralCode = (): string => {
    const chars = &apos;ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = &apos;';
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
            onClick={() => router.push(&apos;/')}
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
                  <p>• {customerClass?.pointsPerDollar} point per dollar spent</p>
                  {customerClass?.referralBonus > 0 && (
                    <p>• {customerClass?.referralBonus} bonus points for referrals</p>
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
                    ? &apos;bg-gray-400 text-gray-200 cursor-not-allowed&apos;
                    : &apos;bg-orange text-white hover:bg-orange-light&apos;
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
                Already have an account?{&apos; '}
                <button
                  onClick={() => router.push(&apos;/signin&apos;)}
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
