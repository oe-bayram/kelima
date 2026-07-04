# B1-Vokabeltrainer — Masterplan v2

Stand: 2026-07-04 · Ersetzt/verfeinert `b1-vokabeltrainer-phase1-plan.md` · Recherche-Stand: Juli 2026

---

## 1. Ziel und Kontext

React-Native-App zum Lernen der Deutsch-B1-Vokabeln (Goethe + DTZ, zusammengeführt) für türkischsprachige Lernende. Kernablauf: Login → Kapitel wählen → Cards lernen (mit TTS, Hide/Reveal) → durch andere Person abfragen lassen → Bewertung → Problemwörter wiederholen → Fortschritt cloud-synchron.

**Neu gegenüber Plan v1:**

- Der Formen-Generator ist **abgeschlossen**: der Datensatz ist von ~6.600 auf **54.852 grammatische Formen** gewachsen (volle Nomen-Deklination; Verb-Konjugation inkl. Plusquamperfekt, Futur I/II, Konjunktiv I/II, Passiv, Partizip I/II, zu-Infinitiv; Adjektiv-Steigerung). Alle Formen werden in der Wort-View **strukturiert als Paradigma-Tabellen** angezeigt.
- Formen erhalten **strukturierte Merkmale** (kategorie, kasus, numerus, tempus, modus, person, grad …) statt nur eines Merkmal-Strings.
- Konkreter Tech-Stack mit Versionen (Stand Juli 2026), NativeWind für Styling, Expo nur mit kostenlosen Leistungen.
- Aufteilung in 5 direkt abarbeitbare Implementierungsphasen (je ein eigenes Dokument).

**Festgelegte Entscheidungen:**

| Entscheidung  | Festlegung                                                                              |
| ------------- | --------------------------------------------------------------------------------------- |
| Plattform     | **Android zuerst** (lokale Builds, kein Mac nötig), iOS später über EAS-Free-Kontingent |
| App-Sprache   | **Umschaltbar Deutsch/Türkisch** (i18n von Anfang an)                                   |
| Formen-Modell | **Strukturierte Merkmale** pro Form                                                     |
| Backend       | AWS Amplify Gen 2 (Cognito, AppSync GraphQL, DynamoDB)                                  |
| Styling       | NativeWind (Tailwind für React Native)                                                  |
| Expo          | Nur kostenlose Leistungen (lokale Builds unbegrenzt, EAS Free Plan als Reserve)         |
| Dokumente     | Masterplan + 5 Phasenpläne                                                              |

---

## 2. Tech-Stack (verifiziert Juli 2026)

### 2.1 Frontend

| Baustein         | Version / Wahl                                                                                                                 | Begründung                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Expo SDK         | **57** (RN 0.86, React 19.2)                                                                                                   | Aktuell stabil; New Architecture ist einzige Architektur, Hermes V1 Standard, React Compiler aktiv                                      |
| Sprache          | TypeScript ~6.0 (strict)                                                                                                       | SDK-Standard                                                                                                                            |
| Navigation       | **expo-router** (SDK-versioniert, 57.x)                                                                                        | Empfohlener Standard. Achtung: seit SDK 56 eigener Fork der React-Navigation-Interna — **keine direkten `@react-navigation/*`-Imports** |
| Styling          | **NativeWind 4.2.x + Tailwind CSS 3.4.x** (stabil); Fallback: v5-Preview, falls Reanimated-4-Interop klemmt (Spike in Phase 1) | v5 (Tailwind v4) ist noch Preview; Expo-Skill `expo-tailwind-setup` deckt v5-Setup ab                                                   |
| UI-Komponenten   | **react-native-reusables** (shadcn/ui-Port auf NativeWind, CLI) + `@gorhom/bottom-sheet`                                       | Cards, Tabs, Buttons, Progress fertig; copy-paste, kein Lock-in                                                                         |
| Server-State     | **TanStack Query v5** über Amplify Data Client                                                                                 | Offizielles Amplify-Gen2-Muster für Caching/Optimistic UI                                                                               |
| UI-State         | **Zustand v5**                                                                                                                 | Session-Engine, Einstellungen                                                                                                           |
| Listen           | **@shopify/flash-list v2**                                                                                                     | Tausende Einträge, New-Arch-nativ                                                                                                       |
| Persistenz lokal | **react-native-mmkv v4** (Query-Persist, Outbox, Settings)                                                                     | Schnell; benötigt Dev Build — haben wir ohnehin (Amplify)                                                                               |
| TTS              | **expo-speech** (`de-DE`, `tr-TR`)                                                                                             | Geräte-TTS, kostenlos; Emulator-Stimmen ggf. eingeschränkt                                                                              |
| i18n             | **i18next v26 + react-i18next v17 + expo-localization**                                                                        | DE/TR umschaltbar                                                                                                                       |
| Validierung      | **zod v4**                                                                                                                     | Import-Skript + Laufzeit-Guards                                                                                                         |
| Animation        | react-native-reanimated 4.5 (SDK-Bundle) + gesture-handler **2.32** (SDK-Bundle, nicht v3)                                     | Karten-Gesten, Reveal-Animationen                                                                                                       |

