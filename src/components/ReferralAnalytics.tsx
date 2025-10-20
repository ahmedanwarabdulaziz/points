'use client';

import { useState, useEffect } from 'react';
import { ReferralRecord } from '@/types';
import { 
  TrendingUp, 
  Users, 
  Star, 
  Gift, 
  DollarSign,
  Calendar,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';
import { getBusinessReferralAnalytics } from '@/lib/referral';

interface ReferralAnalyticsProps {
  businessId: string;
}

export default function ReferralAnalytics({ businessId }: ReferralAnalyticsProps) {
  const [analytics, setAnalytics] = useState<{
    totalReferrals: number;
    totalReferrerPoints: number;
    totalRefereePoints: number;
    recentReferrals: ReferralRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getBusinessReferralAnalytics(businessId);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching referral analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [businessId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Referral Data</h3>
          <p className="text-gray-600">Referral analytics will appear here once customers start referring others.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange to-orange-light rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold">{analytics.totalReferrals}</p>
            </div>
            <Users className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-navy to-navy-light rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-100 text-sm">Points Awarded</p>
              <p className="text-2xl font-bold">{analytics.totalReferrerPoints}</p>
            </div>
            <Star className="h-8 w-8 text-navy-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Bonus Points</p>
              <p className="text-2xl font-bold">{analytics.totalRefereePoints}</p>
            </div>
            <Gift className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold">
                ${((analytics.totalReferrerPoints + analytics.totalRefereePoints) * 0.01).toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-navy flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Referrals
          </h3>
        </div>
        
        <div className="p-6">
          {analytics.recentReferrals.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Referrals</h4>
              <p className="text-gray-600">Recent referral activity will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recentReferrals.map((referral) => (
                <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{referral.refereeName}</h4>
                        <p className="text-sm text-gray-600">{referral.refereeEmail}</p>
                        <p className="text-xs text-gray-500">
                          Referred by: {referral.referrerId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="text-orange font-medium">+{referral.referrerPoints}</span> referrer
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-green-600 font-medium">+{referral.refereePoints}</span> referee
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Completed on {referral.completedAt?.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referral Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-navy mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Referral Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange" />
                <span className="text-sm font-medium text-gray-900">Average Referrer Points</span>
              </div>
              <span className="text-lg font-bold text-orange">
                {analytics.totalReferrals > 0 
                  ? Math.round(analytics.totalReferrerPoints / analytics.totalReferrals)
                  : 0
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Average Referee Points</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {analytics.totalReferrals > 0 
                  ? Math.round(analytics.totalRefereePoints / analytics.totalReferrals)
                  : 0
                }
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-navy" />
                <span className="text-sm font-medium text-gray-900">Total Points Value</span>
              </div>
              <span className="text-lg font-bold text-navy">
                ${((analytics.totalReferrerPoints + analytics.totalRefereePoints) * 0.01).toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Growth Rate</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {analytics.totalReferrals > 0 ? 'Active' : 'New'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
