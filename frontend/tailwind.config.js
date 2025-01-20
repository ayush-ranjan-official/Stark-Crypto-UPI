/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scan: {
          '0%': { transform: 'translateX(-50%) translateY(0)' },
          '100%': { transform: 'translateX(-50%) translateY(100%)' }
        }
      },
      animation: {
        'scan': 'scan 2s linear infinite'
      }
    },
  },
  plugins: [],
}