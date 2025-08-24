'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { auth } from '@/lib/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (password: string) =>
    password.length < 6 ? 'Password must be at least 6 characters long' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await auth.register(email, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center space-y-8">
          <CheckCircle className="h-16 w-16 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.7)] mx-auto" />
          <h2 className="text-4xl font-extrabold text-white">
            Registration Successful!
          </h2>
          <p className="text-lg text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="flex flex-col items-center w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center" style={{marginBottom: '24px'}}>
          <div className="mb-6">
            <Shield className="h-12 w-12" style={{color: '#ef4444'}} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create your account</h2>
        </div>

        {/* Form */}
        <div className="flex flex-col items-center w-full px-4">
          {error && (
            <div className="p-4 w-full max-w-[550px] mb-12 border border-red-600 rounded-lg bg-red-600/10">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-blue-700 font-semibold mb-1">Registration Error</h3>
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

            {/* Password requirement text */}
            <div className="w-full max-w-[550px]" style={{marginBottom: '12px'}}>
              <p className="text-xs text-center text-gray-400">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Password */}
            <div className="relative w-full max-w-[550px]" style={{marginBottom: '16px'}}>
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
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-blue-700 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-blue-700 transition-colors" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
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
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                className="w-full rounded-md text-base border bg-red-950/40 border-[#333] text-white placeholder-gray-400 shadow-[0_0_10px_#dc2626] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                style={{
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  paddingLeft: '48px',
                  paddingRight: '48px'
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute"
                style={{
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)'
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-blue-700 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-blue-700 transition-colors" />
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
                  'Create Account'
                )}
              </button>
            </div>

            {/* Link */}
            <div>
              <p className="text-center text-base text-gray-300">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-red-500 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}