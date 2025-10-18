'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export default function FirebaseDebugger() {
  const { user, appUser, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<{ permissions: string; userData: User | null } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user && !loading) {
      checkPermissions();
    }
  }, [user, loading]);

  const checkPermissions = async () => {
    try {
      setError('');
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      // Try to create a test document
      const testData = {
        test: true,
        timestamp: new Date(),
        userId: user!.uid
      };
      
      await setDoc(doc(db, 'test', user!.uid), testData);
      
      setDebugInfo({
        permissions: 'Write access confirmed',
        userData: userData as User | null
      });
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDebugInfo({
        permissions: 'Write access denied',
        userData: null
      });
    }
  };

  if (loading) {
    return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800">Firebase Debugger</h3>
      <p className="text-yellow-700">Loading...</p>
    </div>;
  }

  if (!user) {
    return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="font-semibold text-gray-800">Firebase Debugger</h3>
      <p className="text-gray-700">Not authenticated</p>
    </div>;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">Firebase Debugger</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold">User ID:</span> {user?.uid}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-semibold">Email Verified:</span> {user?.emailVerified ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-semibold">App User Role:</span> {appUser?.role || 'Not set'}
        </div>
        <div>
          <span className="font-semibold">User Document:</span> {debugInfo?.userData ? 'Exists' : 'Missing'}
        </div>
        {debugInfo?.permissions && (
          <div>
            <span className="font-semibold">Permissions:</span> {debugInfo.permissions}
          </div>
        )}
      </div>
      
      <button 
        onClick={checkPermissions}
        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Test Permissions
      </button>
    </div>
  );
}
