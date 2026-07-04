/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Dark mode follows the system color scheme (useColorScheme) via the `dark:` variant.
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Markenfarbe (Splash / Primär-Aktion)
        brand: {
          DEFAULT: '#208AEF',
          foreground: '#ffffff',
        },
        // Genus-Farbcodierung (durchgängig in der ganzen App) – Masterplan §5
        genus: {
          der: '#2563eb', // blau
          die: '#dc2626', // rot
          das: '#16a34a', // grün
        },
        // Lernstatus-Farben – neu | nicht gewusst | schwer | kann ich | sicher
        status: {
          neu: '#64748b',
          nichtGewusst: '#dc2626',
          schwer: '#f59e0b',
          kannIch: '#0ea5e9',
          sicher: '#16a34a',
        },
      },
    },
  },
  plugins: [],
};
