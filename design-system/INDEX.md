# Design-System — lokaler Spiegel (Kelima)

Lokale Kopie des claude.ai/design-Projekts **„Kelima — B1 Vokabeltrainer Design System"**
(`bca96c9e-b6ed-4e38-be3f-83e80182d3db`). Ab jetzt ist dieser Ordner die Quelle der
Wahrheit für das App-Design — das Design-Projekt muss nicht mehr geöffnet werden.

## Inhalt
```
design-system/
├─ DESIGN.md            ← Design-Prinzipien (Farbe, Typo, Spacing, Ton, Icons)
├─ TOKENS.md            ← kompakte Token-Referenz zum Nachschlagen
├─ SKILL.md             ← Skill-Header (Kurzfakten)
├─ styles.css           ← Einstiegspunkt, @importiert alle Tokens
├─ tokens/              ← die einzige Wertequelle
│  ├─ colors.css        ← Primär (Ozean-Blau), Neutrals (kühl/Ice), Status (5), Marken-Verlauf, + Dark-Theme
│  ├─ typography.css    ← Schibsted/Hanken/JetBrains, Type-Scale, semantische Rollen
│  ├─ spacing.css radii.css shadows.css fonts.css base.css
├─ assets/              ← logo.svg (Kelima-Logo, Ozean-Verlauf; icon.png liegt im Design-Projekt)
├─ components/          ← Referenz-Implementierungen (Web-React) + Specs
│  ├─ core/    Badge, Button, Card, Icon, IconButton
│  ├─ forms/   Input, PasswordInput*, CodeInput*, SegmentedControl
│  ├─ feedback/StatusBadge, StatusMeter, ProgressBar
│  └─ vocab/   RatingButtons
└─ ui_kits/app/
   └─ screens-auth.jsx  ← der volle Auth-Flow als Referenz (5 Modi)
```
`*` = neu ergänzt (Auth-Flow): 6-stellige Code-Eingabe & Passwortfeld mit Anzeigen-Toggle.

## Bewusst NICHT gespiegelt (schlanke Referenz, keine Build-Artefakte)
- `_ds_bundle.js` (kompilierter Web-Bundle) und die HTML-Vorschau-Harnesse
  (`*.card.html`, `ui_kits/app/index.html`) — reine Web-Preview-Infrastruktur.
- `guidelines/*.card.html` — Spezimen-Karten; alle Werte stehen in `tokens/` bzw. `TOKENS.md`.
- Die Web-Kompositions-Screens (Dashboard/Kapitel/Session/Vokabelkarte) — deren
  „echte" Umsetzung ist die React-Native-App selbst.

Falls doch je nötig: alles liegt im Design-Projekt (siehe ID oben).

## Wichtig: Web vs. React Native
Die Komponenten hier sind **Web-React mit Inline-Styles + CSS-Variablen** — als
visuelle/verhaltensmäßige Referenz. Die App ist React Native + NativeWind; die
Tokens sind dort in `tailwind.config.js` + `src/global.css` abgebildet (siehe
`THEME.md` im Repo-Root, falls vorhanden). Icons: Web nutzt Lucide, die App
`@expo/vector-icons` (gleiche Namen/Strichstärke als Ziel).