### 2.2 Backend (Amplify Gen 2)

| Baustein           | Version / Wahl                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| aws-amplify        | **6.18.x** (+ `@aws-amplify/react-native` 1.3.x, `@react-native-community/netinfo`, `@react-native-async-storage/async-storage`, `react-native-get-random-values`) |
| Backend-Definition | **@aws-amplify/backend 1.23.x** (`defineAuth`, `defineData`)                                                                                                       |
| Auth               | Amazon Cognito (E-Mail + Passwort), UI: **@aws-amplify/ui-react-native 2.7.x** Authenticator                                                                       |
| API/DB             | AppSync GraphQL + DynamoDB über `a.model()`                                                                                                                        |
| Dev-Workflow       | `npx ampx sandbox` (persönliche Cloud-Sandbox), Deploy über Amplify-Pipeline (backend-only)                                                                        |
| Import             | Node/TS-Skript mit generiertem Data Client (siehe Phase 2)                                                                                                         |

**Wichtig:** Amplify v6 enthält native Module → **läuft nicht in Expo Go**. Von Tag 1 an Development Build: `npx expo run:android` (kostenlos, unbegrenzt, nur Android Studio/JDK nötig).

### 2.3 Kosten (Hobby-Betrieb, < 10 Nutzer)

- Cognito: 10.000 MAU dauerhaft frei · DynamoDB: 25 GB dauerhaft frei · AppSync: nach Startguthaben ~4 $/Mio. Requests → **praktisch 0 €/Monat**; einmaliger Import (~67k Mutationen) ≈ 0,30 $ worst case.
- Neue AWS-Konten (seit 07/2025): bis 200 $ Startguthaben + 6-Monats-Free-Plan.
- Expo: lokale Builds unbegrenzt frei; EAS Free Plan (15 Android- + 15 iOS-Cloud-Builds/Monat, EAS Update 1.000 MAU) als Reserve und für den späteren iOS-Build.

---

## 3. Architektur

```txt
┌──────────────── Expo App (Android zuerst) ────────────────┐
│ expo-router (Screens)                                     │
│ UI: NativeWind + react-native-reusables                   │
│ ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│ │ TanStack     │  │ Zustand       │  │ expo-speech     │  │
│ │ Query v5     │  │ (Session,     │  │ (TTS de-DE)     │  │
│ │ + MMKV-      │  │  Settings,    │  └─────────────────┘  │
│ │ Persist      │  │  Outbox)      │  ┌─────────────────┐  │
│ └──────┬───────┘  └───────────────┘  │ i18next (de/tr) │  │
│        │ Amplify Data Client (generateClient<Schema>)   │ │
└────────┼──────────────────────────────────────────────────┘
         │ GraphQL (userPool-Auth)
┌────────▼──────── AWS (Amplify Gen 2) ─────────┐
│ Cognito (Auth) · AppSync (API) · DynamoDB     │
│   Content-Modelle: authenticated read,        │
│     Gruppe "admin" schreibt                   │
│   User-Modelle: owner-basiert                 │
└────────▲──────────────────────────────────────┘
         │ Import-Skript (Node/TS, admin-User)
   wortliste_b1_struktur.json + generierte Formen
```

