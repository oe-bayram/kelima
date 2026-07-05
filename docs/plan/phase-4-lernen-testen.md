# Phase 4 — Lernen & Testen: Sessions, Bewertung, Wiederholung

Ziel: Kompletter Lern-/Test-Zyklus — Lernsession mit Hide/Reveal, Testsession mit Prüferansicht, Bewertung aktualisiert Status + `dueAt`, Problemwörter-Sessions, Offline-Outbox für Bewertungen. Richtwert: 3–4 Tage.

Referenz: [Masterplan](00-masterplan.md) §7; Alt-Plan v1 §6.7–6.13, §13 (Status-, Fälligkeits- und Statistiklogik gelten unverändert). Bewertungen schreiben append-only (`LearningSessionItem`) + upsert `UserVocabularyProgress`; Statistiken werden clientseitig aus der gecachten ProgressMap gerechnet.

## Aufgelöste Entscheidungen

1. **Schema wird erweitert** (Redeploy nötig) — die granularen Progress-Zähler kommen ins Modell (statt sie nur abzuleiten).
2. **Start-Dialog = `@gorhom/bottom-sheet`** (bereits Dependency; `GestureHandlerRootView`/Reanimated-Voraussetzungen vorhanden).
3. Card-Sektionen werden aus `vocab/[id].tsx` **extrahiert** und in Lern-/Test-Screens wiederverwendet (eine Quelle der Wahrheit).
4. Session-Screens liegen **auf Root-Ebene** (`src/app/session/*`), unter dem Auth-Guard registriert → Vollbild ohne Tab-Bar.

---

## 0. Backend: Schema-Erweiterung (Vorbedingung)

Datei: `amplify/data/resource.ts` → `UserVocabularyProgress` erweitern. Die User-Modelle sind bisher **ungenutzt** (keine Produktionsdaten), daher kann das Modell frei final gestaltet werden.

Zielshape `UserVocabularyProgress`:

```ts
entryId: a.id().required(),
status: a.ref('VocabularyStatus'),
dueAt: a.datetime(),
intervalDays: a.integer(),
// Zähler
seenCount: a.integer(),      // NEU – in Lernsessions gezeigt/bewertet
testCount: a.integer(),      // NEU – in Testsessions beantwortet
correctCount: a.integer(),   // kann_ich | sicher
wrongCount: a.integer(),     // NEU – nicht_gewusst
hardCount: a.integer(),      // NEU – schwer
// Zeitstempel
lastSeenAt: a.datetime(),    // NEU – letzte Lernsession
lastTestedAt: a.datetime(),  // NEU – letzte Testsession
lastRatingAt: a.datetime(),  // NEU – letzte Bewertung (beliebig)
lastRating: a.ref('Rating'),
```

Entfällt: `reviewCount`, `lapseCount`, `lastReviewedAt` (durch granulare Felder ersetzt). Sekundärindex `listProgressByEntry` und `allow.owner()` bleiben.

- [ ] Modell anpassen; `LearningSession` / `LearningSessionItem` / `UserFavoriteVocabulary` bleiben unverändert.
- [ ] `npx ampx sandbox` (bzw. laufende Sandbox) → regeneriert `amplify_outputs.json` und den `Schema`-Typ. `ProgressRow` in `src/lib/dataClient.ts` aktualisiert sich automatisch; `tsc` fängt veraltete Zugriffe.

---

## 1. Pure Session-Logik (`src/features/session/sessionLogic.ts`)

Reine Funktionen, **keine** RN/Amplify-Imports (Jest-testbar, Muster wie `src/components/vocab/paradigm/grouping.ts` + `src/lib/vocab.ts`). Enums aus `@/lib/enums` (`Rating`, `VocabularyStatus`, `SessionType`).

- [ ] `ratingToStatus(rating): VocabularyStatus` — Identitäts-Mapping (`nicht_gewusst→nicht_gewusst`, `schwer→schwer`, `kann_ich→kann_ich`, `sicher→sicher`). Kapselt v1 §13.2.
- [ ] `DUE_INTERVALS: Record<Rating, number>` (Tage): `nicht_gewusst: 0, schwer: 1, kann_ich: 3, sicher: 7`.
- [ ] `computeDueAt(rating, now): string` — ISO-String; `nicht_gewusst` → sofort (now).
- [ ] `wrongRate(p): number` — `(wrongCount + hardCount) / max(1, seenCount + testCount)`.
- [ ] `isProblemWord(p, now): boolean` (v1 §13.3) — `status ∈ {nicht_gewusst, schwer}` ∨ `wrongRate(p) ≥ 0.4` ∨ `isDue(p, now)` (nutzt vorhandenes `isDue` aus `@/lib/vocab`).
- [ ] `applyRating(prev, rating, type, now): ProgressRow` — reiner Reducer, der das neue Progress-Objekt berechnet (Zähler++, `status`, `dueAt`, `intervalDays`, Zeitstempel). Wird von der Mutation **und** vom Optimistic-Update genutzt.
- [ ] `buildQueue(candidateIds, limit, seed?): string[]` — Fisher-Yates-Shuffle + Begrenzung auf 10/20/50/alle.
- [ ] `selectCandidates(source, { memberships, progress, favorites }, now): string[]` — löst Quelle in entryId-Liste auf: Kapitel (`memberships.byChapter`), Favoriten (`favorites.ids`), Problemwörter (`isProblemWord`), fällig (`isDue`), Status-Filter (`statusOf`).

