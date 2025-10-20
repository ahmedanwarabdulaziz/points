'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Clock, CheckCircle, X, AlertCircle, User, Calendar } from 'lucide-react';
import { getPendingPointsRequests, getAllPointsRequests, approvePointsRequest, rejectPointsRequest } from '@/lib/pointsRequest';
import { PointsRequest } from '@/types';

export default function PointsRequests() {
  const { appUser, business, loading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<PointsRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');

  // Redirect if not business user
  useEffect(() => {
    if (appUser && appUser.role !== 'business') {
      router.push('/dashboard');
    }
  }, [appUser, router]);

  // Load requests
  useEffect(() => {
    if (business) {
      loadRequests();
    }
  }, [business, selectedTab]);

  const loadRequests = async () => {
    if (!business) return;

    try {
      setLoadingRequests(true);
      setError('');

      const requestsData = selectedTab === 'pending' 
        ? await getPendingPointsRequests(business.id)
        : await getAllPointsRequests(business.id);

      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!appUser) return;

    try {
      setError('');
      setSuccess('');

      await approvePointsRequest(requestId, appUser.id);
      setSuccess('Points request approved successfully!');
      
      // Reload requests
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!appUser) return;

    try {
      setError('');
      setSuccess('');

      await rejectPointsRequest(requestId, appUser.id);
      setSuccess('Points request rejected.');
      
      // Reload requests
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!appUser || appUser.role !== 'business') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only business owners can access this page.</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Business Found</h1>
          <p className="text-gray-600">You need to have a business to manage points requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-orange p-2 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Points Requests</h1>
              <p className="text-gray-600">Manage customer points requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'pending'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Requests
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Requests List */}
        {loadingRequests ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {selectedTab === 'pending' 
                ? 'No pending requests at the moment.'
                : 'No points requests have been made yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{request.customerName}</h3>
                      <p className="text-sm text-gray-600">Code: {request.customerCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Points Requested</p>
                    <p className="font-medium text-lg text-navy">{request.pointsRequested}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reference</p>
                    <p className="font-medium text-gray-900">{request.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requested</p>
                    <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                  </div>
                </div>

                {request.note && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Note</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{request.note}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {request.status === 'approved' && request.approvedAt && (
                  <div className="text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Approved on {formatDate(request.approvedAt)}
                  </div>
                )}

                {request.status === 'rejected' && request.rejectedAt && (
                  <div className="text-sm text-red-600">
                    <X className="h-4 w-4 inline mr-1" />
                    Rejected on {formatDate(request.rejectedAt)}
                  </div>
                )}

                {request.status === 'expired' && (
                  <div className="text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Expired on {formatDate(request.expiresAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
