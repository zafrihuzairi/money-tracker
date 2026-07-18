import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf7ee', 100: '#f5ebd2', 200: '#ead6a5', 300: '#dfbd72',
          400: '#d5a647', 500: '#c6902f', 600: '#a87325', 700: '#875921',
          800: '#6e4820', 900: '#5c3d1f'
        },
        ink: { 50: '#f7f7f8', 900: '#0a0a0b' }
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: { soft: '0 8px 30px rgba(0,0,0,0.06)' },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
};
export default config;
