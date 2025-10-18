'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-orange mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-red-800 font-semibold mb-2">Error Details:</p>
              <p className="text-xs text-red-700 break-all">{error.message}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={reset}
            className="inline-flex items-center justify-center w-full bg-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-light transition-colors"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </button>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Go Home
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
