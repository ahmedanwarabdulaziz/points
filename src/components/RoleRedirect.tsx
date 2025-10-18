'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RoleRedirectProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'business' | 'customer')[];
  redirectTo?: string;
}

export default function RoleRedirect({ 
  children, 
  allowedRoles = ['customer'], 
  redirectTo 
}: RoleRedirectProps) {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && appUser) {
      // Check if user role is allowed
      if (!allowedRoles.includes(appUser.role)) {
        // Redirect based on role
        switch (appUser.role) {
          case 'admin':
            router.push('/admin-dashboard');
            break;
          case 'business':
            router.push('/business-dashboard');
            break;
          case 'customer':
            router.push('/dashboard');
            break;
          default:
            router.push(redirectTo || '/');
        }
      }
    } else if (!loading && !user) {
      // Not authenticated, redirect to sign in
      router.push('/signin');
    }
  }, [user, appUser, loading, allowedRoles, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !appUser || !allowedRoles.includes(appUser.role)) {
    return null;
  }

  return <>{children}</>;
}
