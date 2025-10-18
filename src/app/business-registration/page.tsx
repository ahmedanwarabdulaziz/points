'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BusinessRegistration() {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    logo: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user, updateUserRole } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      // Create business document
      const businessData = {
        id: user.uid,
        name: formData.businessName,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        address: formData.address,
        ownerId: user.uid,
        status: 'pending',
        createdAt: new Date(),
        settings: {
          allowReferrals: true,
          defaultPointsPerDollar: 1,
          customBranding: {
            primaryColor: '#1e3a8a',
            secondaryColor: '#f97316',
            logo: formData.logo ? URL.createObjectURL(formData.logo) : '',
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
      
    } catch (error: any) {
      setError(error.message);
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
            You'll receive an email once it's approved.
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
