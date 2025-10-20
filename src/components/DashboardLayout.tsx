'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { MOBILE_CONFIG } from '@/config/mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'business' | 'customer';
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const { logout, appUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar userRole={userRole} onLogout={handleLogout} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-navy">
                {userRole === 'admin' ? 'Admin Dashboard' : 
                 userRole === 'business' ? 'Business Dashboard' : 'Customer Dashboard'}
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                {userRole === 'admin' ? 'Manage the entire system' : 
                 userRole === 'business' ? 'Manage your business and customers' : 
                 'Track your points and rewards'}
              </p>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              {appUser && (
                <NotificationBell userId={appUser.id} />
              )}
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {appUser?.name ? appUser.name.charAt(0).toUpperCase() : 
                     userRole === 'admin' ? 'A' : userRole === 'business' ? 'B' : 'C'}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {appUser?.name || 
                     (userRole === 'admin' ? 'Admin User' : 
                      userRole === 'business' ? 'Business Owner' : 'Customer')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole === 'admin' ? 'Administrator' : 
                     userRole === 'business' ? 'Business Owner' : 'Customer'} • Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className={`flex-1 ${MOBILE_CONFIG.spacing.pagePadding}`}>
          <div className={MOBILE_CONFIG.spacing.pageSpacing}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
