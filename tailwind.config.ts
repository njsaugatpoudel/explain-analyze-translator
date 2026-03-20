import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        vercel: '#0a0a0a',
        neon: '#ff0055'
      }
    },
  },
  plugins: [],
};
export default config;
