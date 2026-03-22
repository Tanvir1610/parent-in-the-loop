/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Brand guide: Nunito / Quicksand (rounded sans)
        sans: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
        display: ["var(--font-quicksand)", "Quicksand", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          cream: "#FAF6F0",
          taupe: "#B79D84",
          graphite: "#222222",
          charcoal: "#3E3E3E",
          sky: "#BFD6E1",
          sage: "#A6B6A1",
          coral: "#F3A78E",
          gold: "#F4D78B",
          lavender: "#B9A6E3",
          plum: "#7C63B8",
        },
      },
    },
  },
  plugins: [],
};
