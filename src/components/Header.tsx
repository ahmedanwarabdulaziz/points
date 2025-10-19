'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Gift, User, Building2, Shield, Users } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, appUser, logout } = useAuth();

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
        <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Transparent backdrop - allows website background to show through */}
          <div 
            className="fixed inset-0 bg-transparent transition-opacity duration-300"
            onClick={toggleMenu}
          />
          
          {/* Mobile menu panel - slides from right */}
          <div className={`fixed top-0 right-0 h-full w-72 max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              {/* Header with brand */}
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-navy to-navy-light">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Gift className="h-6 w-6 text-navy" />
                  </div>
                  <span className="text-xl font-bold text-white">Cadeala</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="text-white hover:text-orange transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 space-y-2">
                  <Link 
                    href="/" 
                    className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                    onClick={toggleMenu}
                  >
                    <span className="text-base">Home</span>
                  </Link>
                  
                  {appUser?.role === 'customer' && (
                    <>
                      <Link 
                        href="/rewards" 
                        className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                        onClick={toggleMenu}
                      >
                        <span className="text-base">Rewards</span>
                      </Link>
                      <Link 
                        href="/gift-cards" 
                        className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                        onClick={toggleMenu}
                      >
                        <span className="text-base">Gift Cards</span>
                      </Link>
                      <Link 
                        href="/scan-qr" 
                        className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                        onClick={toggleMenu}
                      >
                        <span className="text-base">Scan QR</span>
                      </Link>
                    </>
                  )}
                  
                  {appUser?.role === 'business' && (
                    <>
                      <Link 
                        href="/business-dashboard" 
                        className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                        onClick={toggleMenu}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="text-base">Dashboard</span>
                      </Link>
                      <Link 
                        href="/business-customers" 
                        className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                        onClick={toggleMenu}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-base">Customers</span>
                      </Link>
                      <Link 
                        href="/business-qr" 
                        className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                        onClick={toggleMenu}
                      >
                        <span className="text-base">QR Codes</span>
                      </Link>
                    </>
                  )}
                  
                  {appUser?.role === 'admin' && (
                    <Link 
                      href="/admin-dashboard" 
                      className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                      onClick={toggleMenu}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-base">Admin</span>
                    </Link>
                  )}
                  
                  <Link 
                    href="/how-it-works" 
                    className="flex items-center px-3 py-3 text-navy hover:bg-orange hover:text-white transition-all duration-200 font-medium rounded-lg"
                    onClick={toggleMenu}
                  >
                    <span className="text-base">How It Works</span>
                  </Link>
                </div>
              </div>

              {/* User Actions - Prominent Login/Signup */}
              <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
                {user ? (
                  <div className="space-y-4">
                    {appUser?.role === 'customer' && (
                      <Link 
                        href="/dashboard" 
                        className="flex items-center justify-center w-full px-6 py-4 bg-orange text-white rounded-xl hover:bg-orange-light transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                        onClick={toggleMenu}
                      >
                        <User className="h-6 w-6 mr-3" />
                        Dashboard
                      </Link>
                    )}
                    {appUser?.role === 'business' && (
                      <Link 
                        href="/business-dashboard" 
                        className="flex items-center justify-center w-full px-6 py-4 bg-orange text-white rounded-xl hover:bg-orange-light transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                        onClick={toggleMenu}
                      >
                        <Building2 className="h-6 w-6 mr-3" />
                        Business Dashboard
                      </Link>
                    )}
                    {appUser?.role === 'admin' && (
                      <Link 
                        href="/admin-dashboard" 
                        className="flex items-center justify-center w-full px-6 py-4 bg-orange text-white rounded-xl hover:bg-orange-light transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                        onClick={toggleMenu}
                      >
                        <Shield className="h-6 w-6 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="w-full flex items-center justify-center px-6 py-4 text-navy hover:bg-gray-200 transition-all duration-200 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-gray-400"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link 
                      href="/signin" 
                      className="flex items-center justify-center w-full px-6 py-4 bg-navy text-white rounded-xl hover:bg-navy-light transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                      onClick={toggleMenu}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className="flex items-center justify-center w-full px-6 py-4 bg-orange text-white rounded-xl hover:bg-orange-light transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                      onClick={toggleMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