Lokales `ProgressLike`-Interface in der Datei (nur die genutzten Felder), damit die Logik ohne Amplify-Typen testbar bleibt; `ProgressRow` ist strukturell kompatibel.

## 2. Session-Store (`src/features/session/useSessionStore.ts`)

Zustand v5 + MMKV-Persistenz — **exakt** nach Muster `src/features/settings/useSettingsStore.ts` (`create()(persist(...))`, `StateStorage`-Adapter über `storage` aus `@/lib/storage`, `createJSONStorage`, `name: 'kelima-session'`, `version: 1`).

- [ ] State: `{ sessionId, type: SessionType, source, sourceLabel, queue: string[], index, ratings: Record<string, Rating>, startedAt, active }`.
- [ ] Actions: `start(config)`, `rate(entryId, rating)` (index++, ratings speichern), `finish()`, `reset()`.
- [ ] Alle Werte JSON-safe (Arrays/Records, keine Map/Set) → keine Sonderbehandlung im Persister nötig.
- [ ] Resume: liegt beim App-Start ein `active`-State mit `index < queue.length` vor, bieten Learn/Test-Screen Wiedereinstieg (bereits bewertete Karten sind serverseitig geschrieben).

## 3. Bewertungs-Pipeline (`src/features/session/useRateVocab.ts` + `ids.ts`)

Mutation nach dem **Optimistic-Muster von `useToggleFavorite`** (`src/hooks/userData.ts`): `onMutate` (cancelQueries `queryKeys.progress` → Snapshot → `setQueryData` via `applyRating`) → `onError` Rollback → `onSettled` invalidate.

- [ ] `src/features/session/ids.ts`: deterministische IDs für Idempotenz (userId aus `getCurrentUser()`):
  - Progress: `prog_${userId}_${entryId}` (globaler PK inkl. userId gegen Cross-User-Kollision).
  - Session: `sess_${userId}_${startedAtEpoch}` (einmal bei Start).
  - Item: `item_${sessionId}_${entryId}_${answeredAtEpoch}`.
- [ ] `useRateVocab()` führt aus:
  1. `LearningSessionItem` create (deterministische ID, `clientTimestamp`, `shownAt`/`answeredAt`).
  2. `UserVocabularyProgress` **upsert** (create-mit-ID; bei Konflikt → update — Muster wie `scripts/import/write.ts upsertRow`). Werte aus `applyRating`.
  3. Optimistic Update der ProgressMap im Query-Cache (`applyRating`).
- [ ] Session-Lifecycle (Teil des Stores oder eigener Hook): `LearningSession` bei Start create, bei Ende update (`endedAt`, `totalCount`, `correctCount`).
- [ ] Zähler-Semantik: `seenCount++` (learn) bzw. `testCount++` (test); `correctCount++` (kann_ich|sicher), `wrongCount++` (nicht_gewusst), `hardCount++` (schwer); `lastSeenAt`/`lastTestedAt`/`lastRatingAt`, `lastRating`, `status`, `dueAt`, `intervalDays`.
- [ ] Optional (Could-have): `sicher` erst nach 2 konsekutiven korrekten Bewertungen (über `intervalDays`/Streak in `applyRating`).

## 4. Offline-Outbox (`src/features/session/outbox.ts` + netinfo-Bridge)

Greenfield (netinfo installiert, aber ungenutzt).

