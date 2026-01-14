/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#050505",
        surface: "#111111",
        accent: "#2E5BFF",
        urgent: "#FF3131"
      },
      boxShadow: {
        neon: "0 0 20px rgba(46, 91, 255, 0.6)"
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
};
