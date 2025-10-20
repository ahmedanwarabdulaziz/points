import { Users, Star, CreditCard, Gift, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Sign Up',
      description: 'Create your free account in just a few minutes',
      icon: Users,
      color: 'bg-navy',
      details: [
        'Enter your email and create a password',
        'Verify your email address',
        'Complete your profile setup',
        'Get 100 welcome bonus points'
      ]
    },
    {
      number: 2,
      title: 'Earn Points',
      description: 'Make purchases and watch your points grow',
      icon: Star,
      color: 'bg-orange',
      details: [
        'Earn 10 points for every $1 spent',
        'Get bonus points for special offers',
        'Refer friends for 100 points each',
        'Complete tasks for extra points'
      ]
    },
    {
      number: 3,
      title: 'Redeem Rewards',
      description: 'Use your points for amazing rewards and gift cards',
      icon: CreditCard,
      color: 'bg-green-500',
      details: [
        'Browse our selection of rewards',
        'Choose from gift cards and exclusive items',
        'Redeem instantly with your points',
        'Enjoy your rewards immediately'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Easy to Use',
      description: 'Simple and intuitive interface that makes earning and redeeming points effortless',
      icon: CheckCircle
    },
    {
      title: 'Great Rewards',
      description: 'Access to exclusive gift cards and rewards from top brands',
      icon: Gift
    },
    {
      title: 'Secure & Safe',
      description: 'Your data and points are protected with enterprise-grade security',
      icon: CheckCircle
    },
    {
      title: 'No Expiration',
      description: 'Your points never expire, so you can save them for the perfect reward',
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy mb-2">How It Works</h1>
            <p className="text-gray-600">Start earning points and redeeming rewards in just a few simple steps</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">Get Started in 3 Easy Steps</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gray-300 transform translate-x-8"></div>
                )}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className={`${step.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-bold text-navy mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold text-navy mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <ul className="text-left space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-orange flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">Why Choose Cadeala?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-orange p-2 rounded-lg flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-navy mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-navy mb-2">How do I earn points?</h3>
              <p className="text-gray-600">You earn points by making purchases through our platform. You get 1 point for every $1 spent, plus bonus points for special offers and referrals.</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-navy mb-2">Do my points expire?</h3>
              <p className="text-gray-600">No, your points never expire. You can save them for as long as you want and redeem them whenever you&apos;re ready.</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-navy mb-2">How do I redeem rewards?</h3>
              <p className="text-gray-600">Simply browse our rewards catalog, choose what you want, and click redeem. Your reward will be delivered instantly to your email.</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-navy mb-2">Is my information secure?</h3>
              <p className="text-gray-600">Yes, we use enterprise-grade security to protect your data and points. Your information is encrypted and never shared with third parties.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy mb-2">Can I refer friends?</h3>
              <p className="text-gray-600">Absolutely! Refer friends and earn 100 points for each friend who signs up. They&apos;ll also get 100 welcome bonus points.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-gray-200 mb-8">Join thousands of users who are already earning points and redeeming rewards</p>
          <Link href="/signup" className="bg-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-light transition-colors inline-flex items-center">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
