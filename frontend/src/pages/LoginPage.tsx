import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpenIcon, CheckCircleIcon, SparklesIcon, GlobeAltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const features = [
  { icon: BookOpenIcon, title: 'Professional Formatting', desc: 'AI-powered manuscript formatting for print and digital' },
  { icon: GlobeAltIcon, title: 'Global Distribution', desc: 'Reach readers on 20+ platforms worldwide instantly' },
  { icon: CurrencyDollarIcon, title: 'Maximize Royalties', desc: 'Real-time royalty calculator and automated payouts' },
  { icon: SparklesIcon, title: 'Marketing Suite', desc: 'ARC campaigns, press kits, and AI-generated synopses' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('demo@guttenberg.io');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Fallback: demo mode — set a fake token and mock user
      localStorage.setItem('auth_token', 'demo-token');
      // Store mock user in sessionStorage for demo
      sessionStorage.setItem('demo_user', JSON.stringify({
        id: '1', name: 'Alex Rivera', email: 'demo@guttenberg.io',
        subscriptionTier: 'pro', bio: 'Award-winning author of 12 titles'
      }));
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-gray-900 text-2xl shadow-xl">
              G
            </div>
            <div>
              <p className="text-xl font-bold">Guttenberg</p>
              <p className="text-xs text-gray-400">Self-Publishing Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Where Perfect Prose<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              Finds Its Audience
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-12 leading-relaxed">
            The complete self-publishing platform for independent authors. Format, distribute, and monetize your work with professional tools trusted by 50,000+ authors.
          </p>
          <div className="space-y-4">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-primary-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-400" /> 50,000+ Authors</div>
          <div className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-400" /> $12M+ Royalties Paid</div>
          <div className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-400" /> 140+ Countries</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-gray-900">G</div>
            <span className="font-bold text-gray-900">Guttenberg</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your publishing dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-200 disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-800 mb-1">Demo Credentials</p>
            <p className="text-xs text-amber-700">Email: <span className="font-mono">demo@guttenberg.io</span></p>
            <p className="text-xs text-amber-700">Password: <span className="font-mono">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
