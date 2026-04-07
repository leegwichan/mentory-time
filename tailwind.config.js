/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          400: '#0EA5E9',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#1565C0',
          900: '#0C4A6E',
        },
      },
    },
  },
  plugins: [],
}
