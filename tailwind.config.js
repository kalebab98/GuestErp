/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        residence: {
          950: '#071715',
          900: '#0D3B36',
          800: '#144F49',
          700: '#1E6861',
          600: '#2A837A',
          500: '#38A197',
          200: '#A7DDD6',
          100: '#D5F1ED',
          50: '#F0F9F8',
          gold: '#C5A880',
          goldLight: '#E8DCC8',
          goldDark: '#9C7A4E',
          cream: '#FAF8F5',
          sand: '#F4EFEB',
          warmGray: '#EEE8DF',
        },
        primary: {
          DEFAULT: '#0D3B36',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#FAF8F5',
          foreground: '#0D3B36',
        },
        accent: {
          DEFAULT: '#C5A880',
          foreground: '#071715',
        },
        muted: {
          DEFAULT: '#F4EFEB',
          foreground: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(13, 59, 54, 0.08)',
        'luxury': '0 20px 40px -15px rgba(7, 23, 21, 0.12)',
        'glow': '0 0 25px rgba(197, 168, 128, 0.25)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
