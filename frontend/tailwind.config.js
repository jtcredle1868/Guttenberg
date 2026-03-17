/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy Blue palette — primary brand color
        navy: {
          50:  '#e8eef5',
          100: '#c5d3e6',
          200: '#9eb5d4',
          300: '#7596c2',
          400: '#577eb5',
          500: '#3966a8',
          600: '#2d5190',
          700: '#1e3a6e',
          800: '#132650',
          900: '#0a1628',
          950: '#060e1a',
        },
        // Gold palette — accent/highlight
        gold: {
          50:  '#fdf8e7',
          100: '#faeec4',
          200: '#f5dd8a',
          300: '#edc74a',
          400: '#d4af37',
          500: '#c9a227',
          600: '#b08a1e',
          700: '#8e6d17',
          800: '#6c5212',
          900: '#4a390d',
        },
        // Tan/Cream palette — neutral surfaces
        tan: {
          50:  '#fdf9f4',
          100: '#f8f0e4',
          200: '#f0dfc8',
          300: '#e5c9a4',
          400: '#d4b07a',
          500: '#c49758',
          600: '#a97d44',
          700: '#8a6338',
          800: '#6b4c2c',
          900: '#4c3520',
        },
        // Deep slate for text
        ink: {
          50:  '#f2f4f7',
          100: '#e4e8f0',
          200: '#c9d2e1',
          300: '#9aadc7',
          400: '#6885a8',
          500: '#3f618a',
          600: '#2d4a70',
          700: '#1f3455',
          800: '#14223a',
          900: '#0c1524',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'navy-gradient':   'linear-gradient(135deg, #0a1628 0%, #1e3a6e 50%, #0a1628 100%)',
        'gold-gradient':   'linear-gradient(135deg, #c9a227 0%, #edc74a 50%, #c9a227 100%)',
        'hero-texture':    'radial-gradient(ellipse at top left, rgba(30,58,110,0.9) 0%, rgba(10,22,40,1) 60%)',
        'card-subtle':     'linear-gradient(145deg, rgba(253,249,244,1) 0%, rgba(248,240,228,0.6) 100%)',
        'sidebar-texture': 'linear-gradient(180deg, #0a1628 0%, #132650 100%)',
      },
      boxShadow: {
        'gold':     '0 0 0 1px rgba(212,175,55,0.3), 0 4px 16px rgba(212,175,55,0.15)',
        'navy':     '0 4px 24px rgba(10,22,40,0.25)',
        'card':     '0 1px 3px rgba(10,22,40,0.08), 0 4px 12px rgba(10,22,40,0.05)',
        'card-hover': '0 4px 16px rgba(10,22,40,0.12), 0 12px 32px rgba(10,22,40,0.08)',
        'glow-gold':'0 0 20px rgba(212,175,55,0.25)',
        'inset-gold':'inset 0 1px 0 rgba(212,175,55,0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'shimmer':    'shimmer 1.5s infinite linear',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(212,175,55,0.15)' },
        },
      },
    },
  },
  plugins: [],
};
