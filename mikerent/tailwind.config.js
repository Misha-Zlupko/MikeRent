/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        text: "#1e3a8a",
        primary: "#2563eb",
        muted: "#94a3b8",
        border: "#e5e7eb",
        main: "#00a1f1",
      },
    },
  },
  plugins: [],
};
