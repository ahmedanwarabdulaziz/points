'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Gift, User, ShoppingBag, Building2, Shield, QrCode } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, appUser, business, customer, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-navy p-2 rounded-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy">Cadeala</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-navy hover:text-orange transition-colors font-medium">
              Home
            </Link>
            {appUser?.role === 'customer' && (
              <>
                <Link href="/rewards" className="text-navy hover:text-orange transition-colors font-medium">
                  Rewards
                </Link>
                <Link href="/gift-cards" className="text-navy hover:text-orange transition-colors font-medium">
                  Gift Cards
                </Link>
                <Link href="/scan-qr" className="text-navy hover:text-orange transition-colors font-medium">
                  Scan QR
                </Link>
              </>
            )}
            {appUser?.role === 'business' && (
              <>
                <Link href="/business-dashboard" className="text-navy hover:text-orange transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/business-customers" className="text-navy hover:text-orange transition-colors font-medium">
                  Customers
                </Link>
                <Link href="/business-qr" className="text-navy hover:text-orange transition-colors font-medium">
                  QR Codes
                </Link>
              </>
            )}
            {appUser?.role === 'admin' && (
              <Link href="/admin-dashboard" className="text-navy hover:text-orange transition-colors font-medium">
                Admin
              </Link>
            )}
            <Link href="/how-it-works" className="text-navy hover:text-orange transition-colors font-medium">
              How It Works
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {appUser?.role === 'customer' && (
                  <Link href="/dashboard" className="flex items-center space-x-1 text-navy hover:text-orange transition-colors">
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {appUser?.role === 'business' && (
                  <Link href="/business-dashboard" className="flex items-center space-x-1 text-navy hover:text-orange transition-colors">
                    <Building2 className="h-5 w-5" />
                    <span>Business</span>
                  </Link>
                )}
                {appUser?.role === 'admin' && (
                  <Link href="/admin-dashboard" className="flex items-center space-x-1 text-navy hover:text-orange transition-colors">
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-navy hover:text-orange transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-navy hover:text-orange transition-colors font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange-light transition-colors font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-navy hover:text-orange transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link href="/" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                Home
              </Link>
              {appUser?.role === 'customer' && (
                <>
                  <Link href="/rewards" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                    Rewards
                  </Link>
                  <Link href="/gift-cards" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                    Gift Cards
                  </Link>
                  <Link href="/scan-qr" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                    Scan QR
                  </Link>
                </>
              )}
              {appUser?.role === 'business' && (
                <>
                  <Link href="/business-dashboard" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                    Dashboard
                  </Link>
                  <Link href="/business-customers" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                    Customers
                  </Link>
                  <Link href="/business-qr" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                    QR Codes
                  </Link>
                </>
              )}
              {appUser?.role === 'admin' && (
                <Link href="/admin-dashboard" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                  Admin
                </Link>
              )}
              <Link href="/how-it-works" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                How It Works
              </Link>
              <div className="border-t border-gray-200 pt-3 mt-3">
                {user ? (
                  <>
                    {appUser?.role === 'customer' && (
                      <Link href="/dashboard" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                        Dashboard
                      </Link>
                    )}
                    {appUser?.role === 'business' && (
                      <Link href="/business-dashboard" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                        Business Dashboard
                      </Link>
                    )}
                    {appUser?.role === 'admin' && (
                      <Link href="/admin-dashboard" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-navy hover:text-orange transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signin" className="block px-3 py-2 text-navy hover:text-orange transition-colors font-medium">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block px-3 py-2 bg-orange text-white rounded-lg hover:bg-orange-light transition-colors font-medium">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
