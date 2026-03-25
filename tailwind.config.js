/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'calm-blue':    '#1E3A5F',
        'soft-blue':    '#4A90D9',
        'warm-coral':   '#FF6B6B',
        'bg-light':     '#F7F9FC',
        'text-primary': '#1A1A2E',
        'text-muted':   '#6B7280',
        'calm-blue-50':  '#EBF0F7',
        'calm-blue-100': '#C7D6E8',
        'calm-blue-200': '#94B0CC',
        'calm-blue-700': '#163059',
        'calm-blue-900': '#0D1F3A',
        'soft-blue-50':  '#EBF4FC',
        'soft-blue-100': '#BDD9F5',
        'soft-blue-600': '#3A7CC5',
        'coral-50':      '#FFF0F0',
        'coral-100':     '#FFCFCF',
        'coral-600':     '#E55555',
        'green-health':  '#2ECC71',
        'yellow-health': '#F39C12',
        'red-health':    '#E74C3C',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['16px', { lineHeight: '1.6' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':       '0 2px 16px rgba(30, 58, 95, 0.08)',
        'card-hover': '0 8px 32px rgba(30, 58, 95, 0.16)',
        'soft':       '0 1px 8px rgba(30, 58, 95, 0.06)',
        'glow-blue':  '0 0 20px rgba(74, 144, 217, 0.3)',
        'glow-coral': '0 0 20px rgba(255, 107, 107, 0.3)',
      },
      animation: {
        'heartbeat':  'heartbeat 1.4s ease-in-out infinite',
        'breathe':    'breathe 3s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease forwards',
        'slide-in':   'slideIn 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%':      { transform: 'scale(1.15)' },
          '28%':      { transform: 'scale(1)' },
          '42%':      { transform: 'scale(1.12)' },
          '70%':      { transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.02)', opacity: '0.9' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};
