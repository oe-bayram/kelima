# Maestro E2E-Flows

Starter-Flows für die manuelle/lokale E2E-Abnahme (kostenlos, ohne Cloud).

## Voraussetzungen

- [Maestro](https://maestro.mobile.dev/) installiert (`curl -fsSL https://get.maestro.mobile.dev | bash`).
- Laufender Android-Emulator oder angestecktes Gerät mit installiertem Dev-/Release-Build der App (`appId: com.anonymous.kelima` — bei Umbenennung des Pakets hier anpassen).
- **Testkonto** in Cognito mit importierten Inhalten: mindestens ein Kapitel, das Wörter enthält.

## Ausführen

```bash
# Einzelner Flow (mit Zugangsdaten):
maestro test .maestro/login.yaml -e EMAIL=du@example.com -e PASSWORD=deinPasswort

# Ganze Suite:
maestro test .maestro -e EMAIL=du@example.com -e PASSWORD=deinPasswort
```

## Flows

| Datei | Prüft |
|---|---|
| `login.yaml` | Anmeldung (E-Mail/Passwort) → Tab-Leiste sichtbar. Baustein für die anderen Flows. |
| `kapitel-oeffnen-card-formen.yaml` | Kapitel → erste Vokabel → Formen-Tab |
| `lernsession-bewerten.yaml` | Lernsession starten, aufdecken, bewerten |
| `testsession.yaml` | Testsession: Antwort verborgen → anzeigen → bewerten |
| `offline-bewertung-sync.yaml` | Offline bewerten → Outbox-Badge → online → synchronisieren |

## Hinweise

- Selektoren nutzen die **deutschen** Labels (Default-Sprache) plus `testID`s
  (`auth-submit`, `chapter-row`, `entry-row`) für eindeutige/dynamische Elemente.
- Der **Flugmodus** wird in `offline-bewertung-sync.yaml` nicht von Maestro
  geschaltet — nutze die auskommentierten `adb`-Befehle oder das Gerät manuell.
- Assertions mit Zähl-/Datenbezug (z. B. Anzahl Karten) hängen vom Testkonto ab;
  passe sie bei Bedarf an deine Seed-Daten an.
