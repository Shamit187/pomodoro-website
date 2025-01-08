/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        light: {
          background: "#ebeaea",
          primary: "#353535",
          accent: "#fe7325",
        },
        dark: {
          background: "#353535",
          primary: "#ebeaea",
          accent: "#25b0fe",
        },
      },
      fontFamily: {
        nunito: ["'Nunito Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
