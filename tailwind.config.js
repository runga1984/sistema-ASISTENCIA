/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",        // Escanea archivos en raiz (App.tsx, index.tsx)
    "./components/**/*.{js,ts,jsx,tsx}", // Escanea carpetas especificas
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}" // Redundancia segura
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif', 'Inter'],
      },
    },
  },
  plugins: [],
}