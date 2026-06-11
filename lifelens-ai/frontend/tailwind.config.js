/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT:'#7C3AED', 600:'#7C3AED', 700:'#6D28D9' },
        secondary: { DEFAULT:'#3B82F6' },
        accent:    { DEFAULT:'#EC4899' },
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'slide-up':   'slideUp 0.5s ease-out',
      },
      keyframes: {
        float:   { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-20px)' } },
        glow:    { from:{ boxShadow:'0 0 20px #7C3AED40' }, to:{ boxShadow:'0 0 40px #7C3AED80' } },
        slideUp: { from:{ opacity:'0', transform:'translateY(20px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
