# Phase 2 — Datenmodell & Import

Ziel: Vollständiges Amplify-Datenschema (inkl. strukturierter Formen) deployt in der Sandbox; Import-Skript überführt `wortliste_b1_struktur.json` + die generierten Formen idempotent in DynamoDB. Richtwert: 2–3 Tage.

Referenz: [Masterplan](00-masterplan.md) §4; Alt-Plan v1 §6.3, §11 (Import-Anforderungen gelten weiter).

---

## 1. Datenschema implementieren (`amplify/data/resource.ts`)

- [ ] Enums anlegen: `FormKategorie`, `Kasus`, `Numerus`, `Tempus`, `Modus`, `GenusVerbi`, `Anrede`, `Grad`, `Wortart`, `VocabularyStatus`, `ChapterType`, `SessionType`, `Rating` — Werte ohne Umlaute (`praeposition`, nicht `präposition`); Wortart-Normalisierungstabelle im Import
- [ ] Content-Modelle: `ContentVersion`, `Chapter`, `VocabularyEntry` (v1-Felder + neue Felder aus Masterplan §4.2), `VocabularyForm` (strukturiert, §4.1), `VocabularyExample`, `VocabularyChapter`
- [ ] User-Modelle: `UserVocabularyProgress`, `LearningSession`, `LearningSessionItem`, `UserFavoriteVocabulary` — alle `allow.owner()`
- [ ] Sekundärindizes gemäß Masterplan §4.3 (`listFormsByEntry`, `listExamplesByEntry`, Kapitel-Zuordnungen, `normalizedLemma`)
- [ ] Autorisierung: Default `userPool`; Content-Modelle `allow.authenticated().to(['read'])` + `allow.group('admin')`
- [ ] Cognito-Gruppe `admin` in `amplify/auth/resource.ts` (`groups: ['admin']`); einen Import-Nutzer anlegen und der Gruppe zuordnen
- [ ] `npx ampx sandbox` — Schema deployt fehlerfrei; `ampx generate outputs/graphql-client-code` geprüft

## 2. Eingangsdaten analysieren & fixieren

- [ ] Generator-Output liegt vor: `formen[] = {form, merkmal: String, tr}` mit **96 distinkten Merkmal-Strings** (54.852 Formen, inkl. Plusquamperfekt, Futur I/II, Konjunktiv I/II, Passiv, Partizip I/II, zu-Infinitiv, Infinitiv Perfekt) → **Merkmal-Parser ist Pflichtpfad**: vollständige Tabelle String → {kategorie, tempus, modus, genusVerbi, person, numerus, kasus, grad, anrede}; alle 96 Werte müssen gemappt sein
- [ ] Ableitungsregeln für neue Entry-Felder: `steigerbar=false`, wenn Adjektiv keine Steigerungsformen hat (~52 Fälle); `unzaehlbar=true`, wenn Nomen `plural=null` und nicht nur-Plural (~255 Fälle); `formenStatus` aus Umfang des Formen-Arrays ableiten
- [ ] Mapping-Tabelle als Code + Doku (`scripts/import/merkmal-map.ts`); unbekannte Merkmale landen im Report, brechen den Import aber nicht ab (Form dann `kategorie=sonstige`, `merkmalText` erhalten)
- [ ] Zod-Schemas für die JSON-Eingabe (`eintraege`, `formen`, `beispiele`, `wortgruppen`, Metadata) — Validierungsfehler mit Pfadangabe sammeln

## 3. Import-Skript (`scripts/import/`)

Aufbau (Node/TS, läuft mit `tsx`):

```txt
import.ts            # CLI: --file --version --dry-run --only entries|forms|examples|chapters
├─ validate.ts       # zod-Validierung, Fehlerliste
├─ transform.ts      # JSON → Modell-Objekte (inkl. merkmal-map, stabile IDs)
├─ chapters.ts       # Wortgruppen → Chapter(wordGroup) + Auto-Kapitel à 50 → Chapter(auto)
├─ write.ts          # Amplify Data Client, Batching, Retry, Upsert
└─ report.ts         # Zähler, Fehler, unbekannte Merkmale, Dauer
```

