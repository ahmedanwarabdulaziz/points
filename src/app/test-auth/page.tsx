'use client';

import { useState } from &apos;react';
import { useAuth } from &apos;@/contexts/AuthContext';
import { doc, getDoc, setDoc, collection, addDoc } from &apos;firebase/firestore';
import { db } from &apos;@/lib/firebase';

export default function TestAuth() {
  const { user, appUser, loading, signUp, signIn } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test: string, result: &apos;success&apos; | &apos;error&apos;, message: string) => {
    setTestResults(prev => [...prev, { test, result, message, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    try {
      // Test 1: Check authentication
      if (!user) {
        addResult(&apos;Authentication&apos;, &apos;error&apos;, &apos;User not authenticated&apos;);
        return;
      }
      addResult(&apos;Authentication&apos;, &apos;success&apos;, `User authenticated: ${user.email}`);

      // Test 2: Check user document
      try {
        const userDoc = await getDoc(doc(db, &apos;users&apos;, user.uid));
        if (userDoc.exists()) {
          addResult(&apos;User Document&apos;, &apos;success&apos;, &apos;User document exists&apos;);
        } else {
          addResult(&apos;User Document&apos;, &apos;error&apos;, &apos;User document does not exist&apos;);
        }
      } catch (err: unknown) {
        addResult(&apos;User Document&apos;, &apos;error&apos;, `Error reading user document: ${err.message}`);
      }

      // Test 3: Test write permissions
      try {
        await setDoc(doc(db, &apos;test&apos;, user.uid), {
          test: true,
          timestamp: new Date(),
          userId: user.uid
        });
        addResult(&apos;Write Permissions&apos;, &apos;success&apos;, &apos;Write permissions working&apos;);
      } catch (err: unknown) {
        addResult(&apos;Write Permissions&apos;, &apos;error&apos;, `Write error: ${err.message}`);
      }

      // Test 4: Test collection creation
      try {
        await addDoc(collection(db, &apos;testCollection&apos;), {
          test: true,
          userId: user.uid,
          timestamp: new Date()
        });
        addResult(&apos;Collection Creation&apos;, &apos;success&apos;, &apos;Collection creation working&apos;);
      } catch (err: unknown) {
        addResult(&apos;Collection Creation&apos;, &apos;error&apos;, `Collection creation error: ${err.message}`);
      }

      // Test 5: Test customer document creation
      if (appUser?.role === &apos;customer&apos;) {
        try {
          await setDoc(doc(db, &apos;users&apos;, user.uid), {
            id: user.uid,
            businessId: &apos;',
            classId: &apos;',
            userId: user.uid,
            name: &apos;Test Customer&apos;,
            referralCode: &apos;TEST123&apos;,
            points: 0,
            totalEarned: 0,
            totalRedeemed: 0,
            status: &apos;active&apos;,
            createdAt: new Date(),
            lastActivity: new Date()
          });
          addResult(&apos;Customer Document&apos;, &apos;success&apos;, &apos;Customer document created&apos;);
        } catch (err: unknown) {
          addResult(&apos;Customer Document&apos;, &apos;error&apos;, `Customer document error: ${err.message}`);
        }
      }

    } catch (err: unknown) {
      addResult(&apos;General&apos;, &apos;error&apos;, `General error: ${err.message}`);
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
              <div><strong>Loading:</strong> {loading ? &apos;Yes&apos; : &apos;No&apos;}</div>
              <div><strong>User:</strong> {user ? user.email : &apos;Not authenticated&apos;}</div>
              <div><strong>App User:</strong> {appUser ? JSON.stringify(appUser) : &apos;Not loaded&apos;}</div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={testing || !user}
              className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-4"
            >
              {testing ? &apos;Running Tests...&apos; : &apos;Run Tests&apos;}
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
                    result.result === &apos;success&apos;
                      ? &apos;bg-green-50 border-green-200 text-green-800&apos;
                      : &apos;bg-red-50 border-red-200 text-red-800&apos;
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
