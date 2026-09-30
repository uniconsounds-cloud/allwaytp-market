import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#D4AF37", // Elegant Metallic Gold
          hover: "#E5C07B",
          dark: "#996515",
          light: "#FDF6E2",
        },
        gold: {
          50: "#FFFDF5",
          100: "#FEF9E7",
          200: "#FDF0C5",
          300: "#FCE59F",
          400: "#F9D571",
          500: "#D4AF37", // Base Gold
          600: "#B8860B", // Dark Goldenrod
          700: "#8C6508",
          800: "#5E4305",
          900: "#382802",
        },
        surface: {
          50: "#0F1117",
          100: "#151821",
          200: "#1C202C",
          300: "#262B3A",
          card: "#12141C",
        }
      },
    },
  },
  plugins: [],
};
export default config;
