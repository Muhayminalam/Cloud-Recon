'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Shield, Search, Zap, FileText, Database, ArrowRight } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        const user = await auth.verifyToken();
        if (user) {
          setIsLoggedIn(true);
        }
      }
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: Search,
      title: 'Network Scanning',
      description: 'Perform comprehensive network reconnaissance and port scanning'
    },
    {
      icon: Zap,
      title: 'Payload Testing',
      description: 'Test various attack payloads including XSS, SQLi, and more'
    },
    {
      icon: FileText,
      title: 'Activity Logging',
      description: 'Track and analyze all penetration testing activities'
    },
    {
      icon: Database,
      title: 'CVE Database',
      description: 'Access up-to-date vulnerability information and exploits'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden pt-32 pb-40" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', borderBottom: '2px solid #1d4ed8', marginBottom: '8px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <main className="px-6 sm:px-8 lg:px-12">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-extrabold mb-8 leading-tight" style={{ color: 'white' }}>
                  <span style={{ color: '#1d4ed8' }}> Cloud Recon: </span>
                  <span style={{ color: 'white' }}>Cloud Security Simulation</span>
                </h1>
                <p className="text-xl mb-12 max-w-2xl leading-relaxed" style={{ color: 'white' }}>
                  Professional penetration testing and security assessment platform. 
                  Practice ethical hacking techniques in a controlled environment.
                </p>
                <div className="btn-container" style={{ marginTop: '3rem' }}>
                  {isLoggedIn ? (
                    <Link href="/dashboard" className="btn-primary">
                      Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link href="/register" className="btn-primary" style={{ marginRight: '1.5rem' }}>
                        Get Started
                      </Link>
                      <Link href="/login" className="btn-secondary">
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </main>
            <div className="mt-16 lg:mt-0 flex items-center justify-center px-6">
              <div className="relative" style={{ marginBottom: '2rem' }}>
                <div 
                  className="w-80 h-80 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)',
                    boxShadow: '0 0 60px rgba(29, 78, 216, 0.5)'
                  }}
                >
                  <Shield className="h-40 w-40" style={{ color: '#1d4ed8', filter: 'drop-shadow(0 0 20px rgba(29, 78, 216, 0.9))' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section pt-40 pb-40" style={{ background: '#111111', marginTop: '8px', marginBottom: '8px' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-lg font-semibold tracking-wide uppercase mb-6" style={{ color: '#1d4ed8' }}>Features</h2>
            <h3 className="text-4xl font-extrabold mb-8 leading-tight" style={{ color: 'white' }}>
              Comprehensive Security Testing
            </h3>
            <p className="mb-20 text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'white' }}>
              Everything you need for professional penetration testing and security assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="feature-card p-10 rounded-xl"
                style={{ marginBottom: '2rem' }}
              >
                <div className="flex items-start space-x-8">
                  <div 
                    className="p-6 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(29, 78, 216, 0.15)' }}
                  >
                    <feature.icon className="h-9 w-9" style={{ color: '#1d4ed8' }} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-semibold mb-6" style={{ color: 'white' }}>{feature.title}</h4>
                    <p className="leading-relaxed text-lg" style={{ color: 'white' }}>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section pt-40 pb-40" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', borderTop: '2px solid #1d4ed8', marginTop: '8px' }}>
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h2 className="text-4xl font-extrabold mb-8 leading-tight" style={{ color: 'white' }}>
            Ready to start testing?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'white' }}>
            Join the platform and enhance your cybersecurity skills with hands-on practice.
          </p>
          {!isLoggedIn && (
            <div className="btn-container" style={{ marginTop: '2rem' }}>
              <Link href="/register" className="btn-primary">
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}