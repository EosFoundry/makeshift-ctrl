/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
/* offset-x | offset-y | blur-radius | spread-radius | color */
        'sharp': '0 .18rem .10rem .10rem rgba(0, 0, 0, 1)',
        'md': '0 .35rem .25rem .12rem rgba(0, 0, 0, .7)',
        'test': '0 .15rem .05rem 0.025rem rgba(0, 0, 0, 1)'
      } 
    },
  },
  plugins: [],
}