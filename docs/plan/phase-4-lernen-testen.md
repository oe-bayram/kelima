# Phase 4 — Lernen & Testen: Sessions, Bewertung, Wiederholung

Ziel: Kompletter Lern-/Test-Zyklus — Lernsession mit Hide/Reveal, Testsession mit Prüfer, Bewertung aktualisiert Status + `dueAt`, Problemwörter-Sessions, Offline-Outbox für Bewertungen. Richtwert: 3–4 Tage.

Referenz: [Masterplan](00-masterplan.md) §7; Alt-Plan v1 §6.7–6.13, §13 (Status-, Fälligkeits- und Statistiklogik gelten unverändert).

---

## 1. Session-Engine (`src/features/session/`)

- [ ] Zustand-Store `useSessionStore`: `{ type: 'learn'|'test', quelle (Kapitel/Filter/Favoriten/Problemwörter/fällig), queue: entryId[], index, ratings, startedAt }`
- [ ] Session-Aufbau: Kandidaten aus gecachten Daten (Kapitel-Einträge × ProgressMap-Filter), mischen, auf gewählte Anzahl (10/20/50/alle) begrenzen
- [ ] Problemwort-Auswahl nach v1 §13.3: `status ∈ {unknown, hard}` ∨ `wrongRate ≥ 0.4` ∨ `dueAt ≤ now`
- [ ] Persistenz: laufende Session in MMKV — App-Abbruch verliert höchstens die aktuelle Karte
- [ ] Start-Dialog (Bottom Sheet): Quelle, Filter, Anzahl → von Dashboard, Kapitel-Detail und Statistik aufrufbar

## 2. Bewertungs-Pipeline

- [ ] `useRateVocab(entryId, rating, sessionId)` führt aus:
  1. `LearningSessionItem` erzeugen (append-only, Client-Zeitstempel)
  2. `UserVocabularyProgress` upsert: Zähler (`seenCount`, `testCount` bei Testsession, `correctCount`/`wrongCount`/`hardCount`), `status` (Mapping v1 §13.2), `lastSeenAt`/`lastTestedAt`/`lastRatingAt`, **`dueAt`** (nicht gewusst→sofort, schwer→+1 Tag, kann ich→+3 Tage, sicher→+7 Tage)
  3. Optimistic Update der ProgressMap im Query-Cache
- [ ] **Outbox:** schlägt eine Mutation offline fehl → Item in MMKV-Queue; netinfo-Listener spielt bei Reconnect idempotent nach (deterministische IDs aus Phase 2 verhindern Duplikate); Badge „n Bewertungen ausstehend" in Einstellungen
- [ ] Optional (Could-have): `secure` erst nach 2 aufeinanderfolgenden korrekten Bewertungen

## 3. Lernsession (`session/learn.tsx`)

- [ ] Fortschrittsanzeige (Karte x/y, Balken), aktuelle Card eingebettet (Komponenten aus Phase 3, kompakter Modus)
- [ ] **Hide/Reveal:** Standard verdeckt: Übersetzung, Formen, Beispiele, Grammatik — je Abschnitt „Anzeigen"-Button + „Alles anzeigen"; Auto-Verdecken bei Kartenwechsel; TTS bleibt immer verfügbar
- [ ] Bewertungsleiste: Nicht gewusst | Schwer | Kann ich | Sicher (Farben = Status-Tokens); danach automatisch nächste Karte
- [ ] Session-Ende → `LearningSession` finalisieren (Zähler, `endedAt`) → `session/summary`

## 4. Testsession (`session/test.tsx`)

- [ ] Frageansicht: nur Lemma (+ optional Wortart, TTS) — Prüfer-tauglich groß
- [ ] „Antwort anzeigen" → Übersetzung, Kernformen, 1–2 Beispiele, Grammatik-Badges
- [ ] Prüfer bewertet (gleiche Pipeline, `testCount++`); „Nächstes Wort"
- [ ] Quellen: Kapitel, Favoriten, Problemwörter, fällige Wörter

## 5. Session-Zusammenfassung (`session/summary.tsx`)

- [ ] Zähler je Bewertung, Dauer, Liste der „Nicht gewusst"/„Schwer"-Wörter (antippbar → Card)
- [ ] Empfohlene Aktion: „Problemwörter jetzt wiederholen" (startet direkt neue Session mit den schwachen Wörtern)

## 6. Dashboard aktivieren

- [ ] „Weiterlernen" (letztes Kapitel/fällige Wörter), „Testsession starten", „Schwierige Vokabeln lernen", „Favoriten lernen" mit echten Daten verdrahten; Kachel „heute fällig: n"

---

## Akzeptanzkriterien

- Lernsession: Quelle + Anzahl wählbar; Hide/Reveal je Abschnitt; Bewertung speichert Progress + SessionItem und setzt `dueAt` nach Regel-Tabelle.
- Testsession: Antwort bleibt bis „Antwort anzeigen" verborgen; Prüferbewertung fließt in Status und Statistik (Akzeptanz v1 §16 „Testen").
- Problemwörter- und Fällig-Sessions liefern genau die Wörter nach v1-§13.3-Kriterien.
- Abbruch-Test: App während Session beenden → Wiedereinstieg ohne Datenverlust (bereits bewertete Karten gespeichert).
- Offline-Test: Flugmodus, 5 Bewertungen, online gehen → alle 5 synchronisiert, keine Duplikate; Zweitgerät-Test: Bewertung auf Gerät A nach Refresh auf Gerät B sichtbar.
- Session-Zusammenfassung korrekt; „schwache Wörter wiederholen" startet Folgesession.

## Ergebnisartefakte

Session-Engine + Stores · Bewertungs-Pipeline mit Outbox · Learn-/Test-/Summary-Screens · aktiviertes Dashboard.
