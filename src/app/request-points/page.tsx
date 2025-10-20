'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { createPointsRequest } from '@/lib/pointsRequest';

export default function RequestPoints() {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  const [points, setPoints] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableBusinesses, setAvailableBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [resolvingBusinesses, setResolvingBusinesses] = useState(false);

  // Redirect if not customer user
  useEffect(() => {
    if (appUser && appUser.role !== 'customer') {
      router.push('/dashboard');
    }
  }, [appUser, router]);

  // If customer has global access, load businesses that allow global customers
  useEffect(() => {
    const resolveBusinesses = async () => {
      if (!appUser || appUser.role !== 'customer') return;
      if (!appUser.globalAccess) return;
      try {
        setResolvingBusinesses(true);
        const q = query(
          collection(db, 'businesses'),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const list: Array<{ id: string; name: string }> = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as { settings?: { allowGlobalCustomers?: boolean }; name?: string };
          const allow = data?.settings?.allowGlobalCustomers ?? true;
          if (allow) {
            list.push({ id: docSnap.id, name: data.name || 'Business' });
          }
        });
        setAvailableBusinesses(list);
        if (list.length === 1) setSelectedBusinessId(list[0].id);
      } catch (e) {
        console.error('Failed to load businesses for global access', e);
      } finally {
        setResolvingBusinesses(false);
      }
    };
    resolveBusinesses();
  }, [appUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appUser) {
      setError('Unable to process request. Please try again.');
      return;
    }

    // Determine target business
    const targetBusinessId = appUser.businessId || selectedBusinessId;
    if (!targetBusinessId) {
      setError('Please select a business to request points from.');
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

  const handleConfirmRequest = async () => {
    if (!appUser) return;
    const targetBusinessId = appUser.businessId || selectedBusinessId;
    if (!targetBusinessId) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const requestData = {
        customerId: appUser.id,
        businessId: targetBusinessId,
        customerName: appUser.name || 'Customer',
        customerCode: appUser.customerCode || '',
        pointsRequested: parseInt(points),
        reference: reference.trim(),
        note: note.trim() || undefined
      };

      await createPointsRequest(requestData);

      setSuccess(`Points request sent successfully! You'll be notified when the business responds.`);
      setShowConfirmation(false);
      
      // Reset form
      setPoints('');
      setReference('');
      setNote('');
      
    } catch (error) {
      console.error('Error creating points request:', error);
      setError('Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!appUser || appUser.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only customers can access this page.</p>
        </div>
      </div>
    );
  }

  // If customer lacks explicit business, show selector when globalAccess is enabled

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
            <div className="bg-blue-500 p-2 rounded-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Request Points</h1>
              <p className="text-gray-600">
                {appUser?.businessId ? 'Request points from your business' : 'Select a business to request points from'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-6">
            {appUser?.businessId ? 'Request Points' : 'Request Points from a Business'}
          </h2>

          {/* Business selector for global customers */}
          {!appUser?.businessId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business *</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={resolvingBusinesses}
                required
              >
                <option value="">{resolvingBusinesses ? 'Loading businesses...' : 'Select a business'}</option>
                {availableBusinesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only businesses that accept global customers are listed.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Requested *
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Enter points to request"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How many points would you like to request?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference *
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., Purchase #12345, Service completed, Birthday bonus"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                What is this request for?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any additional details..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Business Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Business:</span>
                  <span className="font-medium">
                    {appUser?.businessId
                      ? 'Your assigned business'
                      : (availableBusinesses.find(b => b.id === selectedBusinessId)?.name || 'Not selected')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Your Code:</span>
                  <span className="font-medium">{appUser.customerCode || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Points:</span>
                  <span className="font-medium">{appUser.points || 0}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Sending Request...' : 'Send Request'}</span>
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Request Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your request will be sent to {appUser?.businessId ? 'your business' : (availableBusinesses.find(b => b.id === selectedBusinessId)?.name || 'the selected business')}</li>
                <li>• The business has 3 days to respond</li>
                <li>• You&apos;ll be notified when they approve or reject</li>
                <li>• Approved points will be added to your account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Confirm Points Request</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Business:</span>
                <span className="font-medium">{appUser?.businessId ? 'your business' : (availableBusinesses.find(b => b.id === selectedBusinessId)?.name || 'Not selected')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Points:</span>
                <span className="font-medium">{points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{reference}</span>
              </div>
              {note && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Note:</span>
                  <span className="font-medium">{note}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                disabled={submitting}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
