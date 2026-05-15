import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  "#f4f7f4",
          100: "#e6ede6",
          200: "#ccdccc",
          300: "#a3bfa3",
          400: "#749d74",
          500: "#547f54",
          600: "#416341",
          700: "#354f35",
          800: "#2c402c",
          900: "#253625",
        },
        clay: {
          50:  "#fdf6f0",
          100: "#faeadb",
          200: "#f4d0b0",
          300: "#ecae7a",
          400: "#e38642",
          500: "#dc6b1e",
          600: "#c55415",
          700: "#a34013",
          800: "#823416",
          900: "#6a2d15",
        },
        cream: "#faf8f3",
        charcoal: "#1e1e1e",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      animation: {
        "marquee": "marquee 30s linear infinite",
        "fade-up": "fadeUp 0.7s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