- [ ] **Auth:** Skript meldet sich als admin-Nutzer an (`signIn` via aws-amplify in Node) und nutzt `generateClient<Schema>()` mit `amplify_outputs.json`
- [ ] **Stabile IDs** (v1 §11.4): `vocab_<slug(lemma)>_<wortart>` + Disambiguierung; Formen: `<entryId>_form_<kategorie>_<merkmal-slug>`; Beispiele: Hash über `entryId + textDe`
- [ ] **Idempotenz:** Upsert per deterministischer `id` (create → bei Konflikt update); zweiter Lauf erzeugt 0 Duplikate
- [ ] **Wortgruppen:** je Gruppe ein `Chapter(type=wordGroup)`. Achtung, **10 unterschiedliche Mitglieder-Strukturen** (u. a. `abkuerzung/bedeutung`, `symbol/wort`, `bezeichnung/note`, nur `de/tr`; „Zahlen, Bruchzahlen" mit verschachtelten `art`/`eintraege`-Untergruppen; 265 vollwertige Mitglieder mit eigenen Formen (490) und Beispielen) → gruppenspezifische zod-Adapter in `transform.ts`; Mitglieder mit Lemma per `normalizedLemma` auf bestehende Einträge matchen, sonst eigenen `VocabularyEntry` anlegen und verknüpfen
- [ ] **Auto-Kapitel:** „Vokabeln 001–050" … über alphabetische Reihenfolge (~61 Kapitel)
- [ ] **Sortierung:** `sortOrder` der Formen folgt der Paradigma-Reihenfolge aus Masterplan §5 (Kernformen zuerst)
- [ ] **Durchsatz:** sequenziell mit kleiner Parallelität (~5–10 gleichzeitige Mutationen), Retry mit Backoff bei Throttling; ~67k Mutationen ≈ 10–20 min, Kosten vernachlässigbar (< 0,30 $)
- [ ] **Dry-Run:** vollständige Validierung + Transformation + Report ohne Schreibzugriffe
- [ ] **Report** (Konsole + `import-report.json`): Zähler je Modell (created/updated/skipped/errors), unbekannte Merkmale, fehlende Übersetzungen, Dauer

## 4. Verifikation

- [ ] Zähler gegen Quelldaten: 3.026 Einträge (+ Wortgruppen-Mitglieder), Formen 54.852 (+490 aus Wortgruppen-Mitgliedern), Beispiele ~5.540, Kapitel (21 Wortgruppen + ~61 Auto)
- [ ] Stichproben-Queries mit Test-Nutzer (nicht admin): `listFormsByEntry` für 1 Nomen, 1 trennbares Verb (Perfekt mit „ist", Passiv- und Konjunktivformen korrekt kategorisiert), 1 Adjektiv, 1 Präposition — Felder korrekt strukturiert
- [ ] Negativtest: normaler Nutzer kann Content nicht schreiben; anonym kann nichts lesen
- [ ] Import 2× ausführen → identische Zähler, keine Duplikate (Akzeptanz v1 §16)
- [ ] `formenStatus` der Einträge korrekt (`vollstaendig` nur bei generierten Paradigmen)

---

## Akzeptanzkriterien

- Schema deployt; alle Modelle, Enums, Indizes und Auth-Regeln wie Masterplan §4.
- Import läuft mit einem Befehl (`pnpm import:data -- --file data/wortliste_b1_struktur.json --version 2026-07-XX`), ist idempotent und liefert einen vollständigen Report.
- Dry-Run funktioniert; unbekannte Merkmale werden gemeldet statt verworfen.
- Alle Zähler stimmen mit den Quelldaten überein; Stichproben je Wortart korrekt.
- Nutzerisolierung und Read-only-Content per Negativtest belegt.

## Ergebnisartefakte

`amplify/data/resource.ts` (Vollschema) · `scripts/import/` · `merkmal-map.ts` + Doku · `import-report.json` · befüllte Sandbox-Datenbank.
