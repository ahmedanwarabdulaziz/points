'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { 
  Users, 
  QrCode, 
  BarChart3, 
  Eye,
  Share2,
  Settings
} from 'lucide-react';
import CustomerClassManager from '@/components/CustomerClassManager';
import ReferralAnalytics from '@/components/ReferralAnalytics';
import { MOBILE_CONFIG, getMobileClasses } from '@/config/mobile';
import { generateCustomerCodesForBusiness } from '@/lib/generateCustomerCodes';
import { generateBusinessPrefix } from '@/lib/businessPrefix';

export default function BusinessDashboard() {
  const { business } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Array<{
    id: string;
    name?: string;
    email: string;
    points?: number;
    classId?: string;
    createdAt: Date;
  }>>([]);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [codeGenerationResult, setCodeGenerationResult] = useState<{
    success: number;
    errors: number;
    total: number;
  } | null>(null);

  const createPermanentClasses = async (businessId: string) => {
    try {
      // Create General class
      const generalClassRef = doc(collection(db, 'customerClasses'));
      await setDoc(generalClassRef, {
        id: generalClassRef.id,
        businessId: businessId,
        name: 'General',
        type: 'permanent',
        description: 'Default customer class for all customers',
        pointsPerDollar: 10, // Fixed at 10 points per $1 (standardized)
        referralBonus: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create Referral class
      const referralClassRef = doc(collection(db, 'customerClasses'));
      await setDoc(referralClassRef, {
        id: referralClassRef.id,
        businessId: businessId,
        name: 'Referral',
        type: 'permanent',
        description: 'Customer class for referred customers',
        pointsPerDollar: 10, // Fixed at 10 points per $1 (standardized)
        referralBonus: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Created permanent classes for business:', businessId);
    } catch (error) {
      console.error('❌ Error creating permanent classes:', error);
    }
  };

  const handleGenerateCustomerCodes = async () => {
    if (!business?.id) return;
    
    try {
      setGeneratingCodes(true);
      setCodeGenerationResult(null);
      
      // First, ensure business has a prefix
      console.log('🔍 Ensuring business has prefix...');
      await generateBusinessPrefix(business.name || 'Business', business.id);
      
      // Then generate customer codes
      const result = await generateCustomerCodesForBusiness(business.id);
      setCodeGenerationResult(result);
      
      // Refresh customers data
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error generating customer codes:', error);
    } finally {
      setGeneratingCodes(false);
    }
  };

  // Fetch real data from Firebase
  const fetchData = async () => {
      if (!business?.id) return;
      
      try {
        // Loading state handled by component
        
        // Fetch customers for this business (from users collection)
        const customersQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'customer'),
          where('businessId', '==', business.id)
        );
        const customersSnapshot = await getDocs(customersQuery);
        const customersData = customersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            points: data.points || 0,
            classId: data.classId || '',
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });

        // Fetch customer classes for this business (without orderBy to avoid index issues)
        const classesQuery = query(
          collection(db, 'customerClasses'),
          where('businessId', '==', business.id)
        );
        const classesSnapshot = await getDocs(classesQuery);
        let classesData = classesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        // If no classes exist, create permanent classes
        if (classesData.length === 0) {
          await createPermanentClasses(business.id);
          // Fetch again after creating
          const newClassesSnapshot = await getDocs(classesQuery);
          classesData = newClassesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));
        }

        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        // Loading completed
      }
    };

  useEffect(() => {
    if (business?.id) {
      fetchData();
    }
  }, [business?.id]);

  // Calculate real stats from data
  const stats = {
    totalCustomers: customers.length,
    totalPointsIssued: customers.reduce((sum, customer) => sum + (customer.points || 0), 0),
    totalPointsRedeemed: 0, // This would be calculated from historical data
    totalReferrals: 0, // This would be calculated from referral data
    monthlyGrowth: 12.5 // This would be calculated from historical data
  };


  return (
    <RoleRedirect allowedRoles={['business']}>
      <DashboardLayout userRole="business">
        {/* Blocker overlay if business is not active */}
        {business && business.status !== 'approved' && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 text-center">
              <div className="mb-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">Account Not Active</h3>
              <p className="text-gray-600 text-sm">
                Your business account status is <strong>{business.status}</strong>. Please contact support to activate your account.
              </p>
            </div>
          </div>
        )}
        {/* Status Banner */}
        {business?.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <Eye className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-yellow-800 font-semibold">Pending Approval</h3>
                <p className="text-yellow-700 text-sm">Your business registration is under review. You&apos;ll receive an email once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview - All 4 in Same Row */}
        <div className="grid grid-cols-4 gap-2 lg:gap-6">
          <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-2 lg:p-3 rounded-full mb-2">
                <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Customers</p>
              <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>{stats.totalCustomers.toLocaleString()}</p>
            </div>
          </div>

          <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-2 lg:p-3 rounded-full mb-2">
                <BarChart3 className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Issued</p>
              <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>{stats.totalPointsIssued.toLocaleString()}</p>
            </div>
          </div>

          <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 p-2 lg:p-3 rounded-full mb-2">
                <QrCode className="h-4 w-4 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Redeemed</p>
              <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>{stats.totalPointsRedeemed.toLocaleString()}</p>
            </div>
          </div>

          <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-2 lg:p-3 rounded-full mb-2">
                <Share2 className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Referrals</p>
              <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>{stats.totalReferrals}</p>
            </div>
          </div>
        </div>

        {/* Customer Classes */}
        <CustomerClassManager 
          businessId={business?.id || ''} 
          onClassCreated={(classId) => {
            console.log('New class created:', classId);
            // Refresh the classes data
            // Refresh data handled by useEffect
          }}
        />

        {/* Referral Analytics */}
        {business?.id && (
          <div className="mb-6 lg:mb-8">
            <ReferralAnalytics businessId={business.id} />
          </div>
        )}

        {/* Customer Code Generation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-navy mb-4">Customer QR Codes</h3>
          <p className="text-gray-600 mb-4">
            Generate QR codes for your customers so they can receive points directly. This will also create a business prefix if needed.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">What this does:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Creates a unique 2-letter prefix for your business (e.g., &quot;AB&quot;)</li>
              <li>• Generates customer codes for all your customers (e.g., &quot;AB12345&quot;)</li>
              <li>• Creates QR codes that customers can show to receive points</li>
              <li>• Enables the &quot;Send Points&quot; feature for your business</li>
            </ul>
          </div>
          
          <button
            onClick={handleGenerateCustomerCodes}
            disabled={generatingCodes}
            className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingCodes ? 'Generating...' : 'Generate Customer Codes'}
          </button>
          
          {codeGenerationResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Generation Complete!</h4>
              <p className="text-green-800">
                ✅ Successfully generated: {codeGenerationResult.success} codes<br/>
                ❌ Errors: {codeGenerationResult.errors} codes<br/>
                📊 Total customers: {codeGenerationResult.total}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions - Global Mobile Layout */}
        <div className={getMobileClasses.grid('actionCards')}>
          <div className={`${getMobileClasses.card()} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-navy p-2 lg:p-3 rounded-lg">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className={`${MOBILE_CONFIG.textSizes.h3} font-semibold text-navy`}>Manage Customers</h3>
            </div>
            <p className={`${MOBILE_CONFIG.textSizes.body} text-gray-600 mb-3 lg:mb-4`}>View and manage your customer base</p>
            <button className={`w-full bg-navy text-white ${getMobileClasses.button('medium')} hover:bg-navy-light`}>
              View Customers
            </button>
          </div>

          <div className={`${getMobileClasses.card()} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-orange p-2 lg:p-3 rounded-lg">
                <QrCode className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className={`${MOBILE_CONFIG.textSizes.h3} font-semibold text-navy`}>QR Codes</h3>
            </div>
            <p className={`${MOBILE_CONFIG.textSizes.body} text-gray-600 mb-3 lg:mb-4`}>Generate and manage QR codes for classes</p>
            <button className={`w-full bg-orange text-white ${getMobileClasses.button('medium')} hover:bg-orange-light`}>
              Manage QR Codes
            </button>
          </div>

          <div className={`${getMobileClasses.card()} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-green-500 p-2 lg:p-3 rounded-lg">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className={`${MOBILE_CONFIG.textSizes.h3} font-semibold text-navy`}>Analytics</h3>
            </div>
            <p className={`${MOBILE_CONFIG.textSizes.body} text-gray-600 mb-3 lg:mb-4`}>View detailed analytics and reports</p>
            <button className={`w-full bg-green-500 text-white ${getMobileClasses.button('medium')} hover:bg-green-600`}>
              View Analytics
            </button>
          </div>

          <div className={`${getMobileClasses.card()} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-purple-500 p-2 lg:p-3 rounded-lg">
                <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className={`${MOBILE_CONFIG.textSizes.h3} font-semibold text-navy`}>Business Settings</h3>
            </div>
            <p className={`${MOBILE_CONFIG.textSizes.body} text-gray-600 mb-3 lg:mb-4`}>Update business information and logo</p>
            <button 
              onClick={() => router.push('/business-settings')}
              className={`w-full bg-purple-500 text-white ${getMobileClasses.button('medium')} hover:bg-purple-600`}
            >
              Manage Settings
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
