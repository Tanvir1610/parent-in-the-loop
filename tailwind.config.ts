import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
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
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
