/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-page': '#060D1A',
        'bg-panel': '#0A1626',
        'border-panel': '#1C2C45',
        'text-primary': '#E8EDF5',
        'text-muted': '#7C8AA5',
        'status-good': '#1DB87C',
        'status-warning': '#F5A623',
        'status-critical': '#F53F55',
        'accent-primary': '#1E66D6',
        'accent-secondary': '#A259DA',
        'sidebar-active-bg': '#0C2A52',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}