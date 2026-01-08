/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1e59f1",
        "primary-hover": "#1640ac",
        "background-light": "#f5f6f8",
        "background-dark": "#101522",
        "surface-dark": "#1b1f27",
        "card-dark": "#1e293b",
        "border-dark": "#3b4254",
      },
      fontFamily: {
        display: ["Public Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
