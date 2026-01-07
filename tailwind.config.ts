import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        franca: {
          green: {
            light: '#f2fcf4',
            lighter: '#d7f5dc',
            DEFAULT: '#7DE08D',
            hover: '#71ca7f',
            dark: '#5ea86a',
            darker: '#4b8655',
            darkest: '#2c4e31',
          },
          blue: {
            light: '#e6e8eb',
            lighter: '#b2b6c0',
            DEFAULT: '#081534',
            hover: '#07132f',
            dark: '#061027',
            darker: '#050d1f',
            darkest: '#030712',
          },
          accent: '#598F74',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'franca-gradient': 'linear-gradient(135deg, #081534 0%, #0d2156 100%)',
        'franca-gradient-light': 'linear-gradient(135deg, #f2fcf4 0%, #d7f5dc 100%)',
      },
      boxShadow: {
        'franca': '0 4px 20px rgba(8, 21, 52, 0.1)',
        'franca-lg': '0 10px 40px rgba(8, 21, 52, 0.15)',
        'card': '0 2px 8px rgba(8, 21, 52, 0.08)',
        'card-hover': '0 8px 24px rgba(8, 21, 52, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'number-increment': 'numberIncrement 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        numberIncrement: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
