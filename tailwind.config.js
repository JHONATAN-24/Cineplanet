/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // ── Marca principal ──────────────────────────────────────────
        primary: {
          DEFAULT: '#204D8A',
          dark: '#1F3359',
          light: '#3B7CC0',
        },
        // ── Acento degradé del logo ──────────────────────────────────
        accent: {
          yellow:   '#FAE93F',
          orange:   '#DE9430',
          'orange-red': '#D1592B',
          crimson:  '#CB2054',
          magenta:  '#B5127F',
          purple:   '#7E2582',
          'lime-green': '#9CC450',
          green:    '#30A67D',
          teal:     '#15A9B8',
          'petrol-blue': '#167E9C',
        },
        // ── Neutros ──────────────────────────────────────────────────
        app: {
          bg:        '#F4F7FB',
          surface:   '#FFFFFF',
          text:      '#1F3359',
          muted:     '#5B6B85',
          border:    '#E2E8F0',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in':  'fadeIn 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
