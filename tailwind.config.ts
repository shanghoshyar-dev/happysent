import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fffaf3",
          100: "#fef3e2",
          200: "#fde4bf",
        },
        candy: {
          50: "#fff1f5",
          100: "#ffe0ea",
          200: "#ffc1d4",
          300: "#ff90b1",
          400: "#ff5d8c",
          500: "#ef336c",
          600: "#d31a55",
          700: "#a91245",
          800: "#7f0d35",
          900: "#5b0a26",
        },
        sprinkle: {
          mint: "#a7f3d0",
          lemon: "#fde68a",
          berry: "#c4b5fd",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(239, 51, 108, 0.25)",
      },
      backgroundImage: {
        "candy-gradient":
          "linear-gradient(135deg, #fff1f5 0%, #fef3e2 50%, #ffe0ea 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
