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
        'hover': '0 .05rem .15rem 0.07rem rgba(0, 0, 0, .9)',
        'selected': '0 .18rem .17rem .10rem rgba(0, 0, 0, .77)',
        'md': '0 .35rem .25rem .12rem rgba(0, 0, 0, .7)',
      },
      spacing: {
        '1/12' : '8.333333%',
        '5/12' : '41.666667%',
        '7/12' : '58.333333%',
        '11/12' : '91.666667%',
      }
    },
  },
  plugins: [],
}