import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0c0b0a",
          raised: "#141210",
          card: "#181614",
          line: "#2a2724",
        },
        parchment: {
          DEFAULT: "#e8e2d6",
          muted: "#b8b0a4",
          dim: "#8a8378",
        },
        gold: {
          DEFAULT: "#c8a96e",
          bright: "#ddb97a",
          dim: "#8f7649",
          glow: "rgba(200, 169, 110, 0.12)",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain-soft":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.045'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
