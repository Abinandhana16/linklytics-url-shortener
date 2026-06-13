/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19', // Sleek dark slate
          card: '#151D30', // Card background color
          accent: '#10B981', // Emerald green
          secondary: '#6366F1', // Indigo accent
          danger: '#EF4444', // Red for delete/errors
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
