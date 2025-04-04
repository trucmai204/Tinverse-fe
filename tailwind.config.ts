import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1.16" }],
      "6xl": ["3.75rem", { lineHeight: "1.12" }],
      "7xl": ["4.5rem", { lineHeight: "1.08" }],
      "8xl": ["6rem", { lineHeight: "1.05" }],
      "9xl": ["8rem", { lineHeight: "1.03" }],
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", ...(defaultTheme.fontFamily.sans as string[])],
      },
      typography: {
        DEFAULT: {
          css: {
            fontSize: "1rem",
            lineHeight: "1.75",
          },
        },
        lg: {
          css: {
            fontSize: "1.125rem",
            lineHeight: "1.75",
          },
        },
        xl: {
          css: {
            fontSize: "1.25rem",
            lineHeight: "1.75",
          },
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-in-out forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
        shimmer: "shimmer 2s infinite",
        scaleIn: "scaleIn 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config

export default config
