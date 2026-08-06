/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          light: '#ffffff',
          soft: '#f8fafc',
          muted: '#f1f5f9',
          dark: '#0f172a',
          'dark-soft': '#1e293b',
          'dark-muted': '#334155',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'stat-lg': ['2rem', { lineHeight: '1.1', fontWeight: '600' }],
        'stat': ['1.75rem', { lineHeight: '1.1', fontWeight: '600' }],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
        'card': '0 1px 3px 0 rgba(0,0,0,0.05), 0 4px 12px -2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.06), 0 10px 24px -4px rgba(0,0,0,0.08)',
        'floating': '0 8px 32px -4px rgba(0,0,0,0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'check-draw': {
          '0%': { strokeDashoffset: '48' },
          '100%': { strokeDashoffset: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'bar-grow': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-down': 'fade-down 0.3s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        'slide-right': 'slide-right 0.3s ease-out both',
        'check-pop': 'check-pop 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'check-draw': 'check-draw 0.4s ease-out 0.15s both',
        shimmer: 'shimmer 1.6s linear infinite',
        'spin-slow': 'spin-slow 0.8s linear infinite',
        'toast-in': 'toast-in 0.3s ease-out both',
        'bar-grow': 'bar-grow 0.8s cubic-bezier(0.22,1,0.36,1) both',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
