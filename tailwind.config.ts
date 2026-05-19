import type { Config } from "tailwindcss";

/** Hero/marketing section gradient (cream → blush pink). */
const marketingHeroGradient =
  "linear-gradient(135deg, #FDF6EC 0%, #fef4f1 45%, #fde8e2 100%)";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Brand cream background #FDF6EC */
        cream: {
          DEFAULT: "#FDF6EC",
          50: "#FDF6EC",
          100: "#faf1e6",
          200: "#f3e6d4",
        },
        /** Primary coral/orange #E8603C — exposed as `coral-*` and legacy `candy-*` */
        coral: {
          50: "#fef4f1",
          100: "#fde8e2",
          200: "#fbd0c5",
          300: "#f7ad9b",
          400: "#f07d62",
          500: "#E8603C",
          600: "#d54e30",
          700: "#b23f28",
          800: "#933726",
          900: "#7a3326",
        },
        candy: {
          50: "#fef4f1",
          100: "#fde8e2",
          200: "#fbd0c5",
          300: "#f7ad9b",
          400: "#f07d62",
          500: "#E8603C",
          600: "#d54e30",
          700: "#b23f28",
          800: "#933726",
          900: "#7a3326",
        },
        /** Accent dark green #2D4A3E */
        forest: {
          DEFAULT: "#2D4A3E",
          50: "#f4f7f6",
          100: "#e3ebe8",
          200: "#c7d7d1",
          300: "#9cb8ae",
          400: "#6d9285",
          500: "#4e7568",
          600: "#3d5f54",
          700: "#2D4A3E",
          800: "#273d36",
          900: "#21332f",
        },
        sprinkle: {
          mint: "#a7f3d0",
          lemon: "#fde68a",
          berry: "#c4b5fd",
        },
      },
      fontFamily: {
        /** Daymaker: Host Grotesk */
        sans: [
          '"Host Grotesk Variable"',
          '"Host Grotesk"',
          "system-ui",
          "sans-serif",
        ],
        display: [
          '"Host Grotesk Variable"',
          '"Host Grotesk"',
          "system-ui",
          "sans-serif",
        ],
        /** Logotyp & accenter (Kalam) */
        script: ["var(--font-kalam)", "cursive"],
        /** Integritetspolicy & användarvillkor */
        legal: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(232, 96, 60, 0.22)",
      },
      backgroundImage: {
        "brand-gradient": marketingHeroGradient,
        /** Alias — components use `bg-candy-gradient` */
        "candy-gradient": marketingHeroGradient,
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
