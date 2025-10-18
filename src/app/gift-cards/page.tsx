import { CreditCard, ShoppingBag, Coffee, Music, Gamepad2, Camera, Car, Plane } from 'lucide-react';

export default function GiftCards() {
  const giftCards = [
    {
      id: 1,
      name: 'Amazon',
      points: 500,
      value: '$5.00',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      description: 'Shop millions of items on Amazon',
      category: 'Shopping'
    },
    {
      id: 2,
      name: 'Starbucks',
      points: 300,
      value: '$3.00',
      icon: Coffee,
      color: 'bg-green-500',
      description: 'Enjoy your favorite coffee and treats',
      category: 'Food & Drink'
    },
    {
      id: 3,
      name: 'Spotify',
      points: 1000,
      value: '$10.00',
      icon: Music,
      color: 'bg-purple-500',
      description: '1 month of Spotify Premium',
      category: 'Entertainment'
    },
    {
      id: 4,
      name: 'Target',
      points: 800,
      value: '$8.00',
      icon: ShoppingBag,
      color: 'bg-red-500',
      description: 'Shop at Target stores or online',
      category: 'Shopping'
    },
    {
      id: 5,
      name: 'Apple',
      points: 1200,
      value: '$12.00',
      icon: CreditCard,
      color: 'bg-gray-500',
      description: 'Use at Apple Store or App Store',
      category: 'Technology'
    },
    {
      id: 6,
      name: 'Netflix',
      points: 600,
      value: '$6.00',
      icon: Music,
      color: 'bg-red-600',
      description: 'Enjoy your favorite shows and movies',
      category: 'Entertainment'
    },
    {
      id: 7,
      name: 'PlayStation',
      points: 1500,
      value: '$15.00',
      icon: Gamepad2,
      color: 'bg-blue-600',
      description: 'Buy games and content on PlayStation Store',
      category: 'Gaming'
    },
    {
      id: 8,
      name: 'Uber',
      points: 400,
      value: '$4.00',
      icon: Car,
      color: 'bg-black',
      description: 'Ride with Uber anywhere',
      category: 'Transportation'
    },
    {
      id: 9,
      name: 'Airbnb',
      points: 2000,
      value: '$20.00',
      icon: Plane,
      color: 'bg-pink-500',
      description: 'Book unique stays around the world',
      category: 'Travel'
    }
  ];

  const categories = ['All', 'Shopping', 'Food & Drink', 'Entertainment', 'Technology', 'Gaming', 'Transportation', 'Travel'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy mb-2">Gift Cards</h1>
            <p className="text-gray-600">Redeem your points for gift cards from top brands</p>
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

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-navy mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === 'All'
                    ? 'bg-orange text-white'
                    : 'bg-white text-navy border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giftCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{card.name}</h3>
                    <p className="text-sm text-gray-500">{card.category}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{card.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-orange">{card.points} pts</div>
                    <div className="text-sm text-gray-500">Required points</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-navy">{card.value}</div>
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

        {/* Popular Categories */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Shopping</h3>
              <p className="text-gray-600 mb-4">Gift cards for your favorite stores</p>
              <div className="text-2xl font-bold text-orange">15+ brands</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Food & Drink</h3>
              <p className="text-gray-600 mb-4">Restaurants and coffee shops</p>
              <div className="text-2xl font-bold text-orange">10+ brands</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Entertainment</h3>
              <p className="text-gray-600 mb-4">Streaming and entertainment services</p>
              <div className="text-2xl font-bold text-orange">8+ brands</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
