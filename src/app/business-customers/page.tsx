'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { User, CustomerClass } from '@/types';
import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  MoreVertical,
  User as UserIcon,
  Mail,
  Calendar,
  Star,
  Gift,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { MOBILE_CONFIG, getMobileClasses } from '@/config/mobile';

export default function BusinessCustomers() {
  const { user, appUser, business, loading } = useAuth();
  
  const [customers, setCustomers] = useState<User[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);
  const [customerClasses, setCustomerClasses] = useState<CustomerClass[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Fetch customers for this business
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!business?.id) {
        console.log('❌ No business ID available:', business);
        return;
      }
      
      try {
        setDataLoading(true);
        console.log('🔍 Fetching customers for business:', business.id);
        
        // Fetch customers for this business (without orderBy to avoid index issues)
        const customersQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'customer'),
          where('businessId', '==', business.id)
        );
        
        console.log('🔍 Executing customers query...');
        const customersSnapshot = await getDocs(customersQuery);
        console.log('🔍 Query results:', {
          size: customersSnapshot.size,
          empty: customersSnapshot.empty,
          docs: customersSnapshot.docs.length
        });

        // If no results, try a simpler query to debug
        if (customersSnapshot.empty) {
          console.log('🔍 No customers found, trying simpler query...');
          const simpleQuery = query(
            collection(db, 'users'), 
            where('role', '==', 'customer')
          );
          const simpleSnapshot = await getDocs(simpleQuery);
          console.log('🔍 Simple query results:', {
            size: simpleSnapshot.size,
            docs: simpleSnapshot.docs.map(doc => ({
              id: doc.id,
              businessId: doc.data().businessId,
              email: doc.data().email,
              name: doc.data().name
            }))
          });
        }
        
        const customersData = customersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('🔍 Customer data:', {
            id: doc.id,
            name: data.name,
            email: data.email,
            businessId: data.businessId,
            classId: data.classId,
            role: data.role
          });
          return {
            id: doc.id,
            email: data.email || '',
            role: data.role || 'customer',
            name: data.name || '',
            businessId: data.businessId || '',
            classId: data.classId || '',
            points: data.points || 0,
            status: data.status || 'active',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            lastActivity: data.lastActivity?.toDate?.() || new Date()
          };
        });

        // Sort by createdAt descending (newest first)
        customersData.sort((a, b) => {
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return bTime - aTime;
        });

        console.log('✅ Customers fetched:', customersData.length);
        setCustomers(customersData);
        setFilteredCustomers(customersData);

        // Fetch customer classes for this business
        console.log('🔍 Fetching customer classes...');
        const classesQuery = query(
          collection(db, 'customerClasses'),
          where('businessId', '==', business.id)
        );
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            businessId: data.businessId || '',
            name: data.name || '',
            type: data.type || 'custom',
            description: data.description || '',
            features: data.features || {},
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
        });

        console.log('✅ Customer classes fetched:', classesData.length);
        setCustomerClasses(classesData);
      } catch (error) {
        console.error('❌ Error fetching customers:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && business?.id) {
      console.log('🔍 Starting customer fetch...', { businessId: business.id, loading });
      fetchCustomers();
    } else {
      console.log('⚠️ Not fetching customers:', { loading, businessId: business?.id });
    }
  }, [business?.id, loading]);

  // Filter and search customers
  useEffect(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (filterClass) {
      filtered = filtered.filter(customer => customer.classId === filterClass);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'points':
          aValue = a.points || 0;
          bValue = b.points || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt?.getTime() || 0;
          bValue = b.createdAt?.getTime() || 0;
          break;
        case 'lastActivity':
          aValue = a.lastActivity?.getTime() || 0;
          bValue = b.lastActivity?.getTime() || 0;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterClass, sortBy, sortOrder]);

  const handleViewCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleExportCustomers = () => {
    const csvContent = [
      ['Name', 'Email', 'Class', 'Points', 'Total Earned', 'Total Redeemed', 'Status', 'Join Date'],
      ...filteredCustomers.map(customer => [
        customer.name || 'N/A',
        customer.email || 'N/A',
        customer.classId || 'N/A',
        customer.points || 0,
        customer.totalEarned || 0,
        customer.totalRedeemed || 0,
        customer.status || 'active',
        customer.createdAt?.toLocaleDateString() || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPointsColor = (points: number) => {
    if (points >= 1000) return 'text-green-600';
    if (points >= 500) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCustomerClassName = (classId: string) => {
    const customerClass = customerClasses.find(cls => cls.id === classId);
    return customerClass ? customerClass.name : 'General';
  };

  const getCustomerClassDetails = (classId: string) => {
    const customerClass = customerClasses.find(cls => cls.id === classId);
    return customerClass || null;
  };

  // Debug business data
  useEffect(() => {
    console.log('🔍 Business customers page - Debug info:', {
      loading,
      dataLoading,
      business: business,
      businessId: business?.id,
      appUser: appUser,
      user: user
    });
  }, [loading, dataLoading, business, appUser, user]);

  if (loading || dataLoading) {
    return (
      <RoleRedirect allowedRoles={['business']}>
        <DashboardLayout userRole="business">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
          </div>
        </DashboardLayout>
      </RoleRedirect>
    );
  }

  return (
    <RoleRedirect allowedRoles={['business']}>
      <DashboardLayout userRole="business">
          {/* Header - Mobile Optimized */}
          <div className="space-y-4">
            <div>
              <h1 className={`${getMobileClasses.heading(1)} text-center lg:text-left`}>Your Customers</h1>
              <p className={`text-gray-600 mt-1 lg:mt-2 ${MOBILE_CONFIG.textSizes.body} text-center lg:text-left`}>
                Manage and view all customers who have joined your business
              </p>
            </div>
            
            {/* Mobile Export Button - Full Width */}
            <div className="lg:hidden">
              <button
                onClick={handleExportCustomers}
                className={`w-full bg-orange text-white ${getMobileClasses.button('medium')} hover:bg-orange-light inline-flex items-center justify-center`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Customer Data
              </button>
            </div>
            
            {/* Desktop Export Button */}
            <div className="hidden lg:flex justify-end">
              <button
                onClick={handleExportCustomers}
                className={`bg-orange text-white ${getMobileClasses.button('medium')} hover:bg-orange-light inline-flex items-center`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards - All 4 in Same Row */}
          <div className="grid grid-cols-4 gap-2 lg:gap-6">
            <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-2 lg:p-3 rounded-full mb-2">
                  <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Total Customers</p>
                <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>{customers.length}</p>
              </div>
            </div>

            <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-2 lg:p-3 rounded-full mb-2">
                  <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Active Customers</p>
                <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>

            <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-yellow-100 p-2 lg:p-3 rounded-full mb-2">
                  <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
                <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Points Issued</p>
                <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>
                  {customers.reduce((sum, c) => sum + (c.totalEarned || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-2 lg:p-3 rounded-full mb-2">
                  <Award className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <p className={`${MOBILE_CONFIG.textSizes.statLabel} text-gray-600 mb-1`}>Referrals</p>
                <p className={`${MOBILE_CONFIG.textSizes.statValue} font-bold text-navy`}>
                  {customers.filter(c => c.referredBy).length}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Search and Filters */}
          <div className="lg:hidden space-y-4">
            {/* Mobile Search */}
            <div className={getMobileClasses.card()}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 ${getMobileClasses.input('medium')}`}
                />
              </div>
            </div>
            
            {/* Mobile Filters */}
            <div className={getMobileClasses.card()}>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Filter & Sort</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className={`w-full ${getMobileClasses.input('medium')}`}
                  >
                    <option value="">All Classes</option>
                    {customerClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`w-full ${getMobileClasses.input('medium')}`}
                    >
                      <option value="createdAt">Join Date</option>
                      <option value="name">Name</option>
                      <option value="points">Points</option>
                      <option value="lastActivity">Last Activity</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className={`w-full ${getMobileClasses.input('medium')}`}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Search and Filters */}
          <div className="hidden lg:block">
            <div className={getMobileClasses.card()}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 ${getMobileClasses.input('medium')}`}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className={`${getMobileClasses.input('medium')}`}
                  >
                    <option value="">All Classes</option>
                    {customerClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`${getMobileClasses.input('medium')}`}
                  >
                    <option value="createdAt">Join Date</option>
                    <option value="name">Name</option>
                    <option value="points">Points</option>
                    <option value="lastActivity">Last Activity</option>
                  </select>
                  
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className={`${getMobileClasses.input('medium')}`}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View - Hidden on Desktop */}
          <div className="lg:hidden space-y-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className={`${getMobileClasses.card()} hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-navy text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {customer.name || 'N/A'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate flex items-center">
                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="text-navy hover:text-orange transition-colors p-1"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title="More Options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-xs text-gray-600">Points</span>
                    </div>
                    <p className={`text-sm font-semibold ${getPointsColor(customer.points || 0)}`}>
                      {(customer.points || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center">
                      <Award className="h-3 w-3 text-blue-500 mr-1" />
                      <span className="text-xs text-gray-600">Class</span>
                    </div>
                    <p className="text-xs font-medium text-blue-800">
                      {getCustomerClassName(customer.classId || '')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status || 'active')}`}>
                    {customer.status || 'active'}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {customer.createdAt?.toLocaleDateString() || 'N/A'}
                  </div>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterClass 
                    ? 'Try adjusting your search or filters'
                    : 'Customers will appear here once they sign up for your business'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block">
            <div className={`${MOBILE_CONFIG.containers.table} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-navy text-white rounded-full w-10 h-10 flex items-center justify-center">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {customer.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getCustomerClassName(customer.classId || '')}
                          </span>
                          {customer.classId && (
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {customer.classId}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className={`text-sm font-medium ${getPointsColor(customer.points || 0)}`}>
                              {(customer.points || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Earned: {(customer.totalEarned || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status || 'active')}`}>
                            {customer.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {customer.createdAt?.toLocaleDateString() || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {customer.lastActivity?.toLocaleDateString() || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="text-navy hover:text-orange transition-colors p-1"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title="Edit Customer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title="More Options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterClass 
                      ? 'Try adjusting your search or filters'
                      : 'Customers will appear here once they sign up for your business'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Detail Modal - Mobile Optimized */}
          {showCustomerModal && selectedCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
                <div className="p-4 lg:p-6">
                  <div className="flex justify-between items-center mb-4 lg:mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-navy">Customer Details</h2>
                    <button
                      onClick={() => setShowCustomerModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 lg:space-y-6">
                    {/* Customer Info - Mobile Optimized */}
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                      <div className="bg-navy text-white rounded-full w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto lg:mx-0">
                        <UserIcon className="h-6 w-6 lg:h-8 lg:w-8" />
                      </div>
                      <div className="text-center lg:text-left">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                          {selectedCustomer.name || 'N/A'}
                        </h3>
                        <p className="text-gray-600 text-sm lg:text-base">{selectedCustomer.email}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status || 'active')}`}>
                          {selectedCustomer.status || 'active'}
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid - Mobile Optimized */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500 mr-2" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-600">Current Points</p>
                            <p className="text-base lg:text-lg font-semibold text-gray-900">
                              {(selectedCustomer.points || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 mr-2" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-600">Total Earned</p>
                            <p className="text-base lg:text-lg font-semibold text-gray-900">
                              {(selectedCustomer.totalEarned || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                        <div className="flex items-center">
                          <Gift className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500 mr-2" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-600">Total Redeemed</p>
                            <p className="text-base lg:text-lg font-semibold text-gray-900">
                              {(selectedCustomer.totalRedeemed || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500 mr-2" />
                          <div>
                            <p className="text-xs lg:text-sm text-gray-600">Referral Code</p>
                            <p className="text-base lg:text-lg font-semibold text-gray-900">
                              {selectedCustomer.referralCode || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Class</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getCustomerClassName(selectedCustomer.classId || '')}
                        </span>
                        {selectedCustomer.classId && (
                          <p className="text-sm text-gray-500 mt-1">
                            ID: {selectedCustomer.classId}
                          </p>
                        )}
                        {(() => {
                          const classDetails = getCustomerClassDetails(selectedCustomer.classId || '');
                          return classDetails && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>Description:</strong> {classDetails.description || 'No description'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Points per $:</strong> {classDetails.features?.pointsPerDollar || 0}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Referral Bonus:</strong> {classDetails.features?.referralBonus || 0} points
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Join Date</label>
                      <p className="text-gray-900">
                        {selectedCustomer.createdAt?.toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Activity</label>
                      <p className="text-gray-900">
                        {selectedCustomer.lastActivity?.toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                    {selectedCustomer.referredBy && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Referred By</label>
                        <p className="text-gray-900">{selectedCustomer.referredBy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
      </DashboardLayout>
    </RoleRedirect>
  );
}
