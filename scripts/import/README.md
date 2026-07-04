# Import-Skript (Phase 2)

Überführt `data/wortliste_b1_struktur.json` (3.026 Einträge, 54.852 Formen, 5.540 Beispiele,
21 Wortgruppen) **idempotent** in die Amplify-/DynamoDB-Sandbox.

## Voraussetzungen (einmalig)

1. Backend deployen — erzeugt `amplify_outputs.json` und die Cognito-Gruppe `admin`:
   ```bash
   npx ampx sandbox
   ```
2. Admin-Nutzer anlegen und der Gruppe zuordnen (Pool-ID steht in `amplify_outputs.json`
   unter `auth.user_pool_id`):
   - Registrieren/bestätigen über die App (Authenticator) **oder**:
     ```bash
     aws cognito-idp admin-create-user --user-pool-id <POOL_ID> --username admin@example.com
     aws cognito-idp admin-set-user-password --user-pool-id <POOL_ID> --username admin@example.com --password '<PW>' --permanent
     ```
   - Der Gruppe `admin` zuordnen:
     ```bash
     aws cognito-idp admin-add-user-to-group --user-pool-id <POOL_ID> --username admin@example.com --group-name admin
     ```
3. Für die Negativtests zusätzlich einen **Nicht-Admin**-Testnutzer anlegen (nicht in `admin`).

## Ausführen

```bash
# Trockenlauf (offline): validiert, transformiert, zählt, meldet unbekannte Merkmale –
# schreibt NICHTS und braucht weder AWS noch Login.
pnpm import -- --dry-run

# Echter Import (braucht amplify_outputs.json + Admin-Login via Env-Vars):
KELIMA_ADMIN_EMAIL=admin@example.com KELIMA_ADMIN_PASSWORD='<PW>' \
  pnpm import -- --file data/wortliste_b1_struktur.json --version 2026-07-04

# Nur einzelne Modelle schreiben:
pnpm import -- --only forms
pnpm import -- --only entries,examples
```

Auf Windows/PowerShell die Env-Vars vorher setzen:
```powershell
$env:KELIMA_ADMIN_EMAIL="admin@example.com"; $env:KELIMA_ADMIN_PASSWORD="<PW>"; pnpm import -- --version 2026-07-04
```

### CLI-Flags
- `--file <pfad>` — Quelldatei (Default `data/wortliste_b1_struktur.json`)
- `--version <label>` — Versions-Tag (z. B. Datum) → `ContentVersion`
- `--dry-run` — nur Validierung/Transformation/Report, keine Schreibzugriffe (offline)
- `--only entries|forms|examples|chapters` — Teilmengen (komma-separiert)

## Eigenschaften
- **Idempotent:** deterministische IDs (`vocab_<slug>_<wortart>`, `<entryId>_form_…`, `<chapterId>__<entryId>`);
  vor dem Schreiben werden vorhandene IDs gelesen → create/update; 2. Lauf erzeugt 0 Duplikate.
- **Merkmal-Parser:** alle 96 Merkmal-Strings → strukturierte Felder (`scripts/import/merkmal-map.ts`);
  unbekannte landen als `kategorie=sonstige` im Report, brechen den Import nicht ab.
- **Wortgruppen vereinheitlicht:** jedes Mitglied wird ein `VocabularyEntry` (per `normalizedLemma`
  gematcht oder neu angelegt, `source=wortgruppe`), verknüpft über `VocabularyChapter`.
- **Report:** Konsole + `import-report.json` (Zähler je Modell, unbekannte Merkmale, fehlende
  Übersetzungen, Dauer).

## Dateien
`import.ts` (CLI) · `validate.ts` (zod) · `transform.ts` (Einträge→Rows) · `chapters.ts`
(Wortgruppen + Auto-Kapitel) · `merkmal-map.ts` (Merkmal→Struktur) · `write.ts` (Amplify-Client,
Upsert/Retry) · `report.ts` · `types.ts` · `util.ts`.

Typecheck: `pnpm typecheck:scripts`.
