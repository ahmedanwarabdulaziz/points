'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Gift, Star, CreditCard, History, Share2 } from 'lucide-react';
import FirebaseDebugger from '@/components/FirebaseDebugger';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import ReferralDashboard from '@/components/ReferralDashboard';
import CustomerQRCode from '@/components/CustomerQRCode';

export default function Dashboard() {
  const { user, appUser, loading, validateAndFixCustomerAssignment } = useAuth();
  const router = useRouter();


  // Validate customer assignment on component mount
  useEffect(() => {
    const validateCustomer = async () => {
      if (user && appUser && appUser.role === 'customer') {
        console.log('🔍 Validating customer assignment on dashboard load...');
        console.log('🔍 validateAndFixCustomerAssignment function:', typeof validateAndFixCustomerAssignment);
        
        if (typeof validateAndFixCustomerAssignment === 'function') {
          const isValid = await validateAndFixCustomerAssignment(user.uid);
          
          if (!isValid) {
            console.warn('⚠️ Customer assignment validation failed');
          } else {
            console.log('✅ Customer assignment is valid');
          }
        } else {
          console.error('❌ validateAndFixCustomerAssignment is not a function:', validateAndFixCustomerAssignment);
        }
      }
    };

    if (!loading && user && appUser) {
      validateCustomer();
    }
  }, [user, appUser, loading, validateAndFixCustomerAssignment]);

  return (
    <RoleRedirect allowedRoles={['customer']}>
      <DashboardLayout userRole="customer">
        {/* Firebase Debugger - Remove in production */}
        <div className="mb-8">
          <FirebaseDebugger />
        </div>
        
        {/* Points Overview - Mobile Optimized */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-4 lg:p-8 text-white mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Your Points</h2>
              <div className="text-4xl lg:text-5xl font-bold text-orange mb-2">{(appUser?.points || 0).toLocaleString()}</div>
              <p className="text-gray-200 text-sm lg:text-base">Available to redeem</p>
            </div>
            <div className="text-center lg:text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold">${(((appUser?.points || 0) / 100)).toFixed(2)}</div>
                <div className="text-xs lg:text-sm text-gray-200">Estimated value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Section - Mobile Optimized */}
        {appUser && appUser.role === 'customer' && appUser.businessId && appUser.classId && (
          <div className="mb-6 lg:mb-8">
            <ReferralDashboard 
              customer={appUser} 
              businessId={appUser.businessId} 
              classId={appUser.classId} 
            />
          </div>
        )}

        {/* Business Upgrade Section - Mobile Optimized */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 lg:p-8 text-white mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0 lg:mr-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">Ready to Grow Your Business?</h2>
              <p className="text-orange-100 text-base lg:text-lg mb-4 lg:mb-6">
                Join thousands of businesses using our platform to manage customers, create loyalty programs, and grow their revenue.
              </p>
              
              {/* Benefits List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <span className="text-orange-100 text-sm lg:text-base">Customer Management</span>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <Gift className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <span className="text-orange-100 text-sm lg:text-base">Loyalty Programs</span>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <span className="text-orange-100 text-sm lg:text-base">QR Code System</span>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <History className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <span className="text-orange-100 text-sm lg:text-base">Analytics & Reports</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                <h4 className="font-semibold mb-2 text-sm lg:text-base">Requirements:</h4>
                <ul className="text-xs lg:text-sm text-orange-100 space-y-1">
                  <li>• Valid business information</li>
                  <li>• Business logo (optional)</li>
                  <li>• Admin approval required</li>
                </ul>
              </div>

              {/* Process Explanation */}
              <div className="text-xs lg:text-sm text-orange-100">
                <strong>Process:</strong> Fill out the registration form → Admin reviews → Get approved → Access business dashboard
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button
                onClick={() => router.push('/business-registration')}
                className="w-full lg:w-auto bg-white text-orange-600 px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Register Your Business
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-orange p-2 lg:p-3 rounded-lg">
                <Gift className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-navy">Redeem Rewards</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4">Use your points to get amazing rewards and gift cards</p>
            <button className="w-full bg-orange text-white py-2.5 lg:py-3 px-4 rounded-lg hover:bg-orange-light transition-colors font-medium text-sm lg:text-base">
              Browse Rewards
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-navy p-2 lg:p-3 rounded-lg">
                <Star className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-navy">Earn Points</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4">Make purchases and earn points automatically</p>
            <button className="w-full bg-navy text-white py-2.5 lg:py-3 px-4 rounded-lg hover:bg-navy-light transition-colors font-medium text-sm lg:text-base">
              Start Shopping
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-green-500 p-2 lg:p-3 rounded-lg">
                <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-navy">Gift Cards</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4">Redeem points for gift cards from top brands</p>
            <button className="w-full bg-green-500 text-white py-2.5 lg:py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm lg:text-base">
              View Gift Cards
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="bg-blue-500 p-2 lg:p-3 rounded-lg">
                <Share2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-navy">Request Points</h3>
            </div>
            <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4">Request points from your business for services or purchases</p>
            <button 
              onClick={() => router.push('/request-points')}
              className="w-full bg-blue-500 text-white py-2.5 lg:py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base"
            >
              Request Points
            </button>
          </div>
        </div>

        {/* Recent Activity - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <History className="h-5 w-5 lg:h-6 lg:w-6 text-navy" />
              <h3 className="text-base lg:text-lg font-semibold text-navy">Recent Activity</h3>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-green-100 p-1.5 lg:p-2 rounded-full">
                    <Star className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">Earned 50 points</p>
                    <p className="text-xs lg:text-sm text-gray-500">From purchase at Store ABC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-orange-100 p-1.5 lg:p-2 rounded-full">
                    <Gift className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">Redeemed 500 points</p>
                    <p className="text-xs lg:text-sm text-gray-500">For $5 Amazon Gift Card</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 lg:py-3">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="bg-blue-100 p-1.5 lg:p-2 rounded-full">
                    <CreditCard className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">Account created</p>
                    <p className="text-xs lg:text-sm text-gray-500">Welcome bonus: 100 points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      
      {/* Customer QR Code Component */}
      {appUser && appUser.role === 'customer' && (
        <CustomerQRCode customer={appUser} />
      )}
    </RoleRedirect>
  );
}
