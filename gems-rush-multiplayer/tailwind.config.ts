import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'divine-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'fire-gradient': 'linear-gradient(135deg, #FF4500 0%, #DC143C 100%)',
        'water-gradient': 'linear-gradient(135deg, #1E90FF 0%, #4169E1 100%)',
        'earth-gradient': 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        'air-gradient': 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)',
        'lightning-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'nature-gradient': 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
        'magic-gradient': 'linear-gradient(135deg, #9932CC 0%, #8A2BE2 100%)',
      },
      colors: {
        divine: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4dbff',
          300: '#d1bfff',
          400: '#b794ff',
          500: '#9d69ff',
          600: '#8b43ff',
          700: '#7c2dff',
          800: '#6b24d6',
          900: '#581fae',
        },
        gem: {
          fire: '#FF4500',
          water: '#1E90FF',
          earth: '#8B4513',
          air: '#87CEEB',
          lightning: '#FFD700',
          nature: '#32CD32',
          magic: '#9932CC',
        }
      },
      animation: {
        'pulse-divine': 'pulse-divine 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'gem-bounce': 'gem-bounce 0.5s ease-in-out',
        'score-pop': 'score-pop 0.6s ease-out',
        'cascade': 'cascade 0.8s ease-in-out',
      },
      keyframes: {
        'pulse-divine': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'glow': {
          '0%': {
            boxShadow: '0 0 5px currentColor',
          },
          '100%': {
            boxShadow: '0 0 20px currentColor, 0 0 30px currentColor',
          },
        },
        'sparkle': {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(0.8)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)',
          },
        },
        'gem-bounce': {
          '0%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.15)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        'score-pop': {
          '0%': {
            transform: 'scale(0.8) translateY(0)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.2) translateY(-10px)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1) translateY(-20px)',
            opacity: '0',
          },
        },
        'cascade': {
          '0%': {
            transform: 'translateY(-20px)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'divine': '0 0 20px rgba(147, 51, 234, 0.5)',
        'divine-lg': '0 0 40px rgba(147, 51, 234, 0.8)',
        'gem-glow': '0 0 15px currentColor',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
export default config 