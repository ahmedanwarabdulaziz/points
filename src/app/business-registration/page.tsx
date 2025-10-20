'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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


export default function BusinessRegistration() {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    logo: null as File | null,
    industryId: '',
    typeId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [industries, setIndustries] = useState<BusinessIndustry[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbo3xd0df';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Points-app';
  
  const { user, updateUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      
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
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset type when industry changes
      ...(name === 'industryId' ? { typeId: '' } : {})
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      try {
        const objectUrl = URL.createObjectURL(file);
        setLogoPreviewUrl(objectUrl);
      } catch {}
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      // Upload logo to Firebase Storage if provided
      let uploadedLogoUrl = '';
      if (formData.logo) {
        try {
          // Validate file type and size (<= 2MB)
          const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
          if (!allowed.includes(formData.logo.type)) {
            throw new Error('Unsupported file type. Please upload PNG, JPG, SVG, or WEBP.');
          }
          const maxBytes = 2 * 1024 * 1024;
          if (formData.logo.size > maxBytes) {
            throw new Error('Logo is too large. Max size is 2MB.');
          }

          // Upload to Cloudinary (unsigned)
          setUploadingLogo(true);
          setUploadProgress(0);
          const form = new FormData();
          form.append('file', formData.logo);
          form.append('upload_preset', uploadPreset);
          form.append('folder', `businesses/${user.uid}`);
          form.append('public_id', 'logo');

          // Use XMLHttpRequest to track progress
          uploadedLogoUrl = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(pct);
              }
            };
            xhr.onload = () => {
              try {
                const res = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
                  resolve(res.secure_url as string);
                } else {
                  reject(new Error(res.error?.message || 'Cloudinary upload failed'));
                }
              } catch (err) {
                reject(err);
              }
            };
            xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
            xhr.send(form);
          });
          setUploadingLogo(false);
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError);
          setUploadingLogo(false);
          throw new Error(uploadError instanceof Error ? uploadError.message : 'Failed to upload logo. Please try again.');
        }
      }

      // Create business document
      const businessData = {
        id: user.uid,
        name: formData.businessName,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        address: formData.address,
        industryId: formData.industryId,
        typeId: formData.typeId,
        ownerId: user.uid,
        status: 'pending',
        createdAt: new Date(),
        settings: {
          allowReferrals: true,
          defaultPointsPerDollar: 1,
          customBranding: {
            primaryColor: '#1e3a8a',
            secondaryColor: '#f97316',
            // Store a permanent URL from Firebase Storage (not a temporary blob URL)
            logo: uploadedLogoUrl,
          }
        }
      };

      await setDoc(doc(db, 'businesses', user.uid), businessData);
      
      // Update user role to business
      await updateUserRole('business');
      
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/business-dashboard');
      }, 2000);
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your business registration has been submitted for admin approval. 
            You&apos;ll receive an email once it&apos;s approved.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-navy p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy">Register Your Business</h1>
                <p className="text-gray-600">Fill out the form below to register your business</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                placeholder="Describe your business and what you offer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="industryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  id="industryId"
                  name="industryId"
                  required
                  value={formData.industryId}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                  disabled={loadingCategories}
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <p className="text-xs text-gray-500 mt-1">Loading industries...</p>
                )}
              </div>

              <div>
                <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  id="typeId"
                  name="typeId"
                  required
                  value={formData.typeId}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                  disabled={!formData.industryId || loadingCategories}
                >
                  <option value="">Select Business Type</option>
                  {businessTypes
                    .filter(type => type.industryId === formData.industryId)
                    .map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                </select>
                {!formData.industryId && (
                  <p className="text-xs text-gray-500 mt-1">Please select an industry first</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange focus:border-orange"
                  placeholder="Enter business address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </label>
                {formData.logo && (
                  <span className="text-sm text-gray-600">{formData.logo.name}</span>
                )}
              </div>
              {/* Preview and progress */}
              <div className="mt-3 flex items-center space-x-4">
                {logoPreviewUrl && (
                  <img src={logoPreviewUrl} alt="Logo preview" className="h-16 w-16 rounded-md object-cover border border-gray-200" />
                )}
                {uploadProgress !== null && (
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-orange h-2.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{uploadProgress}%</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recommended size: 200x200px. Supported formats: JPG, PNG, SVG
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
