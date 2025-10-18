import { Gift, Star, CreditCard, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-light text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Earn Points, <br />
                <span className="text-orange">Redeem Rewards</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Join Cadeala and start earning points with every purchase. 
                Redeem your points for amazing rewards and gift cards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-light transition-colors inline-flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/how-it-works" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-navy transition-colors inline-flex items-center justify-center">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-center">
                  <Gift className="h-16 w-16 text-orange mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Your Points</h3>
                  <div className="text-4xl font-bold text-orange mb-2">2,500</div>
                  <p className="text-gray-200">Available to redeem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start earning points and redeeming rewards in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-navy text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-4">1. Sign Up</h3>
              <p className="text-gray-600">
                Create your account and start earning points with every purchase
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-4">2. Earn Points</h3>
              <p className="text-gray-600">
                Make purchases and watch your points grow automatically
              </p>
            </div>

            <div className="text-center">
              <div className="bg-navy text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-4">3. Redeem Rewards</h3>
              <p className="text-gray-600">
                Use your points to get gift cards and exclusive rewards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                Why Choose Cadeala?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Easy to Use</h3>
                    <p className="text-gray-600">
                      Simple and intuitive interface that makes earning and redeeming points effortless
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Great Rewards</h3>
                    <p className="text-gray-600">
                      Access to exclusive gift cards and rewards from top brands
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Secure & Safe</h3>
                    <p className="text-gray-600">
                      Your data and points are protected with enterprise-grade security
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-navy mb-6">Start Earning Today</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Sign up bonus</span>
                  <span className="text-orange font-semibold">+500 points</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">First purchase</span>
                  <span className="text-orange font-semibold">+200 points</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Refer a friend</span>
                  <span className="text-orange font-semibold">+100 points</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Total bonus</span>
                  <span className="text-navy font-bold text-lg">+800 points</span>
                </div>
              </div>
              <Link href="/signup" className="w-full bg-orange text-white py-3 rounded-lg font-semibold hover:bg-orange-light transition-colors inline-flex items-center justify-center mt-6">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of users who are already earning points and redeeming rewards
          </p>
          <Link href="/signup" className="bg-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-light transition-colors inline-flex items-center">
            Sign Up Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
