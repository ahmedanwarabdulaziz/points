'use client';

import { useState, useEffect } from 'react';
import { QrCode, X, Copy, Share2 } from 'lucide-react';
import { generateQRCodeUrl } from '@/lib/customerCode';
import QRCode from 'qrcode';

interface CustomerQRCodeProps {
  customer: {
    id: string;
    name?: string;
    customerCode?: string;
    businessId?: string;
  };
}

export default function CustomerQRCode({ customer }: CustomerQRCodeProps) {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrCodeLoading, setQrCodeLoading] = useState(false);

  useEffect(() => {
    if (showQRDialog && customer.customerCode) {
      generateQRCode();
    }
  }, [showQRDialog, customer.customerCode]);

  const generateQRCode = async () => {
    if (!customer.customerCode) return;
    
    try {
      setQrCodeLoading(true);
      const qrCodeUrl = generateQRCodeUrl(customer.customerCode);
      
      // Generate QR code using the qrcode library
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e3a8a', // Navy blue
          light: '#ffffff', // White
        },
        errorCorrectionLevel: 'M',
      });
      
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const copyCustomerCode = () => {
    if (customer.customerCode) {
      navigator.clipboard.writeText(customer.customerCode);
      // You could add a toast notification here
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && customer.customerCode) {
      try {
        await navigator.share({
          title: 'My Customer Code',
          text: `My customer code is: ${customer.customerCode}`,
          url: generateQRCodeUrl(customer.customerCode)
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  // Show QR button even if no code exists, but with different behavior
  const hasCode = !!customer.customerCode;
  
  // Function to generate customer code if missing
  const generateMissingCode = async () => {
    if (!customer.businessId) {
      console.error('Cannot generate code: customer not assigned to business');
      return;
    }
    
    try {
      setQrCodeLoading(true);
      
      // Generate a simple customer code
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const customerCode = `${customer.businessId.substring(0, 3).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
      const qrCodeUrl = generateQRCodeUrl(customerCode);
      
      // Update the customer document
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      await updateDoc(doc(db, 'users', customer.id), {
        customerCode: customerCode,
        qrCodeUrl: qrCodeUrl,
        updatedAt: new Date()
      });
      
      // Update local state
      setQrCodeDataUrl(qrCodeUrl);
      
      console.log('✅ Customer code generated:', customerCode);
      
    } catch (error) {
      console.error('Error generating customer code:', error);
    } finally {
      setQrCodeLoading(false);
    }
  };

  return (
    <>
      {/* QR Code Button - Fixed at bottom right */}
      <button
        onClick={() => setShowQRDialog(true)}
        className="fixed bottom-6 right-6 bg-orange text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-50"
        title="Show QR Code"
      >
        <QrCode className="h-6 w-6" />
      </button>

      {/* QR Code Dialog */}
      {showQRDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-navy">Your QR Code</h3>
              <button
                onClick={() => setShowQRDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {hasCode ? (
              <>
                {/* Customer Info */}
                <div className="text-center mb-6">
                  <h4 className="font-medium text-gray-900">{customer.name || 'Customer'}</h4>
                  <p className="text-gray-600 text-sm">Customer Code: {customer.customerCode}</p>
                </div>

            {/* QR Code Display */}
            <div className="flex justify-center mb-6">
              {qrCodeLoading ? (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
                </div>
              ) : qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Customer QR Code" 
                  className="w-48 h-48 rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={copyCustomerCode}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Code</span>
              </button>
              <button
                onClick={shareQRCode}
                className="flex-1 bg-navy text-white py-2 px-4 rounded-lg hover:bg-navy-light transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How to use:</strong> Show this QR code to the business owner, 
                or tell them your customer code: <strong>{customer.customerCode}</strong>
              </p>
            </div>
              </>
            ) : (
              <>
                {/* No Code Message */}
                <div className="text-center mb-6">
                  <div className="bg-orange-100 p-4 rounded-lg mb-4">
                    <QrCode className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                    <h4 className="text-lg font-semibold text-orange-900 mb-2">QR Code Not Available</h4>
                    <p className="text-orange-800">
                      Your QR code hasn&apos;t been generated yet.
                    </p>
                  </div>
                  
                  {/* Generate Code Button */}
                  {customer.businessId ? (
                    <div className="mb-4">
                      <button
                        onClick={generateMissingCode}
                        disabled={qrCodeLoading}
                        className="bg-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {qrCodeLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </div>
                        ) : (
                          'Generate My QR Code'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-red-900 mb-2">Account Issue</h5>
                      <p className="text-sm text-red-800">
                        Your account is not properly assigned to a business. Please contact support.
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">What you can do:</h5>
                    <ul className="text-sm text-blue-800 text-left space-y-1">
                      <li>• Click &quot;Generate My QR Code&quot; above to create your code</li>
                      <li>• Contact your business owner if you need help</li>
                      <li>• Once generated, your QR code will appear here</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
