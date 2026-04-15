/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C6FE9',
        'primary-light': '#9D93F0',
        'primary-dark': '#5A4FBF',
        success: '#34D399',
        'success-dark': '#059669',
        surface: '#1E1B2E',
        'surface-light': '#2A2640',
        'surface-lighter': '#36324D',
        'bg-dark': '#0F0D1A',
        'text-primary': '#F1F0F7',
        'text-secondary': '#A09CB5',
        'text-muted': '#6B6784',
        glass: 'rgba(30, 27, 46, 0.7)',
        'glass-border': 'rgba(124, 111, 233, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};