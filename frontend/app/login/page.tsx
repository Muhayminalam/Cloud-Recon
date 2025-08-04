'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await auth.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="flex flex-col items-center w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center" style={{marginBottom: '24px'}}>
          <div style={{marginBottom: '24px'}}>
            <Shield className="h-200 w-200" style={{color: '#ef4444'}} />
          </div>
          <h2 className="text-4xl font-extrabold text-white" style={{marginBottom: '16px'}}>
            Sign in to RedRecon
          </h2>
        </div>

        {/* Form */}
        <div className="flex flex-col items-center w-full px-4">
          {error && (
            <div className="p-4 w-full max-w-[550px]" style={{marginBottom: '24px', border: '1px solid #dc2626', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.1)'}}>
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-red-400 font-semibold mb-1">Login Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
            {/* Email */}
            <div className="relative w-full max-w-[550px]" style={{marginBottom: '16px'}}>
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)'
                }}
              >
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="w-full rounded-md text-base border bg-red-950/40 border-[#333] text-white placeholder-gray-400 shadow-[0_0_10px_#dc2626] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                style={{
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  paddingLeft: '48px',
                  paddingRight: '16px'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative w-full max-w-[550px]" style={{marginBottom: '24px'}}>
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)'
                }}
              >
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                required
                className="w-full rounded-md text-base border bg-red-950/40 border-[#333] text-white placeholder-gray-400 shadow-[0_0_10px_#dc2626] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                style={{
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  paddingLeft: '48px',
                  paddingRight: '48px'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute"
                style={{
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-red-400 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-red-400 transition-colors" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div style={{marginBottom: '16px'}}>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-[280px] py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Link */}
            <div>
              <p className="text-center text-base text-gray-300">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-red-500 hover:text-red-400 font-semibold underline underline-offset-2 transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}