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
        sidebar: {
          bg:     "#1e2235",
          active: "#2d3352",
          text:   "#94a3b8",
          bright: "#e2e8f0",
          border: "#2d3352",
          sub:    "#64748b",
        },
        surface: "#f4f5f7",
        card:    "#ffffff",
        brand:   "#6366f1",
        "brand-light": "#ede9fe",
        risk: {
          critical: { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
          high:     { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
          medium:   { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
          low:      { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
