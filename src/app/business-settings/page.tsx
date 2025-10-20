'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RoleRedirect from '@/components/RoleRedirect';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Business } from '@/types';
import { 
  Building2, 
  Upload, 
  Save, 
  Camera,
  Edit3,
  CheckCircle,
  AlertCircle,
  X,
  Gift
} from 'lucide-react';

export default function BusinessSettings() {
  const { business, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessData, setBusinessData] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industryId: '',
    typeId: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [referralSettings, setReferralSettings] = useState({
    enabled: true,
    referrerPoints: 100,
    refereePoints: 50,
    maxReferralsPerCustomer: 10,
    expiryDays: 30
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!business?.id) {
        setError('Business not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const businessDoc = await getDoc(doc(db, 'businesses', business.id));
        
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          const businessInfo = {
            id: businessDoc.id,
            name: data.name || '',
            description: data.description || '',
            logo: data.logo || '',
            industryId: data.industryId || '',
            typeId: data.typeId || '',
            website: data.website || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            country: data.country || '',
            ownerId: data.ownerId || '',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            settings: data.settings || {
              allowReferrals: true,
              defaultPointsPerDollar: 1
            }
          };

          setBusinessData(businessInfo);
          setFormData({
            name: businessInfo.name,
            description: businessInfo.description,
            industryId: businessInfo.industryId,
            typeId: businessInfo.typeId,
            website: businessInfo.website,
            phone: businessInfo.phone,
            address: businessInfo.address,
            city: businessInfo.city,
            state: businessInfo.state,
            zipCode: businessInfo.zipCode,
            country: businessInfo.country
          });
          setLogoPreview(businessInfo.logo);
          
          // Set referral settings
          if (businessInfo.settings?.referralSettings) {
            setReferralSettings(businessInfo.settings.referralSettings);
          }
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
        setError('Failed to load business information');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [business?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReferralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setReferralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value) || 0
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!business?.id) {
      setError('Business not found');
      return;
    }

    try {
      setSaving(true);

      // Prepare update data
      const updateData: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        industryId: formData.industryId,
        typeId: formData.typeId,
        website: formData.website.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: formData.country.trim(),
        updatedAt: new Date(),
        settings: {
          allowReferrals: true,
          defaultPointsPerDollar: 1,
          referralSettings: referralSettings,
          allowGlobalCustomers: businessData?.settings?.allowGlobalCustomers ?? true,
        }
      };

      // Handle logo upload (in a real app, you'd upload to Cloudinary or similar)
      if (logoFile) {
        // For now, we'll just store the file name
        // In production, you'd upload to a cloud storage service
        updateData.logo = `logo_${Date.now()}_${logoFile.name}`;
      }

      // Update business document
      await updateDoc(doc(db, 'businesses', business.id), updateData);

      setSuccess('Business information updated successfully!');
      
      // Clear form states
      setLogoFile(null);
      
      // Refresh business data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error updating business:', error);
      setError('Failed to update business information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleRedirect allowedRoles={['business']}>
        <DashboardLayout userRole="business">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
              <p className="text-gray-600">Loading business settings...</p>
            </div>
          </div>
        </DashboardLayout>
      </RoleRedirect>
    );
  }

  return (
    <RoleRedirect allowedRoles={['business']}>
      <DashboardLayout userRole="business">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-navy flex items-center">
                  <Building2 className="h-6 w-6 mr-3" />
                  Business Settings
                </h1>
                <p className="text-gray-600 mt-1">Manage your business information and settings</p>
              </div>
              <div className="text-sm text-gray-500">
                Status: <span className={`font-medium ${businessData?.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>
                  {businessData?.status || 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Business Information Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Edit3 className="h-5 w-5 text-navy mr-2" />
              <h2 className="text-xl font-semibold text-navy">Business Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Section */}
              <div className="border-b border-gray-200 pb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Business Logo</label>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Business logo"
                          className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="logo" className="cursor-pointer">
                      <div className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors inline-flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        {logoFile ? 'Change Logo' : 'Upload Logo'}
                      </div>
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: 200x200px, max 5MB. JPG, PNG, or GIF.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                    placeholder="Enter business name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder="Describe your business"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                  placeholder="https://your-website.com"
                />
              </div>

              {/* Address Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="Enter ZIP code"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              {/* Referral Settings */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <Gift className="h-5 w-5 text-navy mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Referral Settings</h3>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-800">How Referral Points Work</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        When customers refer friends, both parties earn points. Configure how many points each person gets.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="referrerPoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Points for Referrer (Person who refers)
                    </label>
                    <input
                      type="number"
                      id="referrerPoints"
                      name="referrerPoints"
                      value={referralSettings.referrerPoints}
                      onChange={handleReferralSettingsChange}
                      min="0"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Points earned by the person making the referral</p>
                  </div>

                  <div>
                    <label htmlFor="refereePoints" className="block text-sm font-medium text-gray-700 mb-1">
                      Bonus Points for Referee (Person being referred)
                    </label>
                    <input
                      type="number"
                      id="refereePoints"
                      name="refereePoints"
                      value={referralSettings.refereePoints}
                      onChange={handleReferralSettingsChange}
                      min="0"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bonus points for the person being referred</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="maxReferralsPerCustomer" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Referrals per Customer
                    </label>
                    <input
                      type="number"
                      id="maxReferralsPerCustomer"
                      name="maxReferralsPerCustomer"
                      value={referralSettings.maxReferralsPerCustomer}
                      onChange={handleReferralSettingsChange}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of referrals per customer (0 = unlimited)</p>
                  </div>

                  <div>
                    <label htmlFor="expiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Referral Link Expiry (Days)
                    </label>
                    <input
                      type="number"
                      id="expiryDays"
                      name="expiryDays"
                      value={referralSettings.expiryDays}
                      onChange={handleReferralSettingsChange}
                      min="1"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange"
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">How long referral links remain valid</p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={referralSettings.enabled}
                      onChange={handleReferralSettingsChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Enable Referral System
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Allow customers to refer friends and earn points
                  </p>
                </div>
              </div>

              {/* Customer Requests Settings */}
              <div className="border-t border-gray-200 pt-6">
                {/* Global Customers Toggle */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={businessData?.settings?.allowGlobalCustomers ?? true}
                      onChange={(e) => {
                        if (businessData) {
                          setBusinessData({
                            ...businessData,
                            settings: {
                              ...businessData.settings,
                              allowGlobalCustomers: e.target.checked,
                            },
                          });
                        }
                      }}
                      className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Allow global customers (customers without explicit assignment)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    When enabled, customers with global access can interact with your business using the General class.
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <Gift className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Customer Points Requests</h3>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">How Customer Requests Work</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Customers can request points from your business. You can approve or reject these requests within 3 days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowCustomerRequests"
                      checked={businessData?.settings?.allowCustomerRequests || false}
                      onChange={(e) => {
                        if (businessData) {
                          setBusinessData({
                            ...businessData,
                            settings: {
                              ...businessData.settings,
                              allowCustomerRequests: e.target.checked
                            }
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Allow Customer Points Requests
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Let customers request points from your business (you can approve or reject)
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-orange text-white px-6 py-3 rounded-lg hover:bg-orange-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </RoleRedirect>
  );
}