- [ ] `src/lib/onlineManager.ts`: `@react-native-community/netinfo` → TanStack `onlineManager.setEventListener` bridgen; in `src/app/_layout.tsx` initialisieren.
- [ ] Outbox-Store (zustand + MMKV, `name: 'kelima-outbox'`): Queue typisierter Write-Ops (`{ id, kind: 'item'|'progress'|'session', payload }`).
- [ ] Bei Mutations-Fehler offline → Op in Outbox legen (Optimistic-Update bleibt sichtbar, kein Rollback).
- [ ] Replay: bei `onlineManager`-Wechsel auf online → Queue der Reihe nach idempotent nachspielen (deterministische IDs verhindern Duplikate); erfolgreiche Ops entfernen.
- [ ] Badge „n Bewertungen ausstehend" in `src/app/(app)/settings.tsx` (Queue-Länge).

## 5. Card-Refactor für Hide/Reveal

- [ ] Aus `src/app/(app)/vocab/[id].tsx` die lokalen `OverviewTab`/`ExamplesTab`/`GrammarTab` (+`GrammarField`) in exportierte Module `src/components/vocab/OverviewSection.tsx`, `ExamplesSection.tsx`, `GrammarSection.tsx` extrahieren; `vocab/[id].tsx` importiert sie (Verhalten unverändert). `FormsTab` ist bereits wiederverwendbar.
- [ ] `src/components/session/RevealSection.tsx`: verbirgt Kinder hinter „Anzeigen"-Button; Karten-Header mit „Alles anzeigen"; Auto-Reset bei Kartenwechsel (via `key={entryId}`). TTS bleibt immer sichtbar.
- [ ] `src/components/session/SessionCard.tsx`: Header (Lemma, Genus-Farbe, TTS, Status-Badge) + gestapelte `RevealSection`(Übersetzung, Formen [`FormsTab`], Beispiele [`ExamplesSection`], Grammatik [`GrammarSection`]). Lädt Formen/Beispiele via `useForms`/`useExamples` + `QueryBoundary`.

## 6. Start-Dialog (`src/components/session/StartSheet.tsx`, @gorhom/bottom-sheet)

- [ ] `BottomSheetModalProvider` in `src/app/_layout.tsx` einhängen (unter `GestureHandlerRootView`).
- [ ] `StartSheet`: Quelle (Kapitel/Filter/Favoriten/Problemwörter/fällig), Status-Filter (`Segmented`), Anzahl (10/20/50/alle als Pills), Buttons „Lernen"/„Testen" → `useSessionStore.start(...)` + `router.push('/session/learn' | '/session/test')`.
- [ ] Von Dashboard, Kapitel-Detail und (später) Statistik aufrufbar; Quelle/Filter vorbelegbar.

## 7. Session-Screens + Routing

- [ ] `src/app/session/learn.tsx`: `SessionProgress` (Karte x/y + `Progress`-Balken) + `SessionCard` (`key={entryId}`) + `RatingBar` (Nicht gewusst | Schwer | Kann ich | Sicher, Farben `STATUS_HEX`/`STATUS_BG_CLASS`) → `rate()` + `useRateVocab` → nächste Karte; Ende → `session/summary`.
- [ ] `src/app/session/test.tsx`: große Frageansicht (nur Lemma + optional Wortart/TTS) → „Antwort anzeigen" enthüllt Übersetzung/Kernformen/1–2 Beispiele/Grammatik → gleiche `RatingBar` (`testCount++`) → „Nächstes Wort".
- [ ] `src/app/session/summary.tsx`: Zähler je Bewertung, Dauer, Liste „Nicht gewusst"/„Schwer" (antippbar → `/vocab/[id]`), Button „Problemwörter jetzt wiederholen" (startet Folgesession aus den schwachen Wörtern). Liest aus `useSessionStore`.
- [ ] `src/components/session/RatingBar.tsx`, `SessionProgress.tsx`.
- [ ] Routing: Session-Screens in `src/app/_layout.tsx` unter `<Stack.Protected guard={isAuthenticated}>` als Geschwister zu `(app)` registrieren (Vollbild ohne Tab-Bar), z. B. `presentation: 'fullScreenModal'`.

## 8. Dashboard & Kapitel-Detail verdrahten

- [ ] `src/app/(app)/index.tsx`: „Weiterlernen" (fällige Wörter), „Testsession starten", „Schwierige Vokabeln lernen", „Favoriten lernen" → `StartSheet` mit vorbelegter Quelle; Kachel „heute fällig: n" (aus ProgressMap via `isDue`).
- [ ] `src/app/(app)/chapters/[id].tsx`: die bereits gestubbte Session-Bar (aktuell `disabled`) aktivieren → `StartSheet` mit Quelle = dieses Kapitel + aktueller Filter.

## 9. i18n

