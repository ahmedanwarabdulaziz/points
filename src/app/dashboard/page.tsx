'use client';

import { useAuth } from &apos;@/contexts/AuthContext';
import { useRouter } from &apos;next/navigation';
import { useEffect } from &apos;react';
import { Gift, Star, CreditCard, History, Settings, LogOut } from &apos;lucide-react';
import FirebaseDebugger from &apos;@/components/FirebaseDebugger';
import RoleRedirect from &apos;@/components/RoleRedirect';
import DashboardLayout from &apos;@/components/DashboardLayout';

export default function Dashboard() {
  const { user, appUser, customer, loading, logout, validateAndFixCustomerAssignment } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(&apos;/');
  };

  // Validate customer assignment on component mount
  useEffect(() => {
    const validateCustomer = async () => {
      if (user && appUser && appUser.role === &apos;customer&apos;) {
        console.log(&apos;🔍 Validating customer assignment on dashboard load...&apos;);
        console.log(&apos;🔍 validateAndFixCustomerAssignment function:&apos;, typeof validateAndFixCustomerAssignment);
        
        if (typeof validateAndFixCustomerAssignment === &apos;function&apos;) {
          const isValid = await validateAndFixCustomerAssignment(user.uid);
          
          if (!isValid) {
            console.warn(&apos;⚠️ Customer assignment validation failed&apos;);
          } else {
            console.log(&apos;✅ Customer assignment is valid&apos;);
          }
        } else {
          console.error(&apos;❌ validateAndFixCustomerAssignment is not a function:&apos;, validateAndFixCustomerAssignment);
        }
      }
    };

    if (!loading && user && appUser) {
      validateCustomer();
    }
  }, [user, appUser, loading, validateAndFixCustomerAssignment]);

  return (
    <RoleRedirect allowedRoles={[&apos;customer&apos;]}>
      <DashboardLayout userRole="customer">
        {/* Firebase Debugger - Remove in production */}
        <div className="mb-8">
          <FirebaseDebugger />
        </div>
        
        {/* Points Overview */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Points</h2>
              <div className="text-5xl font-bold text-orange mb-2">2,500</div>
              <p className="text-gray-200">Available to redeem</p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">$25.00</div>
                <div className="text-sm text-gray-200">Equivalent value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Upgrade Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0 lg:mr-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
              <p className="text-orange-100 text-lg mb-6">
                Join thousands of businesses using our platform to manage customers, create loyalty programs, and grow their revenue.
              </p>
              
              {/* Benefits List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <Star className="h-4 w-4" />
                  </div>
                  <span className="text-orange-100">Customer Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <Gift className="h-4 w-4" />
                  </div>
                  <span className="text-orange-100">Loyalty Programs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="text-orange-100">QR Code System</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-1">
                    <History className="h-4 w-4" />
                  </div>
                  <span className="text-orange-100">Analytics & Reports</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="text-sm text-orange-100 space-y-1">
                  <li>• Valid business information</li>
                  <li>• Business logo (optional)</li>
                  <li>• Admin approval required</li>
                </ul>
              </div>

              {/* Process Explanation */}
              <div className="text-sm text-orange-100">
                <strong>Process:</strong> Fill out the registration form → Admin reviews → Get approved → Access business dashboard
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push(&apos;/business-registration&apos;)}
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Register Your Business
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange p-2 rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Redeem Rewards</h3>
            </div>
            <p className="text-gray-600 mb-4">Use your points to get amazing rewards and gift cards</p>
            <button className="w-full bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-light transition-colors">
              Browse Rewards
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-navy p-2 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Earn Points</h3>
            </div>
            <p className="text-gray-600 mb-4">Make purchases and earn points automatically</p>
            <button className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-navy-light transition-colors">
              Start Shopping
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-navy">Gift Cards</h3>
            </div>
            <p className="text-gray-600 mb-4">Redeem points for gift cards from top brands</p>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              View Gift Cards
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <History className="h-6 w-6 text-navy" />
              <h3 className="text-lg font-semibold text-navy">Recent Activity</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Earned 50 points</p>
                    <p className="text-sm text-gray-500">From purchase at Store ABC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Gift className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Redeemed 500 points</p>
                    <p className="text-sm text-gray-500">For $5 Amazon Gift Card</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Account created</p>
                    <p className="text-sm text-gray-500">Welcome bonus: 100 points</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
