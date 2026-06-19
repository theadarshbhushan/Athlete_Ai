export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#2563EB',
          dark: '#1D4ED8',
        },
        dark: {
          DEFAULT: '#FFFFFF',
          card: '#F8FAFC',
          sidebar: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        athletic: '0 24px 80px rgba(15, 23, 42, 0.14)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
