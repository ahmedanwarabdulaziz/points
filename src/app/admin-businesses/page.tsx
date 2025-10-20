'use client';

import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Business, CustomerClass } from '@/types';
import { 
  Building2, 
  Users, 
  Crown, 
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download,
  Edit,
  Settings
} from 'lucide-react';

interface BusinessWithDetails extends Business {
  classes: CustomerClass[];
  totalCustomers: number;
  totalClasses: number;
}

interface BusinessIndustry {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

interface BusinessType {
  id: string;
  industryId: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}


export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [industries, setIndustries] = useState<BusinessIndustry[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('approved');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    status: 'approved' as 'approved' | 'pending' | 'rejected',
    logo: '',
    industryId: '',
    typeId: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      // Fetch industries
      const industriesQuery = query(
        collection(db, 'businessIndustries'),
        where('isActive', '==', true)
      );
      const industriesSnapshot = await getDocs(industriesQuery);
      const industriesData = industriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusinessIndustry[];
      
      // Fetch business types
      const typesQuery = query(
        collection(db, 'businessTypes'),
        where('isActive', '==', true)
      );
      const typesSnapshot = await getDocs(typesQuery);
      const typesData = typesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusinessType[];
      
      setIndustries(industriesData);
      setBusinessTypes(typesData);
      
      // Fetch approved businesses (without orderBy to avoid index requirement)
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('status', '==', 'approved')
      );
      const businessesSnapshot = await getDocs(businessesQuery);
      
      const toDate = (value: unknown): Date | undefined => {
        if (!value) return undefined;
        const maybeTs = value as { toDate?: () => Date };
        if (typeof maybeTs?.toDate === 'function') return maybeTs.toDate();
        if (value instanceof Date) return value;
        if (typeof value === 'string' || typeof value === 'number') return new Date(value);
        return undefined;
      };

      const businessesData = await Promise.all(
        businessesSnapshot.docs.map(async (doc) => {
          const businessData = doc.data() as Business;
          
          // Fetch classes for this business
          const classesQuery = query(
            collection(db, 'customerClasses'),
            where('businessId', '==', doc.id),
            orderBy('createdAt', 'desc')
          );
          const classesSnapshot = await getDocs(classesQuery);
          const classes = classesSnapshot.docs.map(classDoc => ({
            id: classDoc.id,
            ...classDoc.data(),
            createdAt: classDoc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: classDoc.data().updatedAt?.toDate?.() || new Date()
          })) as CustomerClass[];

          // Calculate total customers for this business
          let totalCustomers = 0;
          const classesWithCustomerCounts = await Promise.all(
            classes.map(async (classItem) => {
              const customersQuery = query(
                collection(db, 'users'),
                where('businessId', '==', doc.id),
                where('classId', '==', classItem.id)
              );
              const customersSnapshot = await getDocs(customersQuery);
              const customerCount = customersSnapshot.size;
              totalCustomers += customerCount;
              
              return {
                ...classItem,
                customerCount
              };
            })
          );

          return {
            ...businessData,
            id: doc.id,
            classes: classesWithCustomerCounts,
            totalCustomers,
            totalClasses: classes.length,
            // Normalize Firestore Timestamp or string to JS Date
            createdAt: toDate((businessData as unknown as { createdAt?: unknown }).createdAt) || new Date(),
            approvedAt: toDate((businessData as unknown as { approvedAt?: unknown }).approvedAt)
          };
        })
      );

