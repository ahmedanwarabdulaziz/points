'use client';

import { useAuth } from &apos;@/contexts/AuthContext';
import { useRouter } from &apos;next/navigation';
import { useEffect, useState } from &apos;react';
import { db } from &apos;@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from &apos;firebase/firestore';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MoreVertical,
  User,
  Mail,
  Calendar,
  Star,
  Gift,
  TrendingUp,
  Award,
  Clock
} from &apos;lucide-react';
import RoleRedirect from &apos;@/components/RoleRedirect';
import DashboardLayout from &apos;@/components/DashboardLayout';

export default function BusinessCustomers() {
  const { user, appUser, business, loading } = useAuth();
  const router = useRouter();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [customerClasses, setCustomerClasses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(&apos;');
  const [filterClass, setFilterClass] = useState(&apos;');
  const [sortBy, setSortBy] = useState(&apos;createdAt&apos;);
  const [sortOrder, setSortOrder] = useState<&apos;asc&apos; | &apos;desc&apos;>(&apos;desc&apos;);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Fetch customers for this business
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!business?.id) {
        console.log(&apos;❌ No business ID available:&apos;, business);
        return;
      }
      
      try {
        setDataLoading(true);
        console.log(&apos;🔍 Fetching customers for business:&apos;, business.id);
        
        // Fetch customers for this business (without orderBy to avoid index issues)
        const customersQuery = query(
          collection(db, &apos;users&apos;), 
          where(&apos;role&apos;, &apos;==&apos;, &apos;customer&apos;),
          where(&apos;businessId&apos;, &apos;==&apos;, business.id)
        );
        
        console.log(&apos;🔍 Executing customers query...&apos;);
        const customersSnapshot = await getDocs(customersQuery);
        console.log(&apos;🔍 Query results:&apos;, {
          size: customersSnapshot.size,
          empty: customersSnapshot.empty,
          docs: customersSnapshot.docs.length
        });

        // If no results, try a simpler query to debug
        if (customersSnapshot.empty) {
          console.log(&apos;🔍 No customers found, trying simpler query...&apos;);
          const simpleQuery = query(
            collection(db, &apos;users&apos;), 
            where(&apos;role&apos;, &apos;==&apos;, &apos;customer&apos;)
          );
          const simpleSnapshot = await getDocs(simpleQuery);
          console.log(&apos;🔍 Simple query results:&apos;, {
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
          console.log(&apos;🔍 Customer data:&apos;, {
            id: doc.id,
            name: data.name,
            email: data.email,
            businessId: data.businessId,
            classId: data.classId,
            role: data.role
          });
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            lastActivity: data.lastActivity?.toDate?.() || new Date()
          };
        });

        // Sort by createdAt descending (newest first)
        customersData.sort((a, b) => {
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return bTime - aTime;
        });

        console.log(&apos;✅ Customers fetched:&apos;, customersData.length);
        setCustomers(customersData);
        setFilteredCustomers(customersData);

        // Fetch customer classes for this business
        console.log(&apos;🔍 Fetching customer classes...&apos;);
        const classesQuery = query(
          collection(db, &apos;customerClasses&apos;),
          where(&apos;businessId&apos;, &apos;==&apos;, business.id)
        );
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        console.log(&apos;✅ Customer classes fetched:&apos;, classesData.length);
        setCustomerClasses(classesData);
      } catch (error) {
        console.error(&apos;❌ Error fetching customers:&apos;, error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && business?.id) {
      console.log(&apos;🔍 Starting customer fetch...&apos;, { businessId: business.id, loading });
      fetchCustomers();
    } else {
      console.log(&apos;⚠️ Not fetching customers:&apos;, { loading, businessId: business?.id });
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
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === &apos;createdAt&apos; || sortBy === &apos;lastActivity&apos;) {
        aValue = aValue?.getTime() || 0;
        bValue = bValue?.getTime() || 0;
      }
      
      if (sortOrder === &apos;asc&apos;) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterClass, sortBy, sortOrder]);

  const handleViewCustomer = (customer: unknown) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleExportCustomers = () => {
    const csvContent = [
      [&apos;Name&apos;, &apos;Email&apos;, &apos;Class&apos;, &apos;Points&apos;, &apos;Total Earned&apos;, &apos;Total Redeemed&apos;, &apos;Status&apos;, &apos;Join Date&apos;],
      ...filteredCustomers.map(customer => [
        customer.name || &apos;N/A&apos;,
        customer.email || &apos;N/A&apos;,
        customer.classId || &apos;N/A&apos;,
        customer.points || 0,
        customer.totalEarned || 0,
        customer.totalRedeemed || 0,
        customer.status || &apos;active&apos;,
        customer.createdAt?.toLocaleDateString() || &apos;N/A&apos;
      ])
    ].map(row => row.join(&apos;,')).join(&apos;\n&apos;);

    const blob = new Blob([csvContent], { type: &apos;text/csv&apos; });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement(&apos;a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split(&apos;T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case &apos;active&apos;: return &apos;bg-green-100 text-green-800';
      case &apos;inactive&apos;: return &apos;bg-gray-100 text-gray-800';
      case &apos;suspended&apos;: return &apos;bg-red-100 text-red-800';
      default: return &apos;bg-gray-100 text-gray-800';
    }
  };

  const getPointsColor = (points: number) => {
    if (points >= 1000) return &apos;text-green-600';
    if (points >= 500) return &apos;text-yellow-600';
    return &apos;text-gray-600';
  };

  const getCustomerClassName = (classId: string) => {
    const customerClass = customerClasses.find(cls => cls.id === classId);
    return customerClass ? customerClass.name : &apos;General';
  };

  const getCustomerClassDetails = (classId: string) => {
    const customerClass = customerClasses.find(cls => cls.id === classId);
    return customerClass || null;
  };

  // Debug business data
  useEffect(() => {
    console.log(&apos;🔍 Business customers page - Debug info:&apos;, {
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
      <RoleRedirect allowedRoles={[&apos;business&apos;]}>
        <DashboardLayout userRole="business">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
          </div>
        </DashboardLayout>
      </RoleRedirect>
    );
  }

  return (
    <RoleRedirect allowedRoles={[&apos;business&apos;]}>
      <DashboardLayout userRole="business">
        <div className="space-y-6">
          {/* Debug Info - Remove in production */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Information</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Business ID: {business?.id || &apos;Not available&apos;}</p>
              <p>Business Name: {business?.name || &apos;Not available&apos;}</p>
              <p>Total Customers: {customers.length}</p>
              <p>Filtered Customers: {filteredCustomers.length}</p>
              <p>Customer Classes: {customerClasses.length}</p>
              <p>Loading: {loading ? &apos;Yes&apos; : &apos;No&apos;}</p>
              <p>Data Loading: {dataLoading ? &apos;Yes&apos; : &apos;No&apos;}</p>
            </div>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-navy">Your Customers</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all customers who have joined your business
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportCustomers}
                className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors inline-flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-navy">{customers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-navy">
                    {customers.filter(c => c.status === &apos;active&apos;).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Points Issued</p>
                  <p className="text-2xl font-bold text-navy">
                    {customers.reduce((sum, c) => sum + (c.totalEarned || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Referrals</p>
                  <p className="text-2xl font-bold text-navy">
                    {customers.filter(c => c.referredBy).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                >
                  <option value="createdAt">Join Date</option>
                  <option value="name">Name</option>
                  <option value="points">Points</option>
                  <option value="lastActivity">Last Activity</option>
                </select>
                
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as &apos;asc&apos; | &apos;desc&apos;)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name || &apos;N/A&apos;}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCustomerClassName(customer.classId)}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status || &apos;active&apos;)}`}>
                          {customer.status || &apos;active&apos;}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {customer.createdAt?.toLocaleDateString() || &apos;N/A&apos;}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {customer.lastActivity?.toLocaleDateString() || &apos;N/A&apos;}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="text-navy hover:text-orange transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    ? &apos;Try adjusting your search or filters&apos;
                    : &apos;Customers will appear here once they sign up for your business&apos;
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Detail Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-navy">Customer Details</h2>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="flex items-center space-x-4">
                    <div className="bg-navy text-white rounded-full w-16 h-16 flex items-center justify-center">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedCustomer.name || &apos;N/A&apos;}
                      </h3>
                      <p className="text-gray-600">{selectedCustomer.email}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status || &apos;active&apos;)}`}>
                        {selectedCustomer.status || &apos;active&apos;}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Current Points</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(selectedCustomer.points || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Total Earned</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(selectedCustomer.totalEarned || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Gift className="h-5 w-5 text-purple-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Total Redeemed</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(selectedCustomer.totalRedeemed || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Referral Code</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedCustomer.referralCode || &apos;N/A&apos;}
                          </p>
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
                          {getCustomerClassName(selectedCustomer.classId)}
                        </span>
                        {selectedCustomer.classId && (
                          <p className="text-sm text-gray-500 mt-1">
                            ID: {selectedCustomer.classId}
                          </p>
                        )}
                        {getCustomerClassDetails(selectedCustomer.classId) && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Description:</strong> {getCustomerClassDetails(selectedCustomer.classId).description || &apos;No description&apos;}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Points per $:</strong> {getCustomerClassDetails(selectedCustomer.classId).features?.pointsPerDollar || 0}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Referral Bonus:</strong> {getCustomerClassDetails(selectedCustomer.classId).features?.referralBonus || 0} points
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Join Date</label>
                      <p className="text-gray-900">
                        {selectedCustomer.createdAt?.toLocaleDateString() || &apos;N/A&apos;}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Activity</label>
                      <p className="text-gray-900">
                        {selectedCustomer.lastActivity?.toLocaleDateString() || &apos;N/A&apos;}
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
          </div>
        )}
      </DashboardLayout>
    </RoleRedirect>
  );
}
