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
          DEFAULT: "#00E599",
          hover: "#00C985",
          dark: "#008556",
        },
        surface: {
          50: "#181B20",
          100: "#1E2229",
          200: "#262C36",
          300: "#323A47",
        }
      },
    },
  },
  plugins: [],
};
export default config;
