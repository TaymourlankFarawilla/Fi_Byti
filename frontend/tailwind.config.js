/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        artisan: {
          terracotta: "#C85A32",
          "terracotta-dark": "#A64421",
          sand: "#F7F3EC",
          "sand-light": "#FDFBF7",
          olive: "#3A5A40",
          "olive-light": "#588157",
          slate: "#1C2526",
          gold: "#D4A373",
          brass: "#B07D46"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
