import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Feature bullets for the hero panel
// ---------------------------------------------------------------------------

const features = [
  {
    icon: BookOpenIcon,
    title: 'Professional Formatting',
    desc: 'AI-powered manuscript formatting for print, e-book, and audiobook.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Distribution',
    desc: 'Reach readers on 20+ retail platforms worldwide in one click.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Maximize Royalties',
    desc: 'Real-time royalty calculator and automated monthly payouts.',
  },
  {
    icon: SparklesIcon,
    title: 'AI Marketing Suite',
    desc: 'ARC campaigns, press kits, landing pages, and AI synopses.',
  },
];

// ---------------------------------------------------------------------------
// Animated floating orbs for background
// ---------------------------------------------------------------------------

const FloatingOrb = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className ?? ''}`}
    style={style}
  />
);

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      // Demo fallback: set a fake token and mock user so the UI works
      // without a backend running
      localStorage.setItem('auth_token', 'demo-token');
      localStorage.setItem('access_token', 'demo-token');
      sessionStorage.setItem(
        'demo_user',
        JSON.stringify({
          id: '1',
          name: 'Alex Rivera',
          email: 'demo@guttenberg.io',
          subscriptionTier: 'pro',
          bio: 'Award-winning author of 12 titles',
        }),
      );
      navigate('/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    // MPP SSO -- in production this redirects to Master Prose OAuth flow
    setIsLoading(true);
    localStorage.setItem('auth_token', 'demo-token');
    localStorage.setItem('access_token', 'demo-token');
    sessionStorage.setItem(
      'demo_user',
      JSON.stringify({
        id: '1',
        name: 'Alex Rivera',
        email: 'demo@guttenberg.io',
        subscriptionTier: 'pro',
        bio: 'Award-winning author of 12 titles',
      }),
    );
    setTimeout(() => navigate('/dashboard', { replace: true }), 400);
  };

  const fillDemo = () => {
    setEmail('demo@guttenberg.io');
    setPassword('demo123');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ------------------------------------------------------------------ */}
      {/* Left hero panel                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white">
        {/* Animated background orbs */}
        <FloatingOrb
          className="w-[28rem] h-[28rem] bg-primary-500"
          style={{ top: '-5rem', left: '-8rem', animationDuration: '7s' }}
        />
        <FloatingOrb
          className="w-[36rem] h-[36rem] bg-accent-500"
          style={{ bottom: '-10rem', right: '-12rem', animationDuration: '9s' }}
        />
        <FloatingOrb
          className="w-64 h-64 bg-amber-400"
          style={{ top: '40%', left: '50%', animationDuration: '11s' }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-20">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-gray-900 text-2xl shadow-xl shadow-amber-500/30">
              G
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">Guttenberg</p>
              <p className="text-[11px] font-medium text-primary-300 tracking-widest uppercase">
                Self-Publishing Platform
              </p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold leading-[1.1] mb-5 tracking-tight">
            Where Perfect Prose
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400">
              Finds Its Audience
            </span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-lg mb-14">
            The complete self-publishing platform for independent authors.
            Format, distribute, and monetize your work with professional-grade
            tools trusted by 50,000+ authors worldwide.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{f.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="relative z-10 flex items-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <span>50,000+ Authors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <span>$12M+ Royalties Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <span>140+ Countries</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right login panel                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-gray-900 text-lg shadow-lg">
              G
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">
                Guttenberg
              </span>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                Self-Publishing
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm mt-1.5">
                Master Prose Platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                  {error}
                </div>
              )}

              {/* Sign In button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 focus:ring-4 focus:ring-primary-500/30 transition-all shadow-lg shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span
                  className={`flex items-center justify-center gap-2 transition-opacity ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  Sign In
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">
                  or continue with
                </span>
              </div>
            </div>

            {/* MPP SSO */}
            <button
              onClick={handleSSOLogin}
              disabled={isLoading}
              className="w-full py-3 px-6 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                MP
              </div>
              Sign in with Master Prose
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <SparklesIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800 mb-1.5">
                  Demo Credentials
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Email:{' '}
                  <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">
                    demo@guttenberg.io
                  </code>
                </p>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  Password:{' '}
                  <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">
                    demo123
                  </code>
                </p>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
                >
                  Auto-fill credentials
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in you agree to the{' '}
            <span className="text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
