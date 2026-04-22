import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#0a0a0b",
        bg2: "#111114",
        surface: "#16161a",
        "surface-hover": "#1c1c22",
        border: "#26262d",
        "border-strong": "#35353f",
        text: "#fafafa",
        muted: "#8a8a94",
        accent: "#f5c16c",
        "accent-soft": "#2a2215",
        danger: "#f87171",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 4px 16px rgba(0,0,0,0.35)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
