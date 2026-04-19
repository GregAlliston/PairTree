import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        surface: "#111821",
        border: "#1f2937",
        text: "#e5e7eb",
        muted: "#9ca3af",
        accent: "#60a5fa",
      },
    },
  },
  plugins: [],
};

export default config;
