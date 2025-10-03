/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'bg': '#1a1a2e',
          'purple': '#392377',
          'light-purple': '#6B46C1',
          'yellow': '#F59E0B',
          'pink': '#EC4899',
          'card': '#2D1B69',
          'card-border': '#4C1D95'
        }
      },
      animation: {
        'subtle-glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
