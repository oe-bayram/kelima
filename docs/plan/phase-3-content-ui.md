# Phase 3 — Content-UI: Kapitel, Vokabel-Card, Formen-Paradigmen, TTS

Ziel: Alle Inhalte sind in der App strukturiert einsehbar — Kapitelübersicht, Kapitel-Detail mit Filtern, Vokabel-Card mit 4 Tabs inkl. vollständiger Paradigma-Tabellen, TTS und Favoriten. Richtwert: 3–5 Tage.

Referenz: [Masterplan](00-masterplan.md) §5, §6; Alt-Plan v1 §6.4–6.6, §6.12, §7.3–7.5.

---

## 1. Datenzugriff (`src/hooks/`, `src/lib/`)

- [ ] `queryKeys`-Konvention (`['chapters']`, `['chapter', id]`, `['entry', id]`, `['forms', entryId]`, `['examples', entryId]`, `['progress']`, `['favorites']`)
- [ ] Hooks über Amplify Data Client: `useChapters`, `useChapterEntries(chapterId)` (VocabularyChapter → Entries, paginiert), `useVocabEntry(id)`, `useForms(entryId)` (`listFormsByEntry`, sortiert), `useExamples(entryId)`
- [ ] Content-Queries: lange `staleTime` (Content ändert sich nur per Import), MMKV-persistiert → zweiter App-Start ohne Netz zeigt Inhalte
- [ ] `useProgressMap`: gesamten `UserVocabularyProgress` des Nutzers paginiert laden → `Map<entryId, Progress>`; `useFavorites` analog
- [ ] Fehler-/Ladezustände als wiederverwendbare Komponenten (`QueryBoundary`, Skeletons)

## 2. Kapitelübersicht & Kapitel-Detail

- [ ] `chapters/index.tsx`: FlashList; je Kapitel Titel, Typ-Badge (Wortgruppe/Auto), Vokabelzahl, Fortschrittsbalken (aus `useProgressMap` berechnet: % kann-ich+sicher)
- [ ] Sektionen: „Wortgruppen" / „Lernkapitel 1–50, 51–100 …"
- [ ] `chapters/[id].tsx`: Wortliste (FlashList) mit Lemma, Wortart-Kürzel, Genus-Farbe, Status-Badge, Favoriten-Stern; Filterleiste (Alle | Neu | Nicht gewusst | Schwer | Kann ich | Sicher | Fällig | Favoriten — clientseitig über ProgressMap); Buttons „Lernen" / „Testen" / „Problemwörter" (Navigation vorbereitet, Sessions kommen in Phase 4)
- [ ] Suche (Should-have): Suchfeld über gecachte Einträge (normalizedLemma + Übersetzung, akzent-/umlautnormalisiert)

## 3. Vokabel-Card (`vocab/[id].tsx`)

