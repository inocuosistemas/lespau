import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201c",
        moss: "#5b6f45",
        coral: "#bf5b45",
        skyglass: "#dceef0",
        paper: "#f7f3ea"
      }
    }
  },
  plugins: []
};

export default config;
