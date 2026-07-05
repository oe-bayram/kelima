# Phase 1 — Fundament: Projekt, Styling, Auth, Dev-Build

Ziel: Lauffähige Expo-App auf einem Android-Gerät mit NativeWind-Styling, expo-router-Gerüst, Cognito-Login (Amplify Gen 2 Sandbox) und i18n-Grundgerüst (DE/TR). Richtwert: 1–2 Tage.

Referenz: [Masterplan](00-masterplan.md) §2, §3, §6, §11.

---

## 0. Voraussetzungen (einmalig)

- [ ] Node ≥ 20.19 (empfohlen: 22 LTS), pnpm ≥ 9
- [ ] Android Studio + SDK + JDK 17, ein Gerät (USB-Debugging) oder Emulator
- [ ] AWS-Konto mit konfiguriertem Profil (`aws configure sso` oder Access Keys) und Bootstrap-Rechten
- [ ] Git-Repository `kelima` (GitHub)
- [ ] Claude-Code-Werkzeuge installieren: Expo Skills (`npx skills add expo/skills`), aws-amplify-Plugin, AWS Knowledge MCP (Masterplan §10)

## 1. Projekt anlegen

- [ ] `pnpm create expo-app kelima` (SDK 57, Default-Template mit expo-router, TypeScript strict)
- [ ] Beispielcode entfernen, Ordnerstruktur aus Masterplan §3.1 anlegen (`src/components`, `src/features`, `src/hooks`, `src/lib`, `scripts/`, `data/`)
- [ ] ESLint (expo-Config) + Prettier; `npx expo-doctor` grün
- [ ] `.gitignore`: `amplify_outputs.json`, `.expo/`, `android/`, `ios/`

## 2. NativeWind einrichten (inkl. Spike)

Primärpfad **v4.2.x + Tailwind 3.4.x**:

- [ ] `pnpm add nativewind react-native-reanimated react-native-safe-area-context` + `pnpm add -D tailwindcss@^3.4.17`
- [ ] `tailwind.config.js` mit `presets: [require("nativewind/preset")]`, content: `./app/**/*.{ts,tsx}`, `./src/**/*.{ts,tsx}`
- [ ] `global.css` (@tailwind base/components/utilities), Import in `app/_layout.tsx`
- [ ] babel: `["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"` · metro: `withNativeWind(config, { input: './global.css' })`
- [ ] `nativewind-env.d.ts` mit `/// <reference types="nativewind/types" />`
- [ ] **Spike:** Test-Screen mit Klassen-Styling + einer Reanimated-Animation auf dem Gerät bauen. Bei Worklets-/Babel-Konflikten (bekanntes SDK-54+-Thema): auf **v5-Preview** wechseln — Setup per Expo-Skill `expo-tailwind-setup` (Tailwind v4, `react-native-css`, lightningcss auf 1.30.1 pinnen). Entscheidung im README dokumentieren.
- [ ] Design-Tokens definieren: Farben für Genus (der/die/das), Status (neu/nicht gewusst/schwer/kann ich/sicher), Dark Mode vorbereitet (`darkMode: 'class'` bzw. system)

## 3. UI-Basis

- [ ] `npx @react-native-reusables/cli init`, dann `add button card tabs progress badge input` (+ nach Bedarf)
- [ ] `@gorhom/bottom-sheet` installieren
- [ ] Basiskomponenten prüfen/anpassen: Screen-Wrapper (SafeArea), Typografie-Skala

## 4. expo-router-Gerüst

- [ ] Routenbaum aus Masterplan §6 als Platzhalter-Screens anlegen: `(auth)/sign-in`, `(app)/_layout` mit Tab-Bar (Start, Kapitel, Statistik, Einstellungen), leere Screens für chapters/vocab/session/stats/settings
- [ ] Kein direkter `@react-navigation/*`-Import (SDK-56+-Fork!); Navigation ausschließlich über expo-router-APIs
- [ ] Auth-Gate: nicht eingeloggt → Redirect auf `(auth)/sign-in`

## 5. Amplify Gen 2 Grundgerüst

- [ ] `pnpm create amplify@latest` im Projekt (erzeugt `amplify/`)
- [ ] `amplify/auth/resource.ts`: `defineAuth({ loginWith: { email: true } })`
- [ ] `amplify/data/resource.ts`: vorerst Minimal-Schema (z. B. nur `ContentVersion`) — Vollschema kommt in Phase 2
- [ ] RN-Abhängigkeiten: `pnpm add aws-amplify @aws-amplify/react-native @react-native-community/netinfo @react-native-async-storage/async-storage react-native-get-random-values react-native-url-polyfill`
- [ ] `npx ampx sandbox` starten → `amplify_outputs.json`
- [ ] `src/lib/amplify.ts`: `Amplify.configure(outputs)`; Import als Erstes in `app/_layout.tsx`

## 6. Login-Flow

- [ ] `<Authenticator.Provider>` + `<Authenticator>` um die `(app)`-Gruppe (E-Mail + Passwort, Sign-up mit Bestätigungscode)
- [ ] Authenticator-Texte via dessen i18n auf Deutsch/Türkisch
- [ ] Abmelden-Button in Einstellungen (`signOut()`)
- [ ] Smoke-Test **auf dem Gerät** (nicht nur Emulator): Registrieren → Bestätigen → Login → App → Logout → Login. Damit ist auch Amplify ↔ New Architecture verifiziert (Masterplan §11)

## 7. Lokaler Dev-Build (Android)

- [ ] `pnpm add expo-dev-client` (expo install)
- [ ] `npx expo run:android` → Dev Build auf Gerät; Metro-Reload testen
- [ ] Build-Anleitung im README (inkl. `npx expo start --clear` bei Metro-Cache-Problemen)

## 8. i18n-Grundgerüst

- [ ] `pnpm add i18next react-i18next expo-localization`
- [ ] `src/lib/i18n/` mit `de/common.json`, `tr/common.json`; Initialisierung mit Gerätesprache, Fallback `de`
- [ ] MMKV installieren (`react-native-mmkv`) und Sprachwahl persistieren; Umschalter (DE/TR) provisorisch in Einstellungen
- [ ] TanStack Query (`@tanstack/react-query`) + QueryClientProvider mit MMKV-Persister einrichten (noch ohne echte Queries)
- [ ] Zustand installieren; `useSettingsStore` (Sprache, später TTS-Tempo)

## 9. CI (leichtgewichtig)

- [ ] GitHub Actions: `pnpm lint`, `pnpm tsc --noEmit`, `jest-expo`-Testlauf (1 Dummy-Test), `npx expo-doctor`
- [ ] Kein Cloud-Build in CI (kostenlos bleiben) — Builds nur lokal

---

## Akzeptanzkriterien

- App startet als lokaler Dev-Build auf einem Android-Gerät.
- Registrierung, Login, Logout funktionieren gegen die Sandbox; nach App-Neustart bleibt die Session bestehen.
- Ein Beispiel-Screen ist vollständig mit Tailwind-Klassen gestylt; Tabs-Navigation funktioniert.
- UI-Sprache folgt der Gerätesprache und ist manuell auf DE/TR umschaltbar (mind. 5 Strings übersetzt).
- `expo-doctor`, Lint, Typecheck und CI sind grün; README dokumentiert Setup + NativeWind-Entscheidung (v4 oder v5-Preview).

## Ergebnisartefakte

Repo mit lauffähiger App · `amplify/` mit Auth · README (Setup, Build, Entscheidungen) · CI-Workflow.
