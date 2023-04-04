/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'md': '0 .25rem .25rem .12rem rgba(0, 0, 0, 1)',
        'test': '0 .05rem .05rem 0.025rem rgba(0, 0, 0, 1)'
      } 
    },
  },
  plugins: [],
}