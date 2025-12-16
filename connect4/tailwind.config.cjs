/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-out": {
          "0%": { opacity: 100 },
          "100%": { opacity: 0 },
        },
      },
      animation: {
        "fade-out-short": "fade-out 2s ease-in forwards",
        "fade-out-long": "fade-out 3s ease-in forwards",
      },
    },
  },
  plugins: [],
};
