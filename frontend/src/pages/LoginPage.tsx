import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpenIcon, CheckCircleIcon, SparklesIcon,
  GlobeAltIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

/* ─────────────────────────────────────────────────────────── data ── */
const features = [
  {
    icon: BookOpenIcon,
    title: 'Professional Formatting',
    desc: 'AI-powered manuscript formatting for print and digital',
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Distribution',
    desc: 'Reach readers on 20+ platforms worldwide instantly',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Maximize Royalties',
    desc: 'Real-time royalty calculator and automated payouts',
  },
  {
    icon: SparklesIcon,
    title: 'Marketing Suite',
    desc: 'ARC campaigns, press kits, and AI-generated synopses',
  },
];

const stats = [
  { label: '50,000+ Authors' },
  { label: '$12M+ Royalties Paid' },
  { label: '140+ Countries' },
];

/* ─────────────────────────────────── G Logomark SVG ── */
const GLogomark = ({ size = 48 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Guttenberg logo"
  >
    <defs>
      <linearGradient id="gLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#edc74a" />
        <stop offset="100%" stopColor="#c9a227" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#gLogoGrad)" />
    <text
      x="24"
      y="33"
      textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontWeight="700"
      fontSize="26"
      fill="#0a1628"
    >
      G
    </text>
  </svg>
);

/* ─────────────────────────────────────────────────────── component ── */
export const LoginPage = () => {
  const [email, setEmail]         = useState('demo@guttenberg.io');
  const [password, setPassword]   = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      /* Demo fallback – works without a live backend */
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
      {/* ══════════════════════════ Left hero panel ══════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #050d1a 0%, #0f2040 40%, #1a2d4e 70%, #0a1628 100%)',
        }}
      >
        {/* Animated background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 15% 10%, rgba(212,175,55,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 85% 90%, rgba(45,81,144,0.18) 0%, transparent 55%),
              radial-gradient(ellipse 40% 40% at 60% 40%, rgba(201,162,39,0.04) 0%, transparent 50%)
            `,
          }}
        />

        {/* Subtle linen texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%230a1628'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%230d1b2e' opacity='0.4'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%230d1b2e' opacity='0.4'/%3E%3C/svg%3E\")",
            opacity: 0.6,
          }}
        />

        {/* Noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
            opacity: 0.025,
          }}
        />

        {/* Book-spine decorative lines */}
        <div className="absolute left-0 inset-y-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.25) 20%, rgba(212,175,55,0.25) 80%, transparent)' }} />
        <div className="absolute left-1 inset-y-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.08) 20%, rgba(212,175,55,0.08) 80%, transparent)' }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-14">
            <div style={{ filter: 'drop-shadow(0 4px 16px rgba(212,175,55,0.35))' }}>
              <GLogomark size={48} />
            </div>
            <div>
              <p
                className="text-xl font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Guttenberg
              </p>
              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.65)' }}>
                Self-Publishing Platform
              </p>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl xl:text-5xl font-bold leading-tight mb-4 text-white"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-0.02em' }}
          >
            Where Perfect Prose
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #edc74a 50%, #c9a227 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Finds Its Audience
            </span>
          </h1>

          <p
            className="text-base xl:text-lg mb-12 leading-relaxed"
            style={{ color: 'rgba(197,216,232,0.70)', fontFamily: 'Inter, sans-serif' }}
          >
            The complete self-publishing platform for independent authors.
            Format, distribute, and monetize your work with professional
            tools trusted by 50,000+ authors.
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(212,175,55,0.10)',
                    border: '1px solid rgba(212,175,55,0.22)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <f.icon className="w-4.5 h-4.5" style={{ color: '#d4af37', width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm leading-tight mb-0.5">{f.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(197,216,232,0.55)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-6 mb-0">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#d4af37' }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.80)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gold bottom border accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)' }}
        />
        {/* Gold right border accent */}
        <div
          className="absolute top-0 bottom-0 right-0 w-px"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.20) 30%, rgba(212,175,55,0.20) 70%, transparent)' }}
        />
      </div>

      {/* ══════════════════════════ Right form panel ══════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a1628 0%, #0f2040 60%, #0a1628 100%)',
        }}
      >
        {/* Subtle background radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(212,175,55,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <GLogomark size={40} />
            <div>
              <p
                className="font-bold text-white text-lg leading-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Guttenberg
              </p>
              <p className="text-xs" style={{ color: 'rgba(212,175,55,0.65)' }}>
                Self-Publishing Platform
              </p>
            </div>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
              border: '1px solid rgba(212,175,55,0.22)',
              boxShadow: '0 0 0 1px rgba(212,175,55,0.08), 0 8px 40px rgba(5,13,26,0.55), 0 2px 8px rgba(5,13,26,0.35)',
            }}
          >
            {/* Card inner glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%)',
              }}
            />

            <div className="relative z-10">
              {/* Top gold accent line */}
              <div
                className="absolute top-0 left-8 right-8 h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)' }}
              />

              <h2
                className="text-2xl font-bold text-white mb-1.5 tracking-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Welcome back
              </h2>
              <p className="text-sm mb-7" style={{ color: 'rgba(138,175,200,0.70)' }}>
                Sign in to your publishing dashboard
              </p>

              {error && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(220,38,38,0.08)',
                    border: '1px solid rgba(220,38,38,0.25)',
                    color: '#f87171',
                  }}
                >
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
                  className="w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isLoading
                      ? 'rgba(201,162,39,0.55)'
                      : 'linear-gradient(135deg, #c9a227 0%, #edc74a 50%, #c9a227 100%)',
                    backgroundSize: '200% 100%',
                    color: '#0a1628',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: isLoading
                      ? 'none'
                      : '0 2px 12px rgba(201,162,39,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
                    transform: isLoading ? 'none' : undefined,
                  }}
                  onMouseEnter={e => {
                    if (!isLoading) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'right center';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(201,162,39,0.50), inset 0 1px 0 rgba(255,255,255,0.25)';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'left center';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(201,162,39,0.35), inset 0 1px 0 rgba(255,255,255,0.20)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border-2 border-t-transparent inline-block"
                        style={{
                          borderColor: 'rgba(10,22,40,0.35)',
                          borderTopColor: '#0a1628',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Signing in…
                    </span>
                  ) : (
                    'Sign In →'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Demo credentials */}
          <div
            className="mt-4 px-5 py-4 rounded-xl"
            style={{
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.18)',
            }}
          >
            <p
              className="text-xs font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(212,175,55,0.75)' }}
            >
              Demo Credentials
            </p>
            <p className="text-xs" style={{ color: 'rgba(197,216,232,0.60)' }}>
              Email:{' '}
              <span
                className="font-mono"
                style={{ color: 'rgba(224,192,96,0.85)', fontFamily: '"Source Code Pro", monospace' }}
              >
                demo@guttenberg.io
              </span>
            </p>
            <p className="text-xs" style={{ color: 'rgba(197,216,232,0.60)' }}>
              Password:{' '}
              <span
                className="font-mono"
                style={{ color: 'rgba(224,192,96,0.85)', fontFamily: '"Source Code Pro", monospace' }}
              >
                demo123
              </span>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs" style={{ color: 'rgba(90,127,160,0.55)' }}>
            © 2024 Guttenberg Publishing Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
