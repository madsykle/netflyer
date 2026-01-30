import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        "smoky-black": "#11120D",
        "olive-drab": "#565449",
        "olive-drab-hover": "#6b6a5b",
        "olive-drab-light": "#8a8979",
        bone: "#D8CFBC",
        "bone-hover": "#E8E0CF",
        "floral-white": "#FFFBF4",
        // Semantic colors
        "bg-primary": "#11120D",
        "bg-secondary": "#1a1b14",
        "bg-tertiary": "#24251c",
        "bg-elevated": "#2e2f24",
        "text-primary": "#FFFBF4",
        "text-secondary": "rgba(255, 251, 244, 0.72)",
        "text-tertiary": "rgba(255, 251, 244, 0.48)",
        "text-muted": "rgba(255, 251, 244, 0.32)",
        accent: "#565449",
        "accent-hover": "#6b6a5b",
        "border-default": "rgba(86, 84, 73, 0.3)",
        "border-hover": "rgba(86, 84, 73, 0.5)",
      },
      fontFamily: {
        display: [
          "Satoshi",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      addCommonColors: true,
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: "#11120D",
            foreground: "#FFFBF4",
            primary: {
              50: "#f5f4f0",
              100: "#e8e6df",
              200: "#d8cfbc",
              300: "#c4b89b",
              400: "#8a8979",
              500: "#6b6a5b",
              600: "#565449",
              700: "#45443b",
              800: "#373631",
              900: "#2e2d28",
              DEFAULT: "#565449",
              foreground: "#FFFBF4",
            },
            secondary: {
              DEFAULT: "#D8CFBC",
              foreground: "#11120D",
            },
            content1: {
              DEFAULT: "#1a1b14",
              foreground: "#FFFBF4",
            },
            content2: {
              DEFAULT: "#24251c",
              foreground: "#FFFBF4",
            },
            content3: {
              DEFAULT: "#2e2f24",
              foreground: "#FFFBF4",
            },
          },
        },
      },
    }),
  ],
};
