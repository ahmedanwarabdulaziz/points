'use client';

import { useState } from &apos;react';
import { useRouter } from &apos;next/navigation';
import Link from &apos;next/link';
import { useAuth } from &apos;@/contexts/AuthContext';
import { Gift, Eye, EyeOff } from &apos;lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState(&apos;');
  const [password, setPassword] = useState(&apos;');
  const [confirmPassword, setConfirmPassword] = useState(&apos;');
  const [customerName, setCustomerName] = useState(&apos;');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(&apos;');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(&apos;');

    if (!customerName.trim()) {
      setError(&apos;Please enter your name&apos;);
      return;
    }

    if (password !== confirmPassword) {
      setError(&apos;Passwords do not match&apos;);
      return;
    }

    if (password.length < 6) {
      setError(&apos;Password must be at least 6 characters&apos;);
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, &apos;customer&apos;, customerName);
      router.push(&apos;/dashboard&apos;);
    } catch (error: unknown) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-navy p-3 rounded-full">
            <Gift className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-navy">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{&apos; '}
          <Link href="/signin" className="font-medium text-orange hover:text-orange-light">
            sign in to your existing account
          </Link>
        </p>
        <div className="mt-4 text-center">
          <Link href="/business-registration" className="text-sm text-navy hover:text-orange transition-colors">
            Register as a Business Owner
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  autoComplete="name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange focus:border-orange sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange focus:border-orange sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? &apos;text&apos; : &apos;password&apos;}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange focus:border-orange sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange focus:border-orange sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange hover:bg-orange-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? &apos;Creating account...&apos; : &apos;Create account&apos;}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">By signing up, you agree to our</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/terms" className="text-orange hover:text-orange-light text-sm">
                Terms of Service
              </Link>
              {&apos; and &apos;}
              <Link href="/privacy" className="text-orange hover:text-orange-light text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
