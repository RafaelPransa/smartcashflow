/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        income: "#2563eb", // Vibrant Blue
        expense: "#f97316", // Vibrant Orange
        brand: {
          blue: "#2563eb",
          "blue-light": "#eff6ff",
          orange: "#f97316",
          "orange-light": "#fff7ed",
          dark: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
