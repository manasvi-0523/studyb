/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#FFFEFB",
        charcoal: "#2d2a26",
        gold: "#9A7B4F", /* Darker gold for better contrast */
        sage: "#5A7A59", /* Darker sage for better contrast */
        beige: "#f5f3ed",
        surface: "#FFFFFF",
      },
      fontFamily: {
        playfair: ["'Playfair Display'", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        breath: "breath 4s ease-in-out infinite",
        "fade-out": "fadeOut 1s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        breath: {
          "0%, 100%": { opacity: 0.4, transform: "scale(0.98)" },
          "50%": { opacity: 1, transform: "scale(1.02)" },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0, visibility: "hidden" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    }
  },
  plugins: []
};