- [ ] Kopf: Lemma (bei Nomen mit Artikel + Genus-Farbe), Wortart, türkische Übersetzung, Status-Badge, Favoriten-Stern (optimistic), TTS-Button
- [ ] Tabs (reusables): **Übersicht | Formen | Beispiele | Grammatik**
- [ ] Übersicht: Kernformen kompakt (Wortart-abhängig), Kapitel-Zuordnungen, Statuswerte
- [ ] Beispiele: alle Sätze DE (fett) + TR, je Satz TTS-Button
- [ ] Grammatik: Nomen (Artikel, Genus, Plural, Original-Pluralangabe, nur-Plural/unzählbar), Verb (Hilfsverb, trennbar, reflexiv, Rektion falls vorhanden), Präposition (Rektion falls angereichert — Quelldaten leer), Adjektiv (steigerbar)
- [ ] Robustheit: fehlende Übersetzungen/Felder → Abschnitt ausblenden (Akzeptanz v1 §16 „Cards")

## 4. Formen-Tab: Paradigma-Komponenten (`src/components/vocab/paradigm/`)

Kernstück der Phase — Rendering strikt nach Masterplan §5:

- [ ] `DeclensionTable` (Nomen, weibliche Form): 4 Kasus × Sg/Pl aus Forms mit `kategorie=deklination` (+ `grundform`); Artikel im String; Zeilen-TTS; unzählbar/nur-Plural → einspaltig + Badge
- [ ] `ConjugationSection` (Verb): Kernformen-Karte immer sichtbar; Accordion-Sektionen Präsens/Präteritum/Perfekt (je 6 Personen als Sg/Pl-Tabelle mit Pronomen), Imperativ (du/ihr/Sie), Partizip I/II; Sektion „Erweiterte Formen" (eingeklappt): Plusquamperfekt, Futur I/II, Konjunktiv I/II, Passiv (Präsens/Präteritum/Perfekt), zu-Infinitiv, Infinitiv Perfekt
- [ ] `ComparisonTable` (Adjektiv/Adverb): Positiv/Komparativ/Superlativ; „nicht steigerbar"-Badge
- [ ] `SimpleFormList` (übrige Wortarten): Grundform + `merkmalText`; Präposition mit Rektion prominent
- [ ] Dispatcher `FormsTab` wählt Komponente nach Wortart; Fallback: Liste nach `merkmalText`, wenn Strukturfelder fehlen (`kategorie=sonstige` / `formenStatus=basis`)
- [ ] Jede Zeile: Form + (falls vorhanden) `translationTr` sekundär; lange Paradigmen performant (Sektionen lazy)
- [ ] Grammatik-Begriffe über i18n (de: „Genitiv", tr: „-in hâli" …)

## 5. Text-to-Speech (`useTts`)

- [ ] expo-speech-Wrapper: `speak(text, { language: 'de-DE', rate })`, Stopp bei erneutem Tap/Screenwechsel; Rate aus Settings-Store
- [ ] Einsatzstellen: Card-Kopf (Lemma), jede Formen-Zeile, jeder Beispielsatz
- [ ] Gerätetest: verfügbare de-DE-Stimme prüfen, Hinweis-Toast falls keine deutsche Stimme installiert

## 6. Favoriten

- [ ] `useToggleFavorite`: Mutation + optimistisches Update der Favoritenliste; Stern auf Card und in Listen
- [ ] Favoriten-Filter in Kapitel-Detail funktioniert

## 7. Dashboard (Gerüst)

- [ ] `index.tsx`: Begrüßung, Gesamtzahlen (aus ProgressMap: gesamt/neu/fällig/Favoriten), Schnellzugriff „Kapitel", Platzhalter-Buttons „Weiterlernen"/„Testsession"/„Problemwörter" (aktiv ab Phase 4)

---

## Akzeptanzkriterien

- Jede der 3.026+ Vokabeln ist erreichbar: Kapitel → Wortliste → Card; alle 4 Tabs gefüllt.
- Nomen zeigen die vollständige 4×2-Deklinationstabelle, Verben alle Konjugationssektionen (inkl. Imperativ, Partizip I/II, Konjunktiv I/II, Plusquamperfekt, Futur I/II, Passiv), Adjektive die Steigerung — jeweils mit korrekten Beschriftungen in DE und TR.
- Wörter ohne generierte Formen (`formenStatus=basis`) und ohne Übersetzung rendern fehlerfrei.
- Lemma, Formen und Beispielsätze sind per TTS (de-DE) anhörbar.
- Favoriten togglen sofort (optimistic) und überleben App-Neustart.
- Listen mit 3.000+ Einträgen scrollen flüssig (FlashList, keine spürbaren Hänger auf Mittelklasse-Android).
- Zweiter App-Start ohne Netz: zuletzt geladene Kapitel/Cards sichtbar (Query-Persist).

## Ergebnisartefakte

Paradigma-Komponentenbibliothek · Daten-Hooks · Kapitel-/Card-Screens · `useTts` · i18n-Namespace `grammar` (de/tr).
