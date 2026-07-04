# Kelima — B1-Vokabeltrainer

React-Native-App (Expo SDK 57) zum Lernen der Deutsch-B1-Vokabeln für türkischsprachige
Lernende. Oberfläche umschaltbar **Deutsch/Türkisch**. Backend: AWS Amplify Gen 2
(Cognito, AppSync, DynamoDB). Siehe [docs/plan](docs/plan) für Masterplan und Phasenpläne.

> **Status:** Phase 1 (Fundament) umgesetzt — lauffähiges Gerüst mit NativeWind-Styling,
> expo-router-Navigation, Cognito-Login (Authenticator) und i18n. Datenimport und Lern-/
> Testflow folgen in den Phasen 2–5.

---

## Tech-Stack

| Bereich      | Wahl                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| Framework    | Expo SDK 57 (RN 0.86, React 19.2, New Architecture, React Compiler)     |
| Navigation   | expo-router 57 (typedRoutes) — **keine direkten `@react-navigation/*`** |
| Styling      | **NativeWind 4.2 + Tailwind CSS 3.4** (siehe Entscheidung unten)        |
| UI-Bausteine | react-native-reusables-Muster (cva + `cn`), `@gorhom/bottom-sheet`      |
| Server-State | TanStack Query v5 + MMKV-Persister                                      |
| UI-State     | Zustand v5 (`useSettingsStore`)                                         |
| Persistenz   | react-native-mmkv v4 (Nitro)                                            |
| i18n         | i18next v26 + react-i18next v17 + expo-localization (DE/TR)             |
| Backend      | AWS Amplify Gen 2 (`aws-amplify` 6, Cognito Authenticator)              |

## Voraussetzungen

- Node ≥ 20.19 (empf. 22 LTS), **pnpm** (siehe `packageManager` in `package.json`)
- Android Studio + SDK + JDK 17, Gerät (USB-Debugging) oder Emulator
- AWS-Konto mit konfiguriertem Profil (`aws configure sso` oder Access Keys), Bootstrap-Rechte

## Einrichtung

```bash
pnpm install

# 1) Amplify-Sandbox starten -> erzeugt amplify_outputs.json (gitignored).
#    MUSS vor dem ersten nativen Build laufen, sonst kann die App Amplify nicht
#    konfigurieren (Login/Daten schlagen fehl).
npx ampx sandbox

# 2) Lokalen Android-Dev-Build bauen und auf Gerät/Emulator installieren.
pnpm android            # = expo run:android

# Bei Metro-Cache-Problemen:
npx expo start --clear
```

> **Wichtig:** Amplify enthält native Module → läuft **nicht in Expo Go**. Es wird immer
> ein Development Build benötigt (durch `expo-dev-client` bereits eingerichtet). MMKV v4
> (Nitro) erfordert ebenfalls einen Dev-Build.

## Skripte

| Befehl           | Zweck                                              |
| ---------------- | -------------------------------------------------- |
| `pnpm android`   | Lokaler Dev-Build auf Android (`expo run:android`) |
| `pnpm start`     | Metro-Bundler                                      |
| `pnpm lint`      | ESLint (`expo lint`)                               |
| `pnpm typecheck` | `tsc --noEmit`                                     |
| `pnpm test`      | Jest (Watch) · `pnpm test:ci` für CI               |
| `pnpm format`    | Prettier                                           |
| `pnpm doctor`    | `expo-doctor`                                      |

CI (`.github/workflows/ci.yml`) führt Lint, Typecheck, Tests und expo-doctor aus —
**kein Cloud-Build** (Builds laufen lokal, kostenlos).

## Projektstruktur

```txt
amplify/                 # Gen-2-Backend (auth, data: ContentVersion-Minimalschema)
src/
├─ app/                  # expo-router
│  ├─ _layout.tsx        # Provider + Auth-Gate (Stack.Protected)
│  ├─ (auth)/sign-in.tsx # Amplify Authenticator (DE/TR)
│  └─ (app)/             # Tab-Bar: Start | Kapitel | Statistik | Einstellungen
├─ components/ui/        # Screen, Text (Typografie), Button (cva)
├─ features/settings/    # useSettingsStore (Zustand + MMKV)
├─ lib/                  # amplify, i18n, queryClient, storage, utils
└─ types/                # i18next-/css-Typen
```

## Entscheidung: NativeWind v4.2 (nicht v5-Preview)

Gewählt: **NativeWind 4.2.x + Tailwind CSS 3.4.x** (Primärpfad des Masterplans).

- **Statisches Styling** (Layout, Farben, Spacing, Dark Mode, `dark:`-Variante, responsive,
  Pseudo-States) funktioniert auf SDK 57 / New Architecture / Reanimated 4 vollständig.
- **Animationen:** NativeWinds `animate-*`/`transition-*` wurden gegen Reanimated 3 gebaut
  und sind unter Reanimated 4 unzuverlässig. Für Animationen daher **direkt Reanimated 4**
  (`useSharedValue`/`useAnimatedStyle`) verwenden, nicht NativeWind-Klassen.
- **v5-Preview** würde Reanimated-4-native Animationen bringen, **erfordert aber Tailwind v4**
  (inkompatibel mit dem hier gepinnten Tailwind 3.4). Fallback nur, falls Tailwind-getriebene
  Animationen zwingend werden — Setup dann über den Expo-Skill `expo-tailwind-setup`.
- **Babel:** Kein manueller `react-native-worklets/plugin`-Eintrag — `babel-preset-expo`
  injiziert den Worklets-/Reanimated-Plugin auf SDK 57 automatisch (und den React Compiler).

**Design-Tokens** (`tailwind.config.js`): Genus-Farben (`genus-der` blau, `genus-die` rot,
`genus-das` grün) und Lernstatus-Farben (`status-neu` … `status-sicher`) — durchgängig in der App.

## Bekannte Hinweise

- `pnpm install` zeigt Peer-Warnungen für `@aws-amplify/ui-react-native` (listet React 18 als
  Peer, wir nutzen React 19). Das ist erwartet und unkritisch (Amplify ↔ New Architecture).
- `amplify_outputs.json` ist gitignored und wird von `npx ampx sandbox` erzeugt; ohne die Datei
  startet die App nicht (der Client warnt im Dev-Modus). Typecheck/Lint/Tests laufen dennoch grün.

## Verbleibende manuelle Verifikation (Phase-1-Akzeptanz)

Diese Schritte brauchen AWS-Zugang bzw. ein Gerät und sind daher manuell durchzuführen:

1. `npx ampx sandbox` → `amplify_outputs.json` wird erzeugt.
2. `pnpm android` → App startet als Dev-Build auf einem Android-Gerät.
3. Smoke-Test **auf dem Gerät**: Registrieren → Bestätigungscode → Login → App → Abmelden →
   erneut Login. Nach App-Neustart bleibt die Session bestehen (verifiziert Amplify ↔ New Arch).
