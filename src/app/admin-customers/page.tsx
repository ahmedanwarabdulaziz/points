'use client';

import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { User, Business, CustomerClass } from '@/types';
import { 
  Users, 
  Building2, 
  Crown, 
  TrendingUp,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download,
  Star,
  Gift,
  Calendar,
  Settings,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface CustomerWithDetails extends User {
  business?: Business;
  class?: CustomerClass;
  totalEarned: number;
  totalRedeemed: number;
  currentPoints: number;
  lastActivity: Date;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    customer: CustomerWithDetails | null;
  }>({ isOpen: false, customer: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const deleteCustomer = async (customerId: string) => {
    try {
      setDeleting(true);
      console.log('🗑️ Deleting customer directly from frontend:', customerId);
      
      // First, verify the customer exists and is actually a customer
      const customerDoc = await getDoc(doc(db, 'users', customerId));
      
      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }
      
      const customerData = customerDoc.data();
      
      if (customerData?.role !== 'customer') {
        throw new Error('Only customers can be deleted');
      }
      
      console.log('👤 Customer data:', { 
        id: customerId, 
        role: customerData?.role, 
        name: customerData?.name,
        email: customerData?.email 
      });
      
      console.log('🗑️ Attempting to delete customer from Firestore...');
      
      // Delete the customer document directly from Firestore
      await deleteDoc(doc(db, 'users', customerId));
      
      console.log('✅ Customer deleted from Firestore successfully');
      
      // Remove customer from local state
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      
      // Close confirmation dialog
      setDeleteConfirm({ isOpen: false, customer: null });
      
      // Silent success: no blocking browser dialogs
      
    } catch (error) {
      console.error('💥 Error deleting customer:', error);
      // Silent error: log only, no blocking browser dialogs
    } finally {
      setDeleting(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch all customers (without orderBy to avoid index requirement)
      const customersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'customer')
      );
      const customersSnapshot = await getDocs(customersQuery);
      
      const customersData = await Promise.all(
        customersSnapshot.docs.map(async (customerDoc) => {
          const customerData = customerDoc.data() as User;
          
          // Debug customer data structure
          console.log('🔍 Customer data:', {
            id: customerDoc.id,
            name: customerData.name,
            email: customerData.email,
            businessId: customerData.businessId,
            classId: customerData.classId,
            status: customerData.status,
            role: customerData.role
          });
          
          let business: Business | undefined;
          let classInfo: CustomerClass | undefined;
          
          // Fetch business information if businessId exists and is not empty
          if (customerData.businessId && customerData.businessId.trim() !== '') {
            try {
              console.log('🏢 Fetching business for customer:', customerData.businessId);
              const businessDoc = await getDoc(doc(db, 'businesses', customerData.businessId));
              if (businessDoc.exists()) {
                const businessData = businessDoc.data() as Business;
                business = {
                  ...businessData,
                  id: businessDoc.id,
                  createdAt: businessData.createdAt || new Date(),
                  approvedAt: businessData.approvedAt || new Date()
                };
                console.log('✅ Business fetched:', business.name);
              } else {
                console.log('❌ Business not found:', customerData.businessId);
              }
            } catch (error) {
              console.error('Error fetching business for customer:', customerData.id, error);
            }
          } else {
            console.log('⚠️ No businessId for customer:', customerData.name, 'businessId:', customerData.businessId);
          }
          
          // Fetch class information if classId exists and is not empty
          if (customerData.classId && customerData.classId.trim() !== '' && customerData.businessId && customerData.businessId.trim() !== '') {
            try {
              console.log('👑 Fetching class for customer:', customerData.classId);
              const classDoc = await getDoc(doc(db, 'customerClasses', customerData.classId));
              if (classDoc.exists()) {
                const classData = classDoc.data() as CustomerClass;
                classInfo = {
                  ...classData,
                  id: classDoc.id,
                  createdAt: classData.createdAt || new Date(),
                  updatedAt: classData.updatedAt || new Date()
                };
                console.log('✅ Class fetched:', classInfo.name);
              } else {
                console.log('❌ Class not found:', customerData.classId);
              }
            } catch (error) {
              console.error('Error fetching class for customer:', customerData.id, error);
            }
          } else {
            console.log('⚠️ No classId or businessId for customer:', customerData.name, {
              classId: customerData.classId,
              businessId: customerData.businessId,
              classIdEmpty: customerData.classId === '' || !customerData.classId,
              businessIdEmpty: customerData.businessId === '' || !customerData.businessId
            });
          }
          
          return {
            ...customerData,
            id: customerDoc.id,
            business,
            class: classInfo,
            totalEarned: customerData.totalEarned || 0,
            totalRedeemed: customerData.totalRedeemed || 0,
            currentPoints: customerData.points || 0,
            lastActivity: customerData.lastActivity || customerData.createdAt || new Date(),
            createdAt: customerData.createdAt || new Date(),
            updatedAt: customerData.updatedAt || new Date()
          };
        })
      );

      // Sort customers by creation date (newest first) on the client side
      const sortedCustomers = customersData.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
      
      console.log('📊 Final customers data summary:', {
        totalCustomers: sortedCustomers.length,
        withBusiness: sortedCustomers.filter(c => c.business).length,
        withClass: sortedCustomers.filter(c => c.class).length,
        withoutBusiness: sortedCustomers.filter(c => !c.business).length,
        withoutClass: sortedCustomers.filter(c => !c.class).length
      });
      
      setCustomers(sortedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.business?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.class?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesBusiness = filterBusiness === 'all' || customer.businessId === filterBusiness;
    return matchesSearch && matchesStatus && matchesBusiness;
  });

  const totalStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalPoints: customers.reduce((sum, customer) => sum + customer.currentPoints, 0),
    totalEarned: customers.reduce((sum, customer) => sum + customer.totalEarned, 0),
    totalRedeemed: customers.reduce((sum, customer) => sum + customer.totalRedeemed, 0)
  };

  const uniqueBusinesses = Array.from(
    new Set(customers.map(c => c.businessId).filter(Boolean))
  ).map(businessId => {
    const customer = customers.find(c => c.businessId === businessId);
    return {
      id: businessId,
      name: customer?.business?.name || 'Unknown Business'
    };
  });

  if (loading) {
    return (
      <RoleRedirect allowedRoles={['admin']}>
        <DashboardLayout userRole="admin">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
          </div>
        </DashboardLayout>
      </RoleRedirect>
    );
  }

  return (
    <RoleRedirect allowedRoles={['admin']}>
      <DashboardLayout userRole="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Customers Overview</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all customer accounts</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchCustomers}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalCustomers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.activeCustomers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalPoints.toLocaleString()}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Points Earned</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalEarned.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Points Redeemed</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalRedeemed.toLocaleString()}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search customers, businesses, or classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filterBusiness}
                  onChange={(e) => setFilterBusiness(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                >
                  <option value="all">All Businesses</option>
                  {uniqueBusinesses.map(business => (
                    <option key={business.id} value={business.id}>{business.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Code
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
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      {/* Customer Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-navy p-2 rounded-lg mr-3">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name?.trim() || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-xs text-gray-400">
                              Ref: {customer.referralCode || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.business ? (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-blue-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.business.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.business.description}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No business</span>
                        )}
                      </td>

                      {/* Class Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.class ? (
                          <div className="flex items-center">
                            <Crown className="h-4 w-4 text-green-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.class.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.class.features?.pointsPerDollar || 0} pts/$ • 
                                {customer.class.features?.referralBonus || 0} referral
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No class</span>
                        )}
                      </td>

                      {/* Customer Code */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.customerCode ? (
                          <div className="flex items-center">
                            <div className="bg-orange-100 px-2 py-1 rounded-lg">
                              <code className="text-sm font-mono font-bold text-orange-800">
                                {customer.customerCode}
                              </code>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No code</span>
                        )}
                      </td>

                      {/* Points Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{customer.currentPoints.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            Earned: {customer.totalEarned.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Redeemed: {customer.totalRedeemed.toLocaleString()}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : customer.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : customer.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {customer.status || 'pending'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {customer.createdAt instanceof Date 
                            ? customer.createdAt.toLocaleDateString() 
                            : new Date(customer.createdAt).toLocaleDateString()
                          }
                        </div>
                        <div className="text-xs text-gray-400">
                          Last: {customer.lastActivity instanceof Date 
                            ? customer.lastActivity.toLocaleDateString() 
                            : new Date(customer.lastActivity).toLocaleDateString()
                          }
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-navy hover:text-orange-600"
                            title="View customer details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            title="Customer settings"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-400 hover:text-red-600"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Delete is immediate now; confirmation dialog removed intentionally */}
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
