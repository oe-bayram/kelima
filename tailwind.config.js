/** @type {import('tailwindcss').Config} */

// Design tokens gespiegelt aus design-system/ (Lernwort DS).
// Werte-Referenz: design-system/TOKENS.md + design-system/tokens/colors.css.
// Theming folgt der App-Konvention: EINE Palette + `dark:`-Varianten
// (darkMode: 'media'); die warmen Neutrals & das Pinien-Grün ersetzen die
// alten kühlen Grautöne / das Blau app-weit.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        // Aktiv erst nach Laden der Fonts (expo-font / @expo-google-fonts).
        // Bis dahin nicht per Klasse anwenden -> System-Font (kein Crash).
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        display: ['Schibsted Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ---- Marke / Primär: Pinien-Grün (ersetzt das alte Blau) ----
        brand: {
          DEFAULT: '#1F8160',
          foreground: '#ffffff',
        },
        primary: {
          50: '#E9F5EF',
          100: '#CFE9DD',
          200: '#A6D6C1',
          300: '#6FBF9C',
          400: '#3FA67D',
          500: '#1F8160',
          600: '#1A6E51', // hover / pressed
          700: '#14543E',
          800: '#0E3C2D',
          900: '#0A2C21',
          DEFAULT: '#1F8160',
          foreground: '#ffffff',
        },
        // ---- Akzent: warmes Clay (Streaks, Highlights) ----
        accent: {
          50: '#FBEFE7',
          100: '#F5D9C7',
          300: '#E5A579',
          500: '#C8703D',
          600: '#AE5C2E',
          DEFAULT: '#C8703D',
        },
        // ---- Warme „Papier"-Neutrals (ersetzen Tailwinds kühle grays) ----
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAF8',
          100: '#F3F2EC',
          150: '#ECEAE2',
          200: '#E3E1D7',
          300: '#D2CFC2',
          400: '#B0AC9C',
          500: '#8A867A',
          600: '#6A6760',
          700: '#4C4A44',
          800: '#312F2B',
          900: '#1A1A18',
          950: '#141513',
        },
        // ---- Genus-Farbcodierung (nicht Teil des DS – App-spezifisch) ----
        genus: {
          der: '#2563eb', // blau
          die: '#dc2626', // rot
          das: '#16a34a', // grün
        },
        // ---- Lernstatus (DS-didaktisch: rot→amber→grün→blau) ----
        // DEFAULT = kräftige „solid"-Farbe (Dots/Meter/Text),
        // fg/bg/border für Pills (StatusBadge-Look).
        status: {
          neu: { DEFAULT: '#A8A498', fg: '#6A6760', bg: '#EFEEE8', border: '#DCDAD0' },
          nichtGewusst: { DEFAULT: '#C0392E', fg: '#B23A2E', bg: '#FAEAE7', border: '#F0CFC9' },
          schwer: { DEFAULT: '#C98A1E', fg: '#A06A12', bg: '#F8EFD7', border: '#EDDBAE' },
          kannIch: { DEFAULT: '#1F8160', fg: '#1A6E51', bg: '#E4F1EA', border: '#C4E2D2' },
          sicher: { DEFAULT: '#2D62C9', fg: '#2D62C9', bg: '#E8EEFB', border: '#CBD9F4' },
        },
      },
    },
  },
  plugins: [],
};
