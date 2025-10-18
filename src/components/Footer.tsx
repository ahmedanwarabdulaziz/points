import Link from 'next/link';
import { Gift, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-orange p-2 rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Cadeala</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Earn points, redeem rewards, and enjoy gift cards with Cadeala. 
              Join our loyalty program and start earning today!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-orange transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rewards" className="text-gray-300 hover:text-orange transition-colors">
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-300 hover:text-orange transition-colors">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-orange transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-orange transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>support@cadeala.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 Cadeala. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-orange transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-orange transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