Grundprinzipien (aus v1 übernommen): Content global & read-only für Nutzer; Lerndaten owner-basiert; Bewertungen sofort schreiben (append-only Session-Items); Statistiken clientseitig aus gecachten Progress-Daten berechnet (≤ ~3k Datensätze pro Nutzer — kein Pre-Aggregat nötig).

### 3.1 Projektstruktur

```txt
kelima/
├─ amplify/                 # Gen-2-Backend
│  ├─ auth/resource.ts
│  ├─ data/resource.ts      # Schema (siehe §4)
│  └─ backend.ts
├─ app/                     # expo-router Routen (siehe §6)
├─ src/
│  ├─ components/ui/        # react-native-reusables
│  ├─ components/vocab/     # Card, Tabs, Paradigma-Tabellen, StatusBadge …
│  ├─ features/             # session/, progress/, favorites/, stats/
│  ├─ hooks/                # useVocabEntry, useForms, useTts, …
│  ├─ lib/                  # amplifyClient, queryClient, mmkv, i18n/
│  └─ types/
├─ scripts/import/          # Import-Skript (Phase 2)
├─ data/                    # wortliste_b1_struktur.json (+ Formen-Erweiterung)
├─ global.css · tailwind.config.js · babel.config.js · metro.config.js
└─ amplify_outputs.json     # generiert (gitignored)
```

---

## 4. Datenmodell v2

Modelle wie v1 (`VocabularyEntry`, `VocabularyExample`, `Chapter`, `VocabularyChapter`, `ContentVersion`, `UserVocabularyProgress`, `LearningSession`, `LearningSessionItem`, `UserFavoriteVocabulary`) — mit zwei wesentlichen Änderungen: **strukturiertes `VocabularyForm`** und erweiterte Entry-Attribute.

### 4.1 VocabularyForm (strukturiert)

```ts
VocabularyForm: a.model({
  entryId: a.id().required(),
  form: a.string().required(), // "des Tisches", "bog ab", "am schnellsten"
  merkmalText: a.string().required(), // menschenlesbar: "Genitiv Singular"
  translationTr: a.string(),
  kategorie: a.ref("FormKategorie").required(),
  kasus: a.ref("Kasus"), // Nomen/weibl. Form
  numerus: a.ref("Numerus"), // Nomen + finite Verbformen
  tempus: a.ref("Tempus"), // s. Enum-Liste unten
  modus: a.ref("Modus"), // indikativ|konjunktiv1|konjunktiv2
  genusVerbi: a.ref("GenusVerbi"), // aktiv|passiv
  person: a.integer(), // 1|2|3 (finite Verbformen)
  anrede: a.ref("Anrede"), // du|ihr|sie_hoeflich (Imperativ/Höflichkeitsform)
  grad: a.ref("Grad"), // positiv|komparativ|superlativ
  sortOrder: a.integer().required(),
})
  .secondaryIndexes((i) => [
    i("entryId").sortKeys(["sortOrder"]).queryField("listFormsByEntry"),
  ])
  .authorization((allow) => [
    allow.authenticated().to(["read"]),
    allow.group("admin"),
  ]);
```

