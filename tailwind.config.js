/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        messiri: ['"El Messiri"', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#132019',
          light: '#1B2B22',
          soft: '#24382C',
        },
        parchment: {
          DEFAULT: '#F7F2E6',
          card: '#FFFDF8',
          line: '#E7DFC9',
        },
        gold: {
          DEFAULT: '#E3A72E',
          dark: '#C48A1B',
        },
        coral: {
          DEFAULT: '#E15A4C',
          dark: '#C1402F',
        },
        forest: {
          DEFAULT: '#2F7A52',
          dark: '#245F40',
        },
        inktext: '#1C2620',
        muted: '#7A8377',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(19,32,25,0.06), 0 8px 24px -12px rgba(19,32,25,0.18)',
        stamp: '0 0 0 2px rgba(0,0,0,0.02)',
      },
      borderRadius: {
        card: '18px',
      },
      keyframes: {
        stampIn: {
          '0%': { opacity: '0', transform: 'scale(1.6) rotate(-8deg)' },
          '60%': { opacity: '1', transform: 'scale(0.95) rotate(-6deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-6deg)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        stampIn: 'stampIn 0.35s cubic-bezier(.2,.8,.25,1)',
        riseIn: 'riseIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
