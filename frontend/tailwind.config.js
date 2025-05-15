/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Only use Tailwind classes in the emergency components to avoid conflicts
  corePlugins: {
    preflight: false,
  },
} 