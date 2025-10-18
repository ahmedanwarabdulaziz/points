'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Camera, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { parseQRCode } from '@/lib/qrCode';

export default function ScanQR() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<{ businessName: string; className: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, appUser } = useAuth();
  const router = useRouter();

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleQRScan = (qrData: string) => {
    const parsedData = parseQRCode(qrData);
    
    if (!parsedData) {
      setError('Invalid QR code. Please try again.');
      return;
    }

    setScannedData(parsedData);
    stopScanning();
    
    // Simulate processing
    setTimeout(() => {
      setSuccess(true);
    }, 1000);
  };

  const handleJoinBusiness = () => {
    if (scannedData) {
      // Here you would implement the logic to join the business
      // This would involve creating a customer record and assigning them to the business
      console.log('Joining business:', scannedData);
      router.push('/dashboard');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Successfully Joined!</h2>
          <p className="text-gray-600 mb-4">
            You&apos;ve been added to {scannedData?.businessName} as a {scannedData?.className} member.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-orange text-white px-6 py-3 rounded-lg hover:bg-orange-light transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-navy">Scan QR Code</h1>
                <p className="text-gray-600">Scan a QR code to join a business</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isScanning && !scannedData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="bg-navy p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-navy mb-4">Scan QR Code</h2>
            <p className="text-gray-600 mb-6">
              Point your camera at a QR code to join a business and start earning points.
            </p>
            <button
              onClick={startScanning}
              className="bg-orange text-white px-6 py-3 rounded-lg hover:bg-orange-light transition-colors inline-flex items-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Scanning
            </button>
          </div>
        )}

        {isScanning && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-navy mb-2">Scanning...</h2>
              <p className="text-gray-600">Point your camera at the QR code</p>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg"
                playsInline
              />
              <div className="absolute inset-0 border-2 border-orange rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-orange"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-orange"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-orange"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-orange"></div>
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={stopScanning}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          </div>
        )}

        {scannedData && !success && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-navy mb-2">QR Code Scanned!</h2>
              <p className="text-gray-600">Review the details below</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium">{scannedData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{scannedData.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">QR Code</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setScannedData(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Scan Again
              </button>
              <button
                onClick={handleJoinBusiness}
                className="flex-1 bg-orange text-white py-3 rounded-lg hover:bg-orange-light transition-colors"
              >
                Join Business
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
