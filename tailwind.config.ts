import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wwf: {
          50: "#f1f8f3",
          100: "#dcedde",
          200: "#bcdcc1",
          300: "#8fc298",
          400: "#5fa46c",
          500: "#3f8b4f",
          600: "#2e6d3c",
          700: "#255732",
          800: "#1f4629",
          900: "#1a3a23",
          950: "#0e2114",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dbdfe7",
          300: "#b9c0cd",
          400: "#8e98ac",
          500: "#6b748a",
          600: "#535b70",
          700: "#41485b",
          800: "#363c4d",
          900: "#1f2333",
        },
        gold: {
          50: "#fbf7ee",
          100: "#f5ebd0",
          200: "#ead4a3",
          300: "#dcb96b",
          400: "#caa247",
          500: "#b48533",
          600: "#946a2a",
          700: "#735126",
          800: "#5b4022",
          900: "#3f2c19",
        },
        parchment: "#fbfaf5",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(15,23,42,0.04), 0 4px 12px -2px rgba(15,23,42,0.06)",
        glow: "0 0 0 4px rgba(63,139,79,0.12)",
        card: "0 1px 2px 0 rgba(15,23,42,0.05), 0 1px 3px 0 rgba(15,23,42,0.06)",
        elevated:
          "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px -4px rgba(15,23,42,0.08), 0 12px 24px -10px rgba(15,23,42,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
