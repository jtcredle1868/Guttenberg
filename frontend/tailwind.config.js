/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      'xs':   '320px',
      'sm':   '375px',
      'md':   '768px',
      'lg':   '1024px',
      'xl':   '1280px',
      '2xl':  '1440px',
    },
    extend: {
      colors: {
        // ── Navy Blue ───────────────────────────────────────────────
        navy: {
          950: '#050d1a',
          900: '#0a1628',
          800: '#0f2040',
          700: '#1a2d4e',
          600: '#243b55',
          500: '#2e4a6b',
          400: '#3d6080',
          300: '#5a7fa0',
          200: '#8aafc8',
          100: '#c5d8e8',
          50:  '#e8f1f8',
        },
        // ── Gold ────────────────────────────────────────────────────
        gold: {
          950: '#3d2600',
          900: '#6b4200',
          800: '#8b5a00',
          700: '#a37000',
          600: '#c9a227',
          500: '#d4af37',
          400: '#e0c060',
          300: '#eacf7a',
          200: '#f0de9a',
          100: '#f8f0d0',
          50:  '#fdf8ee',
        },
        // ── Tan / Warm ──────────────────────────────────────────────
        tan: {
          900: '#6b5040',
          800: '#8b6548',
          700: '#a08060',
          600: '#b89470',
          500: '#c4a882',
          400: '#d4b896',
          300: '#e0ccac',
          200: '#ecdcc2',
          100: '#f5edd8',
          50:  '#faf6ef',
        },
        // ── Neutral ─────────────────────────────────────────────────
        parchment: {
          DEFAULT: '#f8f6f0',
          light:   '#f0ede6',
        },
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        inter:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:     ['"Source Code Pro"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        // default overrides
        sans:     ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif:    ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
      },
      backgroundImage: {
        // Gradients
        'navy-gradient':      'linear-gradient(180deg, #0a1628 0%, #1a2d4e 60%, #0a1628 100%)',
        'navy-gradient-135':  'linear-gradient(135deg, #050d1a 0%, #1a2d4e 55%, #050d1a 100%)',
        'gold-gradient':      'linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #c9a227 100%)',
        'gold-shimmer':       'linear-gradient(105deg, #c9a227 0%, #e0c060 45%, #d4af37 55%, #c9a227 100%)',
        'card-dark':          'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
        'card-darker':        'linear-gradient(145deg, #0f2040 0%, #0a1628 100%)',
        // Linen texture (CSS-only)
        'linen-texture':      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%230a1628'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%230d1b2e' opacity='0.4'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%230d1b2e' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'gold':         '0 0 0 1px rgba(201,162,39,0.35), 0 4px 20px rgba(201,162,39,0.20)',
        'gold-lg':      '0 0 0 2px rgba(201,162,39,0.40), 0 8px 32px rgba(201,162,39,0.25)',
        'gold-glow':    '0 0 24px rgba(212,175,55,0.30)',
        'navy':         '0 4px 24px rgba(5,13,26,0.50)',
        'navy-lg':      '0 8px 48px rgba(5,13,26,0.60)',
        'card':         '0 1px 3px rgba(5,13,26,0.30), 0 4px 16px rgba(5,13,26,0.20)',
        'card-hover':   '0 4px 20px rgba(5,13,26,0.40), 0 12px 40px rgba(5,13,26,0.30)',
        'inner-gold':   'inset 0 1px 0 rgba(212,175,55,0.20)',
        'sidebar':      '4px 0 32px rgba(5,13,26,0.60)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':       'fadeIn 0.35s ease-out',
        'slide-up':      'slideUp 0.45s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':       'shimmer 2s infinite linear',
        'shimmer-slow':  'shimmer 3s infinite linear',
        'pulse-gold':    'pulseGold 2.5s ease-in-out infinite',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(212,175,55,0.12)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
