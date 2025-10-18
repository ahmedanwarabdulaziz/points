'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { 
  Shield, 
  Building2, 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState('businesses');
  const [users, setUsers] = useState<Array<{
    id: string;
    name?: string;
    email: string;
    role: string;
    businessId?: string;
    points?: number;
    status?: string;
    createdAt: Date;
  }>>([]);
  const [businesses, setBusinesses] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: Date;
    ownerId: string;
  }>>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [processingBusiness, setProcessingBusiness] = useState<string | null>(null);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['businesses', 'users', 'analytics', 'settings'].includes(tab)) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch users
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));

        // Fetch businesses
        const businessesQuery = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'));
        const businessesSnapshot = await getDocs(businessesQuery);
        const businessesData = businessesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));

        // Combine user data with business data
        const enrichedUsers = usersData.map(user => {
          const userData = user as any; // Type assertion for Firebase data
          const businessData = businessesData.find(business => business.id === userData.businessId);
          
          return {
            ...user,
            name: userData.name || user.email?.split('@')[0] || 'Unknown User',
            points: userData.points || 0,
            businessName: businessData?.name || (userData.role === 'business' ? 'Business Owner' : 'N/A'),
            businessId: userData.businessId || '',
            status: userData.status || 'active',
            lastActivity: userData.lastActivity || user.updatedAt,
            referralCode: userData.referralCode || 'N/A'
          };
        });

        setUsers(enrichedUsers);
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);


  const mockStats = {
    totalBusinesses: 45,
    pendingApprovals: 8,
    totalCustomers: 12470,
    totalPointsInSystem: 456800,
    totalReferrals: 890
  };


  const handleApprove = async (businessId: string) => {
    try {
      setProcessingBusiness(businessId);
      
      // Update business status to approved
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user?.uid,
        updatedAt: new Date()
      });

      // Update the business owner's role to business
      const business = businesses.find(b => b.id === businessId);
      if (business?.ownerId) {
        const userRef = doc(db, 'users', business.ownerId);
        await updateDoc(userRef, {
          role: 'business',
          updatedAt: new Date()
        });
      }

      // Update local state
      setBusinesses(prev => 
        prev.map(b => 
          b.id === businessId 
            ? { ...b, status: 'approved', approvedAt: new Date() }
            : b
        )
      );

      console.log('Business approved successfully:', businessId);
    } catch (error) {
      console.error('Error approving business:', error);
      alert('Failed to approve business. Please try again.');
    } finally {
      setProcessingBusiness(null);
    }
  };

  const handleReject = async (businessId: string) => {
    try {
      setProcessingBusiness(businessId);
      
      // Update business status to rejected
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: user?.uid,
        updatedAt: new Date()
      });

      // Update local state
      setBusinesses(prev => 
        prev.map(b => 
          b.id === businessId 
            ? { ...b, status: 'rejected', rejectedAt: new Date() }
            : b
        )
      );

      console.log('Business rejected successfully:', businessId);
    } catch (error) {
      console.error('Error rejecting business:', error);
      alert('Failed to reject business. Please try again.');
    } finally {
      setProcessingBusiness(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const handleViewUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('View user:', userId);
    // TODO: Implement view user modal or page
  };

  const handleEditUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit user:', userId);
    // TODO: Implement edit user modal or page
  };

  const handleUserActions = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('User actions:', userId);
    // TODO: Implement user actions modal or page
  };

  return (
    <RoleRedirect allowedRoles={['admin']}>
      <DashboardLayout userRole="admin">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-navy">{mockStats.totalBusinesses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange">{mockStats.pendingApprovals}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-navy">{mockStats.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-navy">{mockStats.totalPointsInSystem.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-navy">{mockStats.totalReferrals}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('businesses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'businesses'
                    ? 'border-orange text-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Approvals
              </button>
              <button
                onClick={() => handleTabChange('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'users'
                    ? 'border-orange text-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => handleTabChange('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'analytics'
                    ? 'border-orange text-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'settings'
                    ? 'border-orange text-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                System Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'businesses' && (
              <div>
                <h3 className="text-lg font-semibold text-navy mb-4">Business Registration Requests</h3>
                {dataLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {businesses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No businesses found
                      </div>
                    ) : (
                      businesses.map((business) => (
                    <div key={business.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-navy">{business.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              business.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : business.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {business.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{business.description}</p>
                          <p className="text-gray-500 text-xs">Owner: {business.owner} • Created: {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        {business.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(business.id)}
                              disabled={processingBusiness === business.id}
                              className={`px-4 py-2 rounded-lg transition-colors inline-flex items-center ${
                                processingBusiness === business.id
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {processingBusiness === business.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              {processingBusiness === business.id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(business.id)}
                              disabled={processingBusiness === business.id}
                              className={`px-4 py-2 rounded-lg transition-colors inline-flex items-center ${
                                processingBusiness === business.id
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              {processingBusiness === business.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              {processingBusiness === business.id ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-navy">User Management</h3>
                  <div className="flex space-x-3">
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange">
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="business">Business</option>
                      <option value="customer">Customer</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dataLoading ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center">
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange"></div>
                              </div>
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-orange-600 font-medium text-sm">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.role === 'business'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.businessName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <span className="font-medium">{user.points.toLocaleString()}</span>
                                {user.role === 'customer' && (
                                  <span className="ml-2 text-xs text-gray-500">pts</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : user.status === 'inactive'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={(e) => handleViewUser(user.id, e)}
                                  className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                                  title="View User Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={(e) => handleEditUser(user.id, e)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit User"
                                >
                                  <Settings className="h-4 w-4" />
                                </button>
                                {user.role === 'customer' && (
                                  <button 
                                    onClick={(e) => handleUserActions(user.id, e)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                    title="User Actions"
                                  >
                                    <Users className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Shield className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Admins</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {users.filter(u => u.role === 'admin').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building2 className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Business Owners</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {users.filter(u => u.role === 'business').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Customers</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {users.filter(u => u.role === 'customer').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-navy mb-4">System Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-navy mb-2">User Growth</h4>
                    <p className="text-3xl font-bold text-orange">+25%</p>
                    <p className="text-sm text-gray-600">vs last month</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-navy mb-2">Active Businesses</h4>
                    <p className="text-3xl font-bold text-navy">37</p>
                    <p className="text-sm text-gray-600">out of 45 total</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-navy mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-navy">Default Points per Dollar</h4>
                      <p className="text-sm text-gray-600">Set the default points earned per dollar spent</p>
                    </div>
                    <input
                      type="number"
                      defaultValue="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-navy">Referral Bonus</h4>
                      <p className="text-sm text-gray-600">Points awarded for successful referrals</p>
                    </div>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
