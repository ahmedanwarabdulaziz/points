'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestAuth() {
  const { user, appUser, loading, signUp, signIn } = useAuth();
  const [testResults, setTestResults] = useState<{ test: string; result: string; success: boolean; timestamp: Date; message: string }[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test: string, result: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { test, result: message, success: result === 'success', timestamp: new Date(), message }]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    try {
      // Test 1: Check authentication
      if (!user) {
        addResult('Authentication', 'error', 'User not authenticated');
        return;
      }
      addResult('Authentication', 'success', `User authenticated: ${user.email}`);

      // Test 2: Check user document
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          addResult('User Document', 'success', 'User document exists');
        } else {
          addResult('User Document', 'error', 'User document does not exist');
        }
      } catch (err: unknown) {
        addResult('User Document', 'error', `Error reading user document: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Test 3: Test write permissions
      try {
        await setDoc(doc(db, 'test', user.uid), {
          test: true,
          timestamp: new Date(),
          userId: user.uid
        });
        addResult('Write Permissions', 'success', 'Write permissions working');
      } catch (err: unknown) {
        addResult('Write Permissions', 'error', `Write error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Test 4: Test collection creation
      try {
        await addDoc(collection(db, 'testCollection'), {
          test: true,
          userId: user.uid,
          timestamp: new Date()
        });
        addResult('Collection Creation', 'success', 'Collection creation working');
      } catch (err: unknown) {
        addResult('Collection Creation', 'error', `Collection creation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      // Test 5: Test customer document creation
      if (appUser?.role === 'customer') {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            businessId: '',
            classId: '',
            userId: user.uid,
            name: 'Test Customer',
            referralCode: 'TEST123',
            points: 0,
            totalEarned: 0,
            totalRedeemed: 0,
            status: 'active',
            createdAt: new Date(),
            lastActivity: new Date()
          });
          addResult('Customer Document', 'success', 'Customer document created');
        } catch (err: unknown) {
          addResult('Customer Document', 'error', `Customer document error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

    } catch (err: unknown) {
      addResult('General', 'error', `General error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-navy mb-6">Firebase Authentication Test</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Status:</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {user ? user.email : 'Not authenticated'}</div>
              <div><strong>App User:</strong> {appUser ? JSON.stringify(appUser) : 'Not loaded'}</div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={testing || !user}
              className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-4"
            >
              {testing ? 'Running Tests...' : 'Run Tests'}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.result === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{result.test}</span>
                    <span className="text-xs">{result.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm mt-1">{result.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
