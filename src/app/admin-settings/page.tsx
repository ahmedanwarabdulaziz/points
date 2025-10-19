'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  Utensils,
  Heart,
  ShoppingBag,
  Gamepad2,
  Briefcase,
  Scissors,
  Car,
  GraduationCap,
  Save,
  X
} from 'lucide-react';

interface BusinessIndustry {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BusinessType {
  id: string;
  industryId: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const INDUSTRY_ICONS = {
  'food-beverage': Utensils,
  'health-wellness': Heart,
  'retail-shopping': ShoppingBag,
  'entertainment': Gamepad2,
  'professional-services': Briefcase,
  'beauty-personal-care': Scissors,
  'automotive': Car,
  'education': GraduationCap,
  'default': Building2
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [industries, setIndustries] = useState<BusinessIndustry[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'industries' | 'types'>('industries');
  
  // Industry form state
  const [showIndustryForm, setShowIndustryForm] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<BusinessIndustry | null>(null);
  const [industryFormData, setIndustryFormData] = useState({
    name: '',
    description: '',
    icon: 'default',
    isActive: true
  });
  
  // Business type form state
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<BusinessType | null>(null);
  const [typeFormData, setTypeFormData] = useState({
    industryId: '',
    name: '',
    description: '',
    icon: 'default',
    isActive: true
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch industries
      const industriesQuery = query(
        collection(db, 'businessIndustries'),
        orderBy('createdAt', 'desc')
      );
      const industriesSnapshot = await getDocs(industriesQuery);
      const industriesData = industriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      })) as BusinessIndustry[];
      
      // Fetch business types
      const typesQuery = query(
        collection(db, 'businessTypes'),
        orderBy('createdAt', 'desc')
      );
      const typesSnapshot = await getDocs(typesQuery);
      const typesData = typesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      })) as BusinessType[];
      
      setIndustries(industriesData);
      setBusinessTypes(typesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const industryData = {
        ...industryFormData,
        updatedAt: new Date()
      };
      
      if (editingIndustry) {
        // Update existing industry
        await updateDoc(doc(db, 'businessIndustries', editingIndustry.id), industryData);
        setIndustries(prev => prev.map(industry => 
          industry.id === editingIndustry.id 
            ? { ...industry, ...industryData }
            : industry
        ));
      } else {
        // Create new industry
        const docRef = await addDoc(collection(db, 'businessIndustries'), {
          ...industryData,
          createdAt: new Date()
        });
        const newIndustry = {
          id: docRef.id,
          ...industryData,
          createdAt: new Date()
        };
        setIndustries(prev => [newIndustry, ...prev]);
      }
      
      setShowIndustryForm(false);
      setEditingIndustry(null);
      setIndustryFormData({ name: '', description: '', icon: 'default', isActive: true });
    } catch (error) {
      console.error('Error saving industry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const typeData = {
        ...typeFormData,
        updatedAt: new Date()
      };
      
      if (editingType) {
        // Update existing type
        await updateDoc(doc(db, 'businessTypes', editingType.id), typeData);
        setBusinessTypes(prev => prev.map(type => 
          type.id === editingType.id 
            ? { ...type, ...typeData }
            : type
        ));
      } else {
        // Create new type
        const docRef = await addDoc(collection(db, 'businessTypes'), {
          ...typeData,
          createdAt: new Date()
        });
        const newType = {
          id: docRef.id,
          ...typeData,
          createdAt: new Date()
        };
        setBusinessTypes(prev => [newType, ...prev]);
      }
      
      setShowTypeForm(false);
      setEditingType(null);
      setTypeFormData({ industryId: '', name: '', description: '', icon: 'default', isActive: true });
    } catch (error) {
      console.error('Error saving business type:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditIndustry = (industry: BusinessIndustry) => {
    setEditingIndustry(industry);
    setIndustryFormData({
      name: industry.name,
      description: industry.description,
      icon: industry.icon,
      isActive: industry.isActive
    });
    setShowIndustryForm(true);
  };

  const handleEditType = (type: BusinessType) => {
    setEditingType(type);
    setTypeFormData({
      industryId: type.industryId,
      name: type.name,
      description: type.description,
      icon: type.icon,
      isActive: type.isActive
    });
    setShowTypeForm(true);
  };

  const handleDeleteIndustry = async (industryId: string) => {
    if (confirm('Are you sure you want to delete this industry?')) {
      try {
        await deleteDoc(doc(db, 'businessIndustries', industryId));
        setIndustries(prev => prev.filter(industry => industry.id !== industryId));
      } catch (error) {
        console.error('Error deleting industry:', error);
      }
    }
  };

  const handleDeleteType = async (typeId: string) => {
    if (confirm('Are you sure you want to delete this business type?')) {
      try {
        await deleteDoc(doc(db, 'businessTypes', typeId));
        setBusinessTypes(prev => prev.filter(type => type.id !== typeId));
      } catch (error) {
        console.error('Error deleting business type:', error);
      }
    }
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
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">Business Categories</h1>
              <p className="text-gray-600 mt-1">Manage industries and business types</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('industries')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'industries'
                      ? 'border-orange text-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Industries
                </button>
                <button
                  onClick={() => setActiveTab('types')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'types'
                      ? 'border-orange text-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Business Types
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Industries Tab */}
              {activeTab === 'industries' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-navy">Industries</h3>
                    <button
                      onClick={() => setShowIndustryForm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Industry</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {industries.map((industry) => {
                      const IconComponent = INDUSTRY_ICONS[industry.icon as keyof typeof INDUSTRY_ICONS] || INDUSTRY_ICONS.default;
                      return (
                        <div key={industry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-navy p-2 rounded-lg">
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-navy">{industry.name}</h4>
                                <p className="text-sm text-gray-600">{industry.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditIndustry(industry)}
                                className="p-1 text-gray-400 hover:text-navy transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIndustry(industry.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              industry.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {industry.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Business Types Tab */}
              {activeTab === 'types' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-navy">Business Types</h3>
                    <button
                      onClick={() => setShowTypeForm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Business Type</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {businessTypes.map((type) => {
                      const industry = industries.find(ind => ind.id === type.industryId);
                      const IconComponent = INDUSTRY_ICONS[type.icon as keyof typeof INDUSTRY_ICONS] || INDUSTRY_ICONS.default;
                      return (
                        <div key={type.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-navy p-2 rounded-lg">
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-navy">{type.name}</h4>
                                <p className="text-sm text-gray-600">{type.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Industry: {industry?.name || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditType(type)}
                                className="p-1 text-gray-400 hover:text-navy transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteType(type.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              type.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {type.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Industry Form Modal */}
          {showIndustryForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-navy">
                      {editingIndustry ? 'Edit Industry' : 'Add Industry'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowIndustryForm(false);
                        setEditingIndustry(null);
                        setIndustryFormData({ name: '', description: '', icon: 'default', isActive: true });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveIndustry} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry Name
                      </label>
                      <input
                        type="text"
                        value={industryFormData.name}
                        onChange={(e) => setIndustryFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={industryFormData.description}
                        onChange={(e) => setIndustryFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        value={industryFormData.icon}
                        onChange={(e) => setIndustryFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                      >
                        <option value="default">Building</option>
                        <option value="food-beverage">Food & Beverage</option>
                        <option value="health-wellness">Health & Wellness</option>
                        <option value="retail-shopping">Retail & Shopping</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="professional-services">Professional Services</option>
                        <option value="beauty-personal-care">Beauty & Personal Care</option>
                        <option value="automotive">Automotive</option>
                        <option value="education">Education</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="industryActive"
                        checked={industryFormData.isActive}
                        onChange={(e) => setIndustryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-orange focus:ring-orange border-gray-300 rounded"
                      />
                      <label htmlFor="industryActive" className="ml-2 text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowIndustryForm(false);
                          setEditingIndustry(null);
                          setIndustryFormData({ name: '', description: '', icon: 'default', isActive: true });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : editingIndustry ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Business Type Form Modal */}
          {showTypeForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-navy">
                      {editingType ? 'Edit Business Type' : 'Add Business Type'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowTypeForm(false);
                        setEditingType(null);
                        setTypeFormData({ industryId: '', name: '', description: '', icon: 'default', isActive: true });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveType} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        value={typeFormData.industryId}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, industryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        required
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
                        Business Type Name
                      </label>
                      <input
                        type="text"
                        value={typeFormData.name}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={typeFormData.description}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        value={typeFormData.icon}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                      >
                        <option value="default">Building</option>
                        <option value="food-beverage">Food & Beverage</option>
                        <option value="health-wellness">Health & Wellness</option>
                        <option value="retail-shopping">Retail & Shopping</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="professional-services">Professional Services</option>
                        <option value="beauty-personal-care">Beauty & Personal Care</option>
                        <option value="automotive">Automotive</option>
                        <option value="education">Education</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="typeActive"
                        checked={typeFormData.isActive}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-orange focus:ring-orange border-gray-300 rounded"
                      />
                      <label htmlFor="typeActive" className="ml-2 text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTypeForm(false);
                          setEditingType(null);
                          setTypeFormData({ industryId: '', name: '', description: '', icon: 'default', isActive: true });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : editingType ? 'Update' : 'Create'}
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
