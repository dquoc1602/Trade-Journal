import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f14",
        surface: "#121821",
        surface2: "#182130",
        border: "#243043",
        primary: {
          DEFAULT: "#4f7cff",
          hover: "#3d63e0",
        },
        profit: "#22c55e",
        loss: "#ef4444",
        muted: "#8592a6",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