- [ ] Keys unter erweitertem `session`-Block (Titel, Bewertungslabels, „Anzeigen"/„Alles anzeigen"/„Antwort anzeigen", Anzahl-Optionen, Quellen, Summary, Outbox-Badge) in `src/lib/i18n/de/common.json` **und** `tr/common.json`. Vorhandene `session.learn/test/problemWords` und `dashboard.*` wiederverwenden. Getypte Keys via `TranslationKey` (`ParseKeys<'common'>`).

## 10. Tests (`tests/session-logic-test.ts`)

- [ ] Reine Logik testen (`@jest/globals`, Fixtures wie `tests/paradigm-grouping-test.ts`): `ratingToStatus`, `computeDueAt`/`DUE_INTERVALS`, `wrongRate`, `isProblemWord` (v1 §13.3), `applyRating` (Zähler/Status/dueAt-Übergänge), `buildQueue` (Länge/Determinismus mit Seed), `selectCandidates`.

---

## Zu ändernde / neue Dateien (Überblick)

**Neu:** `src/features/session/{sessionLogic,useSessionStore,useRateVocab,ids,outbox}.ts` · `src/lib/onlineManager.ts` · `src/components/session/{StartSheet,SessionCard,RevealSection,RatingBar,SessionProgress}.tsx` · `src/components/vocab/{OverviewSection,ExamplesSection,GrammarSection}.tsx` · `src/app/session/{learn,test,summary}.tsx` · `tests/session-logic-test.ts`.

**Ändern:** `amplify/data/resource.ts` · `src/app/_layout.tsx` · `src/app/(app)/{index,settings}.tsx` · `src/app/(app)/chapters/[id].tsx` · `src/app/(app)/vocab/[id].tsx` · `src/lib/queryKeys.ts` · `src/lib/dataClient.ts` (Row-Typen) · `src/lib/i18n/de|tr/common.json`.

## Wiederverwendung (existiert bereits)

- Optimistic-Mutation: `useToggleFavorite` (`src/hooks/userData.ts`); Upsert-mit-Konflikt: `scripts/import/write.ts`.
- Daten: `useProgressMap`, `useFavorites`, `useChapterMemberships`, `useChapterEntries`, `useForms`, `useExamples`; `listAll`/`dataClient`/Row-Typen (`src/lib/dataClient.ts`).
- Logik: `statusOf`, `isDue`, `isLearned`, `STATUS_ORDER/HEX/BG_CLASS` (`src/lib/vocab.ts`); Enums (`src/lib/enums.ts`).
- UI: `Button, Text, Screen, Card, Badge, Progress, Segmented, Accordion, QueryBoundary, Skeleton, Input`; `useTts`; Store-Muster `useSettingsStore`; Persister-Map/Set-Handling (`src/lib/queryClient.ts`).

---

## Akzeptanzkriterien

- Lernsession: Quelle + Anzahl wählbar; Hide/Reveal je Abschnitt; Bewertung speichert Progress + SessionItem und setzt `dueAt` nach Intervall-Tabelle.
- Testsession: Antwort bleibt bis „Antwort anzeigen" verborgen; Prüferbewertung fließt in Status und Statistik (`testCount++`, Akzeptanz v1 §16 „Testen").
- Problemwörter- und Fällig-Sessions liefern genau die Wörter nach v1-§13.3-Kriterien.
- Abbruch-Test: App während Session beenden → Wiedereinstieg ohne Datenverlust (bereits bewertete Karten gespeichert).
- Offline-Test: Flugmodus, 5 Bewertungen, online gehen → alle 5 synchronisiert, keine Duplikate; Zweitgerät-Test: Bewertung auf Gerät A nach Refresh auf Gerät B sichtbar.
- Session-Zusammenfassung korrekt; „schwache Wörter wiederholen" startet Folgesession.

## Verifikation

- `pnpm exec tsc --noEmit`, `pnpm exec eslint ...`, `pnpm run test:ci` grün (inkl. neuer Logik-Tests).
- `npx ampx sandbox` deployt das erweiterte Schema; `amplify_outputs.json` aktuell.
- Runtime (Metro-Reload): Lernsession Kapitel → 10 Wörter durchbewerten → Status/`dueAt` in ProgressMap; Dashboard „fällig" aktualisiert.
- Testsession: Antwort verborgen bis Reveal; Bewertung erhöht `testCount`.
- Abbruch/Resume und Offline-Replay (Flugmodus → 5 Bewertungen → online) manuell prüfen (§ Akzeptanzkriterien).

## Ergebnisartefakte

Erweitertes Schema · Session-Engine + Store · Bewertungs-Pipeline mit Outbox · Learn-/Test-/Summary-Screens · Start-Dialog (Bottom Sheet) · aktiviertes Dashboard/Kapitel-Detail · Logik-Unit-Tests.
