'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    setTimestamp(new Date().toISOString());
    
    // Check environment variables
    setEnvVars({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-8">CADEALA Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
          <div className="space-y-2">
            <p><strong>Timestamp:</strong> {timestamp}</p>
            <p><strong>Node Environment:</strong> {envVars.NODE_ENV}</p>
            <p><strong>Firebase API Key:</strong> {envVars.NEXT_PUBLIC_FIREBASE_API_KEY}</p>
            <p><strong>Firebase Project ID:</strong> {envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            <p><strong>Cloudinary Cloud Name:</strong> {envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">App Status</h2>
          <p className="text-green-600 font-semibold">✅ App is running successfully!</p>
          <p className="text-gray-600 mt-2">If you can see this page, the basic routing is working.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Check if environment variables are properly set</li>
            <li>Test the home page at <code className="bg-gray-100 px-2 py-1 rounded">/</code></li>
            <li>Test the API at <code className="bg-gray-100 px-2 py-1 rounded">/api/health</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
