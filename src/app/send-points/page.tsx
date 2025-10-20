'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, User, ArrowLeft, Send, AlertCircle, CheckCircle, Camera, X } from 'lucide-react';
import { getCustomerByCode, validateCustomerCode } from '@/lib/customerCode';
import { generateQRCodeUrl } from '@/lib/customerCode';

export default function SendPoints() {
  const { appUser, business } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerCodeFromUrl = searchParams.get('code');

  const [customerCode, setCustomerCode] = useState(customerCodeFromUrl || '');
  const [customer, setCustomer] = useState<{id: string; name: string; customerCode: string; businessId: string; points?: number} | null>(null);
  const [points, setPoints] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');

  // Redirect if not business user
  useEffect(() => {
    if (appUser && appUser.role !== 'business') {
      router.push('/dashboard');
    }
  }, [appUser, router]);

  // Pre-fill customer code from URL
  useEffect(() => {
    if (customerCodeFromUrl) {
      setCustomerCode(customerCodeFromUrl);
      handleCustomerCodeSubmit(customerCodeFromUrl);
    }
  }, [customerCodeFromUrl]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) {
      setError('Please find a customer first');
      return;
    }

    if (!points || parseInt(points) <= 0) {
      setError('Please enter a valid points amount');
      return;
    }

    if (!reference.trim()) {
      setError('Please enter a reference');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // TODO: Implement actual points transfer
      // This would call the points transfer API
      console.log('Sending points:', {
        customerId: customer?.id,
        businessId: business?.id,
        points: parseInt(points),
        reference,
        note
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(`Successfully sent ${points} points to ${customer?.name || 'customer'}`);
      setShowConfirmation(false);
      
      // Reset form
      setCustomer(null);
      setCustomerCode('');
      setPoints('');
      setReference('');
      setNote('');
      
    } catch (error) {
      console.error('Error sending points:', error);
      setError('Failed to send points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (scannedCode: string) => {
    try {
      // Extract customer code from scanned QR code
      // QR code contains the customer code URL
      const url = new URL(scannedCode);
      const code = url.searchParams.get('code');
      
      if (code) {
        setCustomerCode(code);
        setShowQRScanner(false);
        setScannerError('');
        // Automatically fetch customer data
        handleCustomerCodeSubmit(code);
      } else {
        setScannerError('Invalid QR code format');
      }
    } catch (error) {
      setScannerError('Failed to read QR code. Please try again.');
    }
  };

  const handleCustomerCodeSubmit = async (code?: string) => {
    const codeToUse = code || customerCode;
    if (!codeToUse.trim()) return;

    try {
      setLoading(true);
      setError('');
      setScannerError('');

      const customerData = await getCustomerByCode(codeToUse);
      if (customerData) {
        setCustomer(customerData);
        setSuccess(`Customer found: ${customerData.name}`);
      } else {
        setError('Customer not found. Please check the code.');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Failed to fetch customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!appUser || appUser.role !== 'business') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only business owners can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-orange p-2 rounded-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Send Points</h1>
              <p className="text-gray-600">Transfer points directly to customers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Lookup */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Find Customer</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    placeholder="e.g., AB12345"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  />
                  <button
                    onClick={() => handleCustomerCodeSubmit()}
                    disabled={loading}
                    className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : 'Find'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter customer code or scan their QR code
                </p>
              </div>

              {/* QR Scanner Button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span>Scan Customer QR Code</span>
                </button>
              </div>

              {/* Customer Info */}
              {customer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-900">{customer.name}</h3>
                      <p className="text-sm text-green-700">Code: {customer.customerCode}</p>
                      <p className="text-sm text-green-700">Current Points: {customer.points || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800">{success}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Points Transfer Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Transfer Points</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Amount
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Enter points to send"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference *
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., Purchase #12345, Service completed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange focus:border-orange"
                />
              </div>

              <button
                type="submit"
                disabled={!customer || loading}
                className="w-full bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Points</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Confirm Points Transfer</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium">{customer?.customerCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Points:</span>
                <span className="font-medium">{points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{reference}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={loading}
                className="flex-1 bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Confirm Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy">Scan Customer QR Code</h3>
              <button
                onClick={() => setShowQRScanner(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">QR Scanner would be implemented here</p>
                <p className="text-sm text-gray-500 mt-2">
                  For now, you can manually enter the customer code above
                </p>
              </div>
              
              {scannerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{scannerError}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQRScanner(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Simulate QR scan for demo
                    const demoCode = 'AB12345';
                    handleQRScan(`https://cadeala.com/customer?code=${demoCode}`);
                  }}
                  className="flex-1 px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors"
                >
                  Demo Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
