/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e293b",
        "primary-hover": "#0f172a",
        secondary: "#64748b",
      },
      spacing: {
        section: "2rem",
      },
      borderRadius: {
        container: "0.75rem",
      },
    },
  },
  plugins: [],
};
