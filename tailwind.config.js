/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: '#1E3A8A',
        secondary: '#10B981',
        accent: '#38BDF8',
        warning: '#F97316',
        success: '#22C55E',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
