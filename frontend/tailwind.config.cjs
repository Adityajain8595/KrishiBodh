/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0f7f4",
          100: "#d9ede3",
          200: "#b6ddcb",
          300: "#86c5ab",
          400: "#55a688",
          500: "#348a6e",
          600: "#266e59",
          700: "#1f5849",
          800: "#1b473c",
          900: "#193b33",
          950: "#0c211b",
        },
        earth: {
          50: "#f7f5f2",
          100: "#ebe6df",
          200: "#d9cfc2",
          300: "#c2b29e",
          400: "#a8907a",
          500: "#9a7d68",
          600: "#8c6d5b",
          700: "#74594c",
          800: "#614b42",
          900: "#504038",
          950: "#2b211c",
        },
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