Enums (`a.enum`): `FormKategorie = grundform | deklination | konjugation | imperativ | partizip1 | partizip2 | zu_infinitiv | infinitiv_perfekt | steigerung | weibliche_form | sonstige` · `Kasus = nominativ | genitiv | dativ | akkusativ` · `Numerus = singular | plural` · `Tempus = praesens | praeteritum | perfekt | plusquamperfekt | futur1 | futur2` · `Modus = indikativ | konjunktiv1 | konjunktiv2` · `GenusVerbi = aktiv | passiv` · `Anrede = du | ihr | sie_hoeflich` · `Grad = positiv | komparativ | superlativ`. GraphQL-Enums erlauben keine Umlaute — Wortart-Werte werden beim Import normalisiert (`präposition` → `praeposition`).

Konvention: alle finiten Formen (inkl. Konjunktiv I/II, Plusquamperfekt, Futur I/II, Passiv) sind `kategorie=konjugation` mit `tempus`/`modus`/`genusVerbi`; Imperativ, Partizip I/II, zu-Infinitiv und Infinitiv Perfekt sind eigene Kategorien. `form` enthält bei Nomen den Artikel („des Tisches"), bei Perfekt das Hilfsverb („ist gegangen").

### 4.2 VocabularyEntry — neue/geänderte Felder

Zusätzlich zu v1 (§8.2 im Alt-Plan):

```ts
steigerbar: a.boolean(),          // Adjektive: false bei tot, schwanger, …
unzaehlbar: a.boolean(),          // Nomen ohne Plural (Milch, Obst)
praepositionRektion: a.string(),  // "mit + Dativ" — fehlt in Quelldaten, manuelle Anreicherung (optional)
femininForm: a.string(),          // "die Absenderin" (Nom. Sg; Deklination in Forms)
formenStatus: a.enum(['basis','vollstaendig']) // Migrationsmarker Formen-Generator
```

### 4.3 Sekundärindizes & Query-Patterns

| Modell            | Index                                              | Query                                 |
| ----------------- | -------------------------------------------------- | ------------------------------------- |
| VocabularyForm    | `entryId` + sortKey `sortOrder`                    | `listFormsByEntry` (Card, Formen-Tab) |
| VocabularyExample | `entryId` + `sortOrder`                            | `listExamplesByEntry`                 |
| VocabularyChapter | `chapterId` + `sortOrder`; zweiter Index `entryId` | Kapitelinhalt; Kapitel eines Worts    |
| VocabularyEntry   | `normalizedLemma`                                  | Suche/Duplikatprüfung beim Import     |

User-Modelle (`UserVocabularyProgress`, `LearningSession*`, `UserFavoriteVocabulary`): `allow.owner()`. Der Client lädt den gesamten Progress des Nutzers einmal paginiert (≤ ~3k Sätze), cached ihn in TanStack Query und berechnet Dashboard/Filter/Fälligkeit lokal.

### 4.4 Autorisierung

- Default-Modus `userPool`. Content-Modelle: `allow.authenticated().to(['read'])` + `allow.group('admin')` (volle Rechte).
- Import läuft als Cognito-Nutzer der Gruppe `admin` (kein API-Key nötig, kein Ablaufdatum).
- `userId`/Owner wird serverseitig gesetzt; Clients können fremde Daten weder lesen noch schreiben.

---

## 5. Formen-Views (UI-Spezifikation)

Kernstück der Card: Tab **Formen** rendert je Wortart ein strukturiertes Paradigma aus `listFormsByEntry` (gruppiert nach `kategorie`, Reihenfolge `sortOrder`). Einklappbare Sektionen (Accordion), Kernformen immer sichtbar, jede Zeile mit TTS-Button und (falls vorhanden) türkischer Entsprechung.

**Nomen — Deklinationstabelle 4×2:**

```txt
            Singular        Plural
Nominativ   der Tisch       die Tische
Genitiv     des Tisches     der Tische
Dativ       dem Tisch       den Tischen
Akkusativ   den Tisch       die Tische
```

