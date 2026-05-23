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
        linen: "#f0ebe3",
        burgundy: {
          50:  "#f9f0f2",
          100: "#f0d6db",
          200: "#e0adb6",
          300: "#c97b8a",
          400: "#a84d60",
          500: "#7b2d3e",
          600: "#6b2436",
          700: "#581d2c",
          800: "#451623",
          900: "#33101a",
        },
        olive: {
          50:  "#f2f5f0",
          100: "#dde6d9",
          200: "#baceB4",
          300: "#8fac87",
          400: "#638a59",
          500: "#4a6741",
          600: "#3d5636",
          700: "#31452b",
          800: "#263521",
          900: "#1c2718",
        },
        charcoal: "#2c2c2c",
      },
      fontFamily: {
        display: ["var(--font-gilda)", "Georgia", "serif"],
        body: ["var(--font-nunito)", "system-ui", "sans-serif"],
        nav: ["var(--font-josefin)", "system-ui", "sans-serif"],
      },
      animation: {
        "marquee": "marquee 35s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
