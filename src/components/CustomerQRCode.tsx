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
  const [localCustomerCode, setLocalCustomerCode] = useState<string | undefined>(customer.customerCode);

  useEffect(() => {
    if (showQRDialog && (localCustomerCode || customer.customerCode)) {
      generateQRCode();
    }
  }, [showQRDialog, customer.customerCode, localCustomerCode]);

  // Keep local code in sync when prop updates
  useEffect(() => {
    if (customer.customerCode && customer.customerCode !== localCustomerCode) {
      setLocalCustomerCode(customer.customerCode);
    }
  }, [customer.customerCode]);

  // Auto-generate a code if missing
  useEffect(() => {
    if (!customer.customerCode) {
      generateMissingCode();
    }
  }, [customer.id, customer.customerCode]);

  const generateQRCode = async () => {
    const code = localCustomerCode || customer.customerCode;
    if (!code) return;
    
    try {
      setQrCodeLoading(true);
      const qrCodeUrl = generateQRCodeUrl(code);
      
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

  // Determine if we have a code (prop or locally generated)
  const hasCode = !!(localCustomerCode || customer.customerCode);
  
  // Function to generate customer code if missing
  const generateMissingCode = async () => {
    try {
      setQrCodeLoading(true);

      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const { generateCustomerCode, generateGlobalCustomerCode, generateQRCodeUrl } = await import('@/lib/customerCode');

      // If customer is assigned to a business, generate business-based code; else generate global code
      let newCode: string;
      if (customer.businessId && customer.businessId.trim() !== '') {
        newCode = await generateCustomerCode(customer.id, customer.businessId);
      } else {
        newCode = await generateGlobalCustomerCode(customer.id);
      }

      const qrCodeUrl = generateQRCodeUrl(newCode);

      await updateDoc(doc(db, 'users', customer.id), {
        customerCode: newCode,
        qrCodeUrl: qrCodeUrl,
        updatedAt: new Date()
      });

      // Update local state so UI renders immediately without refresh
      setLocalCustomerCode(newCode);

      const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeDataUrl(dataUrl);

      console.log('✅ Customer code generated:', newCode);
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
                {/* Auto-generation status */}
                <div className="text-center mb-6">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {qrCodeLoading ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange"></div>
                    ) : (
                      <QrCode className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {qrCodeLoading ? 'Generating your QR code...' : 'Preparing your QR code...'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