      // Sort businesses by creation date (newest first) on the client side
      const sortedBusinesses = businessesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setBusinesses(sortedBusinesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || business.status === filterStatus;
    const matchesIndustry = !filterIndustry || business.industryId === filterIndustry;
    const matchesType = !filterType || business.typeId === filterType;
    return matchesSearch && matchesFilter && matchesIndustry && matchesType;
  });

  const handleEditBusiness = (business: BusinessWithDetails) => {
    setEditingBusiness(business);
    setEditFormData({
      name: business.name,
      description: business.description || '',
      status: business.status,
      logo: business.logo || '',
      industryId: business.industryId || '',
      typeId: business.typeId || ''
    });
    setLogoPreview(business.logo || '');
    setLogoFile(null);
    setShowEditModal(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    try {
      setUpdateLoading(true);
      
      let logoUrl = editFormData.logo;
      
      // If a new logo file is selected, upload it
      if (logoFile) {
        // For now, we'll use a simple base64 data URL
        // In production, you'd upload to a storage service like Firebase Storage
        logoUrl = logoPreview;
      }
      
      const businessRef = doc(db, 'businesses', editingBusiness.id);
      await updateDoc(businessRef, {
        name: editFormData.name,
        description: editFormData.description,
        status: editFormData.status,
        logo: logoUrl,
        industryId: editFormData.industryId,
        typeId: editFormData.typeId,
        updatedAt: new Date()
      });

      // Update the local state
      setBusinesses(prev => prev.map(business => 
        business.id === editingBusiness.id 
          ? { ...business, name: editFormData.name, description: editFormData.description, status: editFormData.status, logo: logoUrl, industryId: editFormData.industryId, typeId: editFormData.typeId }
          : business
      ));

      setShowEditModal(false);
      setEditingBusiness(null);
      setLogoFile(null);
      setLogoPreview('');
    } catch (error) {
      console.error('Error updating business:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const totalStats = {
    totalBusinesses: businesses.length,
    totalClasses: businesses.reduce((sum, business) => sum + business.totalClasses, 0),
    totalCustomers: businesses.reduce((sum, business) => sum + business.totalCustomers, 0)
  };

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
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Businesses Overview</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all approved businesses</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchBusinesses}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalBusinesses}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalClasses}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Crown className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl lg:text-3xl font-bold text-navy">{totalStats.totalCustomers}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
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
                    placeholder="Search businesses..."
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
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending' | 'rejected')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterIndustry}
                  onChange={(e) => {
                    setFilterIndustry(e.target.value);
                    setFilterType(''); // Reset type when industry changes
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  disabled={!filterIndustry}
                >
                  <option value="">All Types</option>
                  {businessTypes
                    .filter(type => type.industryId === filterIndustry)
                    .map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Businesses Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry & Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      {/* Business Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-3">
                            {business.logo ? (
                              <img 
                                src={business.logo} 
                                alt={business.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="bg-navy p-2 rounded-lg">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {business.name}
                            </div>
                            <div className="text-sm text-gray-500">{business.description}</div>
                          </div>
                        </div>
                      </td>

                      {/* Industry & Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(() => {
                            const industry = industries.find(ind => ind.id === business.industryId);
                            const type = businessTypes.find(type => type.id === business.typeId);
                            return (
                              <div>
                                <div className="font-medium">{industry?.name || 'No Industry'}</div>
                                <div className="text-gray-500 text-xs">{type?.name || 'No Type'}</div>
                              </div>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          business.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : business.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {business.status}
                        </span>
                      </td>

                      {/* Classes Count */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Crown className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {business.totalClasses}
                          </span>
                        </div>
                      </td>

                      {/* Customers Count */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {business.totalCustomers}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{business.createdAt.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          Approved: {business.approvedAt?.toLocaleDateString() || 'N/A'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditBusiness(business)}
                            className="text-navy hover:text-orange-600 transition-colors"
                            title="Edit Business"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-navy transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No businesses found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Edit Business Modal */}
          {showEditModal && editingBusiness && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-navy">Edit Business</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleUpdateBusiness} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Logo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {logoPreview ? (
                            <img 
                              src={logoPreview} 
                              alt="Logo preview"
                              className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange file:text-white hover:file:bg-orange-600"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 2MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        value={editFormData.industryId}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, industryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                      >
                        <option value="">Select Industry</option>
                        {industries.map(industry => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type
                      </label>
                      <select
                        value={editFormData.typeId}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, typeId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                      >
                        <option value="">Select Business Type</option>
                        {businessTypes
                          .filter(type => type.industryId === editFormData.industryId)
                          .map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'approved' | 'pending' | 'rejected' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {updateLoading ? 'Updating...' : 'Update Business'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
