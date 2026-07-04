# Phase 5 — Statistik, Feinschliff, QA & Release

Ziel: Statistik-Screens, vollständige DE/TR-Lokalisierung, Offline-Feinschliff, E2E-Tests, installierbares Release-APK; iOS vorbereitet. Richtwert: 2–3 Tage.

Referenz: [Masterplan](00-masterplan.md) §8, §9; Alt-Plan v1 §6.14, §7.8, §15 Schritt 9, §16.

---

## 1. Statistik (`stats/index.tsx`, `src/features/stats/`)

Alle Werte clientseitig aus ProgressMap + Sessions (kein Backend-Aggregat):

- [ ] Gesamtübersicht: Verteilung neu/nicht gewusst/schwer/kann ich/sicher (Balken), fällige Wörter, Favoriten, Gesamtfortschritt %
- [ ] Kapitelstatistik: Liste aller Kapitel mit Fortschritt % + Status-Verteilung; Tap → Kapitel-Detail
- [ ] Problemwörter-Liste (Kriterien v1 §13.3) mit Direktstart „Lernen"/„Testen"
- [ ] Letzte Sessions: Datum, Typ, Quelle, Ergebnis-Zähler, Dauer
- [ ] Vokabelstatistik auf der Card (Übersicht-Tab erweitern): gesehen/getestet/richtig/falsch, Fehlerquote, letzter Test, nächste Fälligkeit

## 2. Einstellungen komplettieren

- [ ] Sprache DE/TR (aus Phase 1) final; TTS-Tempo (Slider, persistiert); Konto (E-Mail, Abmelden, Passwort ändern via Amplify-Flow)
- [ ] Outbox-Status („n Bewertungen ausstehend" + manueller Sync-Button)
- [ ] App-Info: Version, Content-Version (aus `ContentVersion`), Lizenz-/Quellenhinweis (Goethe/DTZ)

## 3. i18n & Politur

- [ ] Alle Strings in `de/` und `tr/` vollständig; Review der türkischen Grammatik-Begriffe
- [ ] Dark Mode prüfen (NativeWind), Genus-/Status-Farben mit ausreichendem Kontrast (a11y), Schriftgrößen-Skalierung
- [ ] Leere Zustände (kein Fortschritt, keine Favoriten, keine fälligen Wörter) mit hilfreichen CTAs
- [ ] Haptik/Feedback bei Bewertung (expo-haptics, optional)

## 4. QA (Checkliste aus v1 §15 Schritt 9, erweitert)

- [ ] Import doppelt ausführen → Idempotenz (erneut, gegen finale Daten)
- [ ] Nutzerisolierung: zweiter Testnutzer sieht keine fremden Daten
- [ ] Cloud-Sync auf zwei Geräten
- [ ] TTS auf mind. 2 physischen Android-Geräten (unterschiedliche TTS-Engines)
- [ ] Große Kapitel (300+ Wörter), Wörter ohne Übersetzung/Formen, nur-Plural/unzählbar-Nomen, Verben mit „sein"-Perfekt, nicht steigerbare Adjektive, Nomen ohne Grammatik-Objekt (6) bzw. ohne Genus (10 — Genus-Farbe robust), Verben ohne Verb-Objekt (~12)
- [ ] **Maestro-E2E lokal** (kostenlos): Flows `login`, `kapitel-öffnen-card-formen`, `lernsession-bewerten`, `testsession`, `offline-bewertung-sync`
- [ ] Unit-Tests: dueAt-Berechnung, Status-Mapping, Problemwort-Kriterien, Merkmal-Parser (Phase 2), Outbox-Replay

## 5. Release (Android, kostenlos)

- [ ] App-Icon, Splash, App-Name, `versionCode`-Konvention
- [ ] Produktions-Backend: Amplify-Pipeline (backend-only, Git-Branch `main`) deployt eigenen Stack; Import gegen Prod ausführen; `amplify_outputs.json` je Umgebung
- [ ] Signiertes Release-APK **lokal** bauen: `npx expo run:android --variant release` (Keystore sicher ablegen); Installation auf Zielgeräten
- [ ] Optional (im Free-Kontingent): 1 EAS-Cloud-Build als Gegenprobe; Play-Store-Veröffentlichung erst nach Klärung der Wortlisten-Rechte (v1 §17.1)
- [ ] README: Release-Prozess, Umgebungen, Import-Runbook

## 6. iOS-Vorbereitung (Ausblick)

- [ ] Keine iOS-Blocker im Code (Plattform-Checks, SafeArea, TTS `de-DE` via AVSpeech ok)
- [ ] Plan: EAS Free (15 iOS-Builds/Monat) + TestFlight; erfordert Apple-Developer-Konto (99 $/Jahr) — einzige unvermeidbare Kostenposition, Entscheidung später

---

## Akzeptanzkriterien

- Alle Statistik-Anforderungen aus v1 §6.14 sichtbar und korrekt (Stichproben nachgerechnet).
- App vollständig zweisprachig; Umschalten wirkt sofort auf alle Screens.
- QA-Checkliste abgearbeitet, Maestro-Flows grün, Unit-Tests grün in CI.
- Signiertes Release-APK auf 2 Geräten installiert; Prod-Backend getrennt von Sandbox, Import-Report grün.
- Akzeptanzkriterien v1 §16 (Login/Sync, Import, Cards, Lernen, Testen, Statistiken, TTS) vollständig erfüllt.

## Ergebnisartefakte

Statistik-Feature · finale i18n-Dateien · Maestro-Suite + Unit-Tests · Release-APK + Keystore-Doku · Prod-Stack mit importierten Daten · Release-Runbook.