Zusatzsektionen: „Weibliche Form" (eigene 4×2-Tabelle, falls vorhanden), Hinweis-Badges „nur Plural" / „kein Plural (unzählbar)". Genus-Farbcodierung (der=blau, die=rot, das=grün) durchgängig in der ganzen App.

**Verb — Konjugationssektionen:**

1. Kernformen (immer sichtbar): Infinitiv · Präsens 3. Sg · Präteritum 3. Sg · Perfekt 3. Sg + Badges (Hilfsverb, trennbar, reflexiv, Rektion)
2. Präsens (6 Personen: ich/du/er-sie-es/wir/ihr/sie) — 2-Spalten-Tabelle Sg/Pl
3. Präteritum (6 Personen)
4. Perfekt (6 Personen)
5. Imperativ (du! / ihr! / Sie!)
6. Partizip I/II · Konjunktiv II · Futur I
7. Erweiterte Formen (eingeklappt): Plusquamperfekt · Futur II · Konjunktiv I · Passiv (Präsens/Präteritum/Perfekt) · zu-Infinitiv · Infinitiv Perfekt

**Adjektiv:** Positiv / Komparativ / Superlativ als 3-Zeilen-Tabelle; Badge „nicht steigerbar" wenn `steigerbar=false`. **Adverb:** Grundform, Steigerung nur falls vorhanden (gern → lieber → am liebsten). **Präposition:** Grundform + Rektion prominent („mit + Dativ") — sofern angereichert; Quelldaten enthalten keine Rektion. **Übrige Wortarten:** Grundform + Beispiele.

Leitregeln: fehlende Formen robust behandeln (Sektion ausblenden, nie leere Tabelle); `merkmalText` als Fallback-Beschriftung; Hide/Reveal (Phase 4) kann ganze Sektionen verdecken.

---

## 6. Screens & Navigation (expo-router)

```txt
app/
├─ _layout.tsx               # Provider: Amplify, QueryClient, i18n, Theme, Authenticator
├─ (auth)/sign-in.tsx        # Authenticator (DE/TR-Strings)
└─ (app)/
   ├─ _layout.tsx            # Tab-Bar: Start | Kapitel | Statistik | Einstellungen
   ├─ index.tsx              # Dashboard (Fortschritt, fällige Wörter, Schnellstart-Buttons)
   ├─ chapters/index.tsx     # Kapitelübersicht (FlashList, Fortschrittsbalken)
   ├─ chapters/[id].tsx      # Kapitel-Detail (Wortliste, Filter, Session-Start)
   ├─ vocab/[id].tsx         # Vokabel-Card (Tabs: Übersicht | Formen | Beispiele | Grammatik)
   ├─ session/learn.tsx      # Lernsession (Card-Stack, Hide/Reveal, Bewertung)
   ├─ session/test.tsx       # Testsession (Frageansicht → Antwort anzeigen → Prüferbewertung)
   ├─ session/summary.tsx    # Session-Zusammenfassung
   ├─ stats/index.tsx        # Statistik
   └─ settings/index.tsx     # Sprache DE/TR, TTS-Tempo, Konto, Abmelden
```

Funktionale Anforderungen je Screen: unverändert aus Plan v1 §6–7 (4-stufige Bewertung / 5 Statuswerte, Filter, Favoriten, Problemwörter, `dueAt`-Logik, Statistiken) — dort nachschlagen; die Phasenpläne referenzieren die jeweiligen Abschnitte.

---

## 7. Offline & Sync

Phase-1-tauglich, DataStore existiert in Gen 2 nicht:

1. **Lesen:** TanStack Query + MMKV-Persister — Content und Progress überleben App-Neustarts, App startet offline mit letztem Stand.
2. **Schreiben:** Bewertungen/Favoriten als Mutations mit Optimistic Update; bei Offline-Fehler in eine **Outbox** (Zustand + MMKV) legen und bei Reconnect (netinfo) idempotent nachspielen (Bewertungen tragen Client-Zeitstempel, letzter Schreiber gewinnt).
3. Kein vollwertiges Offline-First/Konfliktmanagement in diesem Ausbau (bewusste Grenze wie v1 §12.3).

