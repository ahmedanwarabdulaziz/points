'use client';

import { useState, useEffect } from 'react';
import { User, ReferralRecord } from '@/types';
import { 
  Share2, 
  Users, 
  Star, 
  Copy, 
  QrCode, 
  Gift, 
  TrendingUp,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { generateReferralLink, getCustomerReferralHistory, generateReferralQRCode } from '@/lib/referral';

interface ReferralDashboardProps {
  customer: User;
  businessId: string;
  classId: string;
}

export default function ReferralDashboard({ customer, businessId, classId }: ReferralDashboardProps) {
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrCodeLoading, setQrCodeLoading] = useState(true);

  useEffect(() => {
    const fetchReferralHistory = async () => {
      try {
        const history = await getCustomerReferralHistory(customer.id);
        setReferralHistory(history);
      } catch (error) {
        console.error('Error fetching referral history:', error);
      } finally {
        setLoading(false);
      }
    };

    const generateQRCode = async () => {
      try {
        setQrCodeLoading(true);
        const qrCodeUrl = await generateReferralQRCode(customer.id, businessId, ''); // classId not needed
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setQrCodeLoading(false);
      }
    };

    fetchReferralHistory();
    generateQRCode();
  }, [customer.id, businessId, classId]);

  const referralLink = generateReferralLink(customer.id, businessId, ''); // classId not needed for referral links

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me on ${customer.businessName || 'CADEALA'}`,
          text: `I'm earning rewards and you can too! Use my referral link to get bonus points when you sign up.`,
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="bg-gradient-to-r from-orange to-orange-light rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Referrals</h2>
          <Gift className="h-8 w-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold">{customer.referralCount || 0}</div>
            <div className="text-sm text-orange-100">Total Referrals</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold">{customer.referralPoints || 0}</div>
            <div className="text-sm text-orange-100">Points Earned</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold">${((customer.referralPoints || 0) * 0.01).toFixed(2)}</div>
            <div className="text-sm text-orange-100">Value Earned</div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-navy mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Your Referral Link
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={shareReferral}
              className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors flex items-center"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Share this link with friends to earn {customer.referralPoints || 100} points for each successful referral!
          </p>
        </div>
      </div>

      {/* QR Code for Referral */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-navy mb-4 flex items-center">
          <QrCode className="h-5 w-5 mr-2" />
          QR Code
        </h3>
        <div className="text-center">
          {qrCodeLoading ? (
            <div className="bg-gray-100 rounded-lg p-8 inline-block mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating QR code...</p>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="bg-white rounded-lg p-4 inline-block mb-4 border border-gray-200">
              <img 
                src={qrCodeDataUrl} 
                alt="Referral QR Code" 
                className="h-32 w-32 mx-auto"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 inline-block mb-4">
              <QrCode className="h-32 w-32 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 mt-2">QR code unavailable</p>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            Friends can scan this QR code to join with your referral
          </p>
          {qrCodeDataUrl && (
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrCodeDataUrl;
                link.download = `referral-qr-${customer.id}.png`;
                link.click();
              }}
              className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors text-sm font-medium"
            >
              Download QR Code
            </button>
          )}
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-navy mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Referral History
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading referral history...</p>
          </div>
        ) : referralHistory.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h4>
            <p className="text-gray-600 mb-4">Start sharing your referral link to earn points!</p>
            <button
              onClick={shareReferral}
              className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange-light transition-colors"
            >
              Share Your Link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {referralHistory.map((referral) => (
              <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{referral.refereeName}</h4>
                      <p className="text-sm text-gray-600">{referral.refereeEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-orange">+{referral.referrerPoints}</div>
                    <div className="text-sm text-gray-600">points earned</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Joined on {referral.completedAt?.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How Referrals Work */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-navy mb-4">How Referrals Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-orange text-white p-2 rounded-full">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">You Earn Points</h4>
                <p className="text-sm text-gray-600">
                  Get {customer.referralPoints || 100} points for each friend who joins using your link
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-navy text-white p-2 rounded-full">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">They Get Bonus Points</h4>
                <p className="text-sm text-gray-600">
                  Your friends get bonus points when they sign up with your referral
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Easy Sharing</h4>
                <p className="text-sm text-gray-600">
                  Share your link via text, email, or social media
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-500 text-white p-2 rounded-full">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track Your Success</h4>
                <p className="text-sm text-gray-600">
                  Monitor your referrals and points in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
