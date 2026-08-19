import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#006c49",
        "primary-container": "#10b981",
        "on-primary": "#ffffff",
        "on-primary-container": "#00422b",
        "secondary": "#006c4a",
        "surface": "#f8f9ff",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3c4a42",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
