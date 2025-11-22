/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ideahub: {
          brand: '#0B1120', // Azul Marinho Profundo
          accent: '#A3E635', // Verde Limão Vibrante
          light: '#F0F9FF', // Azul clarinho
        }
      }
    },
  },
  plugins: [],
}