---

## 8. i18n (DE/TR)

- i18next mit Namespaces `common`, `learn`, `stats`, `settings`; Gerätesprache via expo-localization als Default, Umschalter in Einstellungen (persistiert in MMKV).
- Authenticator-Texte über dessen i18n-Mechanismus lokalisieren.
- Grammatik-Fachbegriffe in beiden Sprachen pflegen (Nominativ/Yalın hâl, Genitiv/-in hâli, Dativ/-e hâli, Akkusativ/-i hâli …) — wichtig für die Paradigma-Tabellen, da türkische Kasusnamen den Lerntransfer unterstützen.

---

## 9. Phasenübersicht

| Phase                                                   | Inhalt                                                                                                                                                                                | Ergebnis / Demo                                                                        | Richtwert\* |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------- |
| [1 — Fundament](phase-1-fundament.md)                   | Expo-57-Projekt, NativeWind(+Spike), reusables, expo-router-Gerüst, Amplify-Sandbox, Cognito-Login, i18n-Grundgerüst, lokaler Android-Dev-Build                                       | App startet auf Android-Gerät, Login/Logout funktioniert, gestylter Dummy-Screen DE/TR | 1–2 Tage    |
| [2 — Daten & Import](phase-2-daten-import.md)           | Vollständiges Datenschema inkl. strukturierter Formen, admin-Gruppe, Import-Skript (zod, idempotent, Dry-Run, Report), Import der ~3.026 Einträge + ~55k Formen + Beispiele + Kapitel | Daten vollständig in DynamoDB, Report grün, Idempotenz nachgewiesen                    | 2–3 Tage    |
| [3 — Content-UI](phase-3-content-ui.md)                 | Dashboard-Gerüst, Kapitelübersicht/-detail, Vokabel-Card mit 4 Tabs, **Paradigma-Tabellen**, TTS, Favoriten, Suche                                                                    | Jedes Wort mit allen Formen strukturiert einsehbar und anhörbar                        | 3–5 Tage    |
| [4 — Lernen & Testen](phase-4-lernen-testen.md)         | Session-Engine, Lernsession, Hide/Reveal, Testsession (Prüfer), Bewertung → Progress + `dueAt`, Problemwörter, Outbox                                                                 | Kompletter Lern-/Test-Zyklus mit Cloud-Sync                                            | 3–4 Tage    |
| [5 — Statistik & Release](phase-5-statistik-release.md) | Statistik-Screens, Einstellungen, i18n-Vervollständigung, Offline-Feinschliff, Maestro-E2E, Release-APK, iOS-Vorbereitung                                                             | Installierbares Release-APK, QA-Checkliste erfüllt                                     | 2–3 Tage    |

\* Fokus-Arbeitstage bei agentengestützter Entwicklung; Reihenfolge strikt, jede Phase endet mit lauffähiger App.

---

## 10. Skills & MCP-Server für die Entwicklung

Empfohlen für die Implementierung mit Claude Code (Recherche 07/2026):

