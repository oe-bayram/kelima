/** @type {import('tailwindcss').Config} */

// Design tokens gespiegelt aus design-system/ (Kelima DS).
// Werte-Referenz: design-system/TOKENS.md + design-system/tokens/colors.css.
// Theming folgt der App-Konvention: EINE Palette + `dark:`-Varianten
// (darkMode: 'media'); Palette aus dem Kelima-Logo abgeleitet: kühle Ice-
// Neutrals + Ozean-Blau (Navy-Tinte) primär, Teal-Grün als Akzent.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      // React Native kennt keine Font-Fallbacks & wählt Gewichte nicht selbst:
      // jede Schriftstärke ist eine eigene Familie. Darum gewichts-explizite
      // Aliase (font-sans-semibold statt font-semibold). Geladen in _layout.tsx.
      fontFamily: {
        sans: ['HankenGrotesk_400Regular'],
        'sans-medium': ['HankenGrotesk_500Medium'],
        'sans-semibold': ['HankenGrotesk_600SemiBold'],
        'sans-bold': ['HankenGrotesk_700Bold'],
        display: ['SchibstedGrotesk_700Bold'],
        'display-black': ['SchibstedGrotesk_800ExtraBold'],
        mono: ['JetBrainsMono_400Regular'],
        'mono-bold': ['JetBrainsMono_700Bold'],
      },
      colors: {
        // ---- Marke / Primär: Kelima Ozean-Blau (aus dem Logo-Verlauf) ----
        brand: {
          DEFAULT: '#1E86B8',
          foreground: '#ffffff',
          // Verlauf-Stops (nur Brand-Momente: Splash/Login-Hero, Icon) —
          // für expo-linear-gradient, nie als Komponenten-Hintergrund.
          navy: '#204A94',
          blue: '#219EC9',
          green: '#2CAF88',
          ink: '#232B57',
          ice: '#D1E9FA',
        },
        primary: {
          50: '#EAF4FB',
          100: '#D1E9FA',
          200: '#A3D4EE',
          300: '#64B7DE',
          400: '#35A0CE',
          500: '#1E86B8',
          600: '#1B6FA4', // hover / pressed
          700: '#205490', // ≈ Marken-Navy
          800: '#1F3D74',
          900: '#232B57', // = Marken-Tinte
          DEFAULT: '#1E86B8',
          foreground: '#ffffff',
        },
        // ---- Akzent: Teal-Grün (Streaks, Erfolg, Highlights) ----
        accent: {
          50: '#E6F6F0',
          100: '#C6EBDE',
          300: '#6FCDAC',
          500: '#2CAF88',
          600: '#1F9372',
          DEFAULT: '#2CAF88',
        },
        // ---- Kühle „Ice"-Neutrals (Navy-getönt, ersetzen die warmen) ----
        neutral: {
          0: '#FFFFFF',
          50: '#F7F9FB',
          100: '#EFF3F7',
          150: '#E7ECF2',
          200: '#DCE3EB',
          300: '#C6D0DC',
          400: '#9CA9BC',
          500: '#77839A',
          600: '#5A6580',
          700: '#414B66',
          800: '#2E3550',
          900: '#232B57',
          950: '#141724', // = Dark-Theme neutral-50
        },
        // ---- Genus-Farbcodierung (nicht Teil des DS – App-spezifisch) ----
        genus: {
          der: '#2563eb', // blau
          die: '#dc2626', // rot
          das: '#16a34a', // grün
        },
        // ---- Lernstatus (DS-didaktisch: rot→amber→teal-grün→navy-blau) ----
        // DEFAULT = kräftige „solid"-Farbe (Dots/Meter/Text),
        // fg/bg/border für Pills (StatusBadge-Look).
        // „Kann ich" = Marken-Grün, „Sicher" = Marken-Blau (Meisterung
        // konvergiert auf die Markenfarben).
        status: {
          neu: { DEFAULT: '#9CA9BC', fg: '#5A6580', bg: '#EEF1F5', border: '#DAE0E8' },
          nichtGewusst: { DEFAULT: '#C4483E', fg: '#B3382F', bg: '#FBEBE9', border: '#F2CFCA' },
          schwer: { DEFAULT: '#D19A26', fg: '#9A6A0B', bg: '#FAF0D8', border: '#EDDCAC' },
          kannIch: { DEFAULT: '#2CAF88', fg: '#177D62', bg: '#E2F4ED', border: '#BFE6D6' },
          sicher: { DEFAULT: '#2E66BD', fg: '#24549E', bg: '#E8F0FB', border: '#C9DBF4' },
        },
      },
    },
  },
  plugins: [],
};
