/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Mengaktifkan mode gelap
  theme: {
    extend: {
      colors: {
        // Menambahkan palet warna utama yang terinspirasi dari referensi
        primary: colors.indigo,
        gray: colors.slate,
      },
      fontFamily: {
        // Mengatur font default ke 'Inter'
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        // Menambahkan opsi radius yang lebih modern
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin untuk styling form yang lebih baik
  ],
}