| Werkzeug                         | Typ                            | Nutzen                                                                                                                                  | Installation                                                                                          |
| -------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Expo Skills** (offiziell)      | Skill-Plugin                   | `expo-tailwind-setup` (NativeWind), `building-native-ui`, `native-data-fetching` (Offline/Caching), `expo-deployment`, `upgrading-expo` | `npx skills add expo/skills` oder `/plugin install expo@claude-plugins-official`                      |
| **aws-amplify Plugin** (awslabs) | Skill + MCP + Hooks            | Geführter Gen-2-Workflow (Backend → Sandbox → Frontend → Produktion), unterstützt RN explizit                                           | `/plugin marketplace add awslabs/agent-plugins` → `/plugin install aws-amplify@agent-plugins-for-aws` |
| **AWS Knowledge MCP**            | MCP (remote, ohne Credentials) | Aktuelle AWS/Amplify-Doku beim Codieren — verhindert veraltete Gen-1-Muster                                                             | `https://knowledge-mcp.global.api.aws`                                                                |
| **Context7 MCP**                 | MCP                            | Versionsgenaue Doku für NativeWind, expo-router, TanStack Query, Amplify JS                                                             | mcpservers.org/servers/context7-mcp-server                                                            |
| **Expo MCP**                     | MCP (remote)                   | Doku-Suche, `npx expo install`-kompatible Pakete, Build-Diagnose (Doku-Suche erfordert Paid-Plan → nur kostenlose Features nutzen)      | `https://mcp.expo.dev/mcp`                                                                            |
| **GitHub MCP**                   | MCP                            | Repo, Issues, PRs, CI                                                                                                                   | mcpservers.org/servers/github-mcp-server                                                              |
| **vercel-react-native-skills**   | Skill                          | RN-Performance, Reanimated-Muster                                                                                                       | skills.sh/vercel-labs/agent-skills                                                                    |
| **sleek-design-mobile-apps**     | Skill                          | Native Design-Konventionen (Safe Areas, Gesten, Plattform-Spacing)                                                                      | skills.sh/sleekdotdesign/agent-skills                                                                 |

Einsatzregel: AWS Knowledge MCP + Expo Skills ab Phase 1; aws-amplify-Plugin in Phase 1–2 (Backend); Design-Skills in Phase 3.

---

## 11. Risiken & offene Punkte

| Risiko                                                                                    | Einschätzung | Gegenmaßnahme                                                                                                                                |
| ----------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| NativeWind v4 ↔ Reanimated 4 (SDK 57 erzwingt Reanimated 4; NativeWind v5 noch Preview)   | mittel       | Spike in Phase 1 Task 2; Fallback v5-Preview via offiziellem Expo-Skill; Animationen notfalls ohne NativeWind-Klassen                        |
| Amplify + New Architecture (ältere Codegen-Issues, kein offizielles „fully supported")    | mittel       | Früher Smoke-Test in Phase 1 (Login auf Gerät); Issue-Lage prüfen; notfalls SDK 56 statt 57                                                  |
| Formen-Generator liefert flache Merkmal-Strings (96 distinkte Werte) statt Strukturfelder | niedrig      | Merkmal-Parser mit vollständiger Mapping-Tabelle + Report über nicht zuordenbare Merkmale (Phase 2); Generator abgeschlossen, Format bekannt |
| expo-router-Fork: Bibliotheken mit `@react-navigation/*`-Imports brechen                  | niedrig      | Nur reusables/eigene Komponenten; expo-doctor in CI                                                                                          |
| Reanimated-Import bläht Android-RAM auf (~25–30 %, Hermes-Bug RN 0.85+)                   | niedrig      | Worklets-Bundle-Mode-Workaround; auf Fix achten                                                                                              |
| Goethe-/ÖSD-Urheberrecht bei Veröffentlichung                                             | offen        | Privat/intern unkritisch; vor App-Store-Release rechtlich prüfen (v1 §17.1)                                                                  |
| Expo Go                                                                                   | keine        | Wird nicht genutzt (Amplify erfordert Dev Build)                                                                                             |

---

## 12. Nächste Schritte

1. ✅ Formen-Generator abgeschlossen (54.852 Formen im JSON, Format `{form, merkmal, tr}`). Verbleibt: Mapping-Tabelle der 96 Merkmal-Strings → Strukturfelder (Phase 2).
2. Phase 1 starten: [phase-1-fundament.md](phase-1-fundament.md).
3. Nach jeder Phase: Akzeptanzkriterien abhaken, Demo auf Android-Gerät, dann nächste Phase.
