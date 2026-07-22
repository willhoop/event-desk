/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./app/**/*.{ts,tsx}", "./engine/**/*.ts", "./data/**/*.ts"],
  theme: {
    extend: {
      colors: {
        paper: "#16181c",
        paper2: "#1f2226",
        ink: "#eef1f4",
        ink2: "#c9cdd4",
        faint: "#8a9099",
        rule: "#343941",
        ember: "#e2572b",
        green: "#4a9e7f",
        gold: "#d0a54e",
        steel: "#7d9fd4",
        oxblood: "#e2572b",
        chip: "#2a2e34",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["SFMono-Regular", "ui-monospace", "Menlo", "Consolas", "monospace"],
        sans: ["Helvetica Neue", "Arial", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
