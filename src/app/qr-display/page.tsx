'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Business, CustomerClass } from '@/types';
import { useEffect, useState, useRef, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode';
import { 
  Building2, 
  QrCode, 
  Download,
  Share2,
  Copy,
  ArrowLeft,
  Users
} from 'lucide-react';

function QRDisplayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [customerClass, setCustomerClass] = useState<CustomerClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const businessId = searchParams.get('business');
  const classId = searchParams.get('class');

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId || !classId) {
        router.push('/');
        return;
      }

      try {
        // Fetch business data
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          setBusiness({
            id: businessDoc.id,
            name: data.name || '',
            description: data.description || '',
            ownerId: data.ownerId || '',
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            settings: data.settings || {
              allowReferrals: true,
              defaultPointsPerDollar: 1
            }
          });
        }

        // Fetch customer class data
        const classDoc = await getDoc(doc(db, 'customerClasses', classId));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          setCustomerClass({
            id: classDoc.id,
            businessId: classData.businessId || '',
            name: classData.name || '',
            type: classData.type || 'custom',
            description: classData.description || '',
            features: classData.features || {},
            isActive: classData.isActive !== undefined ? classData.isActive : true,
            createdAt: classData.createdAt?.toDate?.() || new Date(),
            updatedAt: classData.updatedAt?.toDate?.() || new Date()
          });
        }

        // Generate QR code URL
        const baseUrl = window.location.origin;
        const signupUrl = `${baseUrl}/qr-signup?business=${businessId}&class=${classId}`;
        console.log('🔗 Generated QR signup URL:', signupUrl);
        setQrCodeUrl(signupUrl);

        // Generate QR code
        try {
          const qrDataUrl = await QRCode.toDataURL(signupUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrDataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, classId, router]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    // Create a canvas to add business branding to QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 450;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 450);

    // Draw QR code
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 50, 20, 300, 300);

      // Add business name
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(business?.name || 'Business', 200, 350);

      // Add class name
      ctx.fillStyle = '#f97316';
      ctx.font = '14px Arial';
      ctx.fillText(customerClass?.name || 'Customer Class', 200, 375);

      // Add "Scan to Join" text
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText('Scan to join and start earning points!', 200, 400);

      // Download the image
      const link = document.createElement('a');
      link.download = `qr-code-${business?.name?.replace(/\s+/g, '-').toLowerCase()}-${customerClass?.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImage.src = qrCodeDataUrl;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCodeUrl);
    alert('QR code link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${business?.name} - ${customerClass?.name}`,
        text: `Scan this QR code to join ${business?.name} and start earning points!`,
        url: qrCodeUrl
      });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-orange p-2 rounded-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy">QR Code</h1>
                <p className="text-gray-600">{business?.name} - {customerClass?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="bg-white border-4 border-gray-200 rounded-lg p-8 mb-6 inline-block">
                {qrCodeDataUrl ? (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">Generating QR Code...</p>
                      <p className="text-xs text-gray-400 mt-2">Please wait</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy">{business?.name}</h3>
                <p className="text-gray-600">{customerClass?.name} Class</p>
                <p className="text-sm text-gray-500">{customerClass?.description}</p>
              </div>
            </div>
          </div>

          {/* Business Info & Actions */}
          <div className="space-y-6">
            {/* Business Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-navy">Business Information</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{business?.name}</h3>
                  <p className="text-gray-600">{business?.description}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-orange" />
                    <span className="font-medium text-gray-900">{customerClass?.name} Class</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{customerClass?.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• {customerClass?.features?.pointsPerDollar || 1} point per dollar spent</p>
                    {(customerClass?.features?.referralBonus || 0) > 0 && (
                      <p>• {customerClass?.features?.referralBonus} bonus points for referrals</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-navy mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full bg-navy text-white py-3 px-4 rounded-lg hover:bg-navy-light transition-colors inline-flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </button>

                <button
                  onClick={handleShare}
                  className="w-full bg-orange text-white py-3 px-4 rounded-lg hover:bg-orange-light transition-colors inline-flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share QR Code
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Signup URL:</p>
                <p className="text-xs text-gray-500 break-all">{qrCodeUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QRDisplayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <QRDisplayContent />
    </Suspense>
  );
}
