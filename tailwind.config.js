/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3A59D1",
        "primary-light": "#5675E0",
        "primary-lighter": "#7C94EC",
        "primary-pale": "#E8EDFB",
      },
    },
  },
  plugins: [],
};
