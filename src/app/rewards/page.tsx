import { Gift, Star, CreditCard, ShoppingBag, Coffee, Music } from &apos;lucide-react';
import Link from &apos;next/link';

export default function Rewards() {
  const rewards = [
    {
      id: 1,
      name: &apos;Amazon Gift Card&apos;,
      points: 500,
      value: &apos;$5.00&apos;,
      icon: CreditCard,
      color: &apos;bg-blue-500&apos;,
      description: &apos;Get a $5 Amazon gift card&apos;
    },
    {
      id: 2,
      name: &apos;Starbucks Gift Card&apos;,
      points: 300,
      value: &apos;$3.00&apos;,
      icon: Coffee,
      color: &apos;bg-green-500&apos;,
      description: &apos;Enjoy your favorite coffee&apos;
    },
    {
      id: 3,
      name: &apos;Spotify Premium&apos;,
      points: 1000,
      value: &apos;$10.00&apos;,
      icon: Music,
      color: &apos;bg-purple-500&apos;,
      description: &apos;1 month of Spotify Premium&apos;
    },
    {
      id: 4,
      name: &apos;Target Gift Card&apos;,
      points: 800,
      value: &apos;$8.00&apos;,
      icon: ShoppingBag,
      color: &apos;bg-red-500&apos;,
      description: &apos;Shop at Target with your gift card&apos;
    },
    {
      id: 5,
      name: &apos;Apple Gift Card&apos;,
      points: 1200,
      value: &apos;$12.00&apos;,
      icon: CreditCard,
      color: &apos;bg-gray-500&apos;,
      description: &apos;Use at Apple Store or App Store&apos;
    },
    {
      id: 6,
      name: &apos;Netflix Gift Card&apos;,
      points: 600,
      value: &apos;$6.00&apos;,
      icon: Gift,
      color: &apos;bg-red-600&apos;,
      description: &apos;Enjoy your favorite shows&apos;
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy mb-2">Rewards & Gift Cards</h1>
            <p className="text-gray-600">Redeem your points for amazing rewards</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Points Balance */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Points</h2>
              <div className="text-4xl font-bold text-orange mb-2">2,500</div>
              <p className="text-gray-200">Available to redeem</p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-xl font-bold">$25.00</div>
                <div className="text-sm text-gray-200">Equivalent value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`${reward.color} p-3 rounded-lg`}>
                    <reward.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{reward.name}</h3>
                    <p className="text-sm text-gray-500">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-orange">{reward.points} pts</div>
                    <div className="text-sm text-gray-500">Required points</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-navy">{reward.value}</div>
                    <div className="text-sm text-gray-500">Value</div>
                  </div>
                </div>

                <button className="w-full bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange-light transition-colors font-medium">
                  Redeem Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How to Earn More Points */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-navy mb-6 text-center">How to Earn More Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-navy text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Make Purchases</h3>
              <p className="text-gray-600">Earn 1 point for every $1 spent</p>
            </div>
            <div className="text-center">
              <div className="bg-orange text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Refer Friends</h3>
              <p className="text-gray-600">Get 100 points for each friend you refer</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Special Offers</h3>
              <p className="text-gray-600">Complete special tasks for bonus points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
