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

const stats = [
  { icon: CheckCircleIcon, label: '50,000+ Authors' },
  { icon: CheckCircleIcon, label: '$12M+ Royalties Paid' },
  { icon: CheckCircleIcon, label: '140+ Countries' },
];

export const LoginPage = () => {
  const [email, setEmail]       = useState('demo@guttenberg.io');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Demo fallback: set a minimal mock token so the app is usable without a live backend
      localStorage.setItem('auth_token', 'demo-token');
      sessionStorage.setItem('demo_user', JSON.stringify({
        id: '1', name: 'Alex Rivera', email: 'demo@guttenberg.io',
        subscriptionTier: 'pro', bio: 'Award-winning author of 12 titles',
      }));
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left hero panel ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #1e3a6e 55%, #0a1628 100%)' }}
      >
        {/* Subtle radial texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(212,175,55,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 90%, rgba(57,102,168,0.15) 0%, transparent 55%)
          `,
        }} />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-navy-900 text-2xl"
              style={{ background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)', boxShadow: '0 4px 16px rgba(212,175,55,0.35)' }}
            >
              G
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">Guttenberg</p>
              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.65)' }}>Self-Publishing Platform</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl font-bold leading-tight mb-4 text-white tracking-tight">
            Where Perfect Prose<br />
            <span style={{ color: '#d4af37' }}>Finds Its Audience</span>
          </h2>
          <p className="text-lg mb-12 leading-relaxed" style={{ color: 'rgba(213,224,240,0.7)' }}>
            The complete self-publishing platform for independent authors. Format, distribute, and
            monetize your work with professional tools trusted by 50,000+ authors.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  <f.icon className="w-5 h-5" style={{ color: '#d4af37' }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(213,224,240,0.55)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-6">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(212,175,55,0.75)' }}>
              <s.icon className="w-4 h-4" style={{ color: '#d4af37' }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Gold bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}
        />
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: '#f0dfc8' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-navy-900"
              style={{ background: 'linear-gradient(135deg, #edc74a 0%, #c9a227 100%)' }}
            >
              G
            </div>
            <span className="font-bold text-navy-900">Guttenberg</span>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: '#fdf9f4',
              border: '1px solid rgba(30,58,110,0.10)',
              boxShadow: '0 4px 24px rgba(10,22,40,0.10), 0 1px 4px rgba(10,22,40,0.06)',
            }}
          >
            <h2 className="text-2xl font-bold text-navy-900 mb-1 tracking-tight">Welcome back</h2>
            <p className="text-sm mb-7" style={{ color: 'rgba(30,58,110,0.5)' }}>Sign in to your publishing dashboard</p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-150 disabled:opacity-60"
                style={{
                  background: isLoading
                    ? 'rgba(201,162,39,0.6)'
                    : 'linear-gradient(135deg, #c9a227 0%, #edc74a 50%, #c9a227 100%)',
                  color: '#0a1628',
                  boxShadow: '0 2px 8px rgba(201,162,39,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                {isLoading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>

          {/* Demo credentials card */}
          <div
            className="mt-4 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(201,162,39,0.08)',
              border: '1px solid rgba(201,162,39,0.25)',
            }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: '#8e6d17' }}>Demo Credentials</p>
            <p className="text-xs" style={{ color: '#a97d44' }}>
              Email: <span className="font-mono">demo@guttenberg.io</span>
            </p>
            <p className="text-xs" style={{ color: '#a97d44' }}>
              Password: <span className="font-mono">demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
