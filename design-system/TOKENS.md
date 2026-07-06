# Token-Referenz (kompakt)

Vollständige Werte in `tokens/`. Diese Tabelle ist zum schnellen Nachschlagen.

## Marken-Verlauf (nur Brand-Momente: Splash/Login-Hero, Icon)
`--gradient-brand` = `linear-gradient(135deg, #2CAF88 0%, #25A5AC 28%, #219EC9 62%, #204A94 100%)` (grün→teal→blau→navy, aus dem Logo). Stops: navy `#204A94` · blue `#219EC9` · green `#2CAF88` · ink `#232B57` · ice `#D1E9FA`. Nie als Komponenten-Hintergrund.

## Farben — Light / Dark

### Primär (Kelima Ozean-Blau)
| Token | Light | Dark |
|---|---|---|
| `primary-50` | `#EAF4FB` | `#16283E` |
| `primary-100` | `#D1E9FA` | `#1B3452` |
| `primary-200` | `#A3D4EE` | `#1F4A74` |
| `primary-300` | `#64B7DE` | `#226499` |
| `primary-400` | `#35A0CE` | `#2C85BC` |
| `primary-500` (base) | `#1E86B8` | `#45A3D6` |
| `primary-600` (hover/press) | `#1B6FA4` | `#6BB8E0` |
| `primary-700` (≈Navy) | `#205490` | `#97CDEB` |
| `primary-800` | `#1F3D74` | – |
| `primary-900` (=Marken-Tinte) | `#232B57` | – |

### Akzent (Teal-Grün)
`accent-500` `#2CAF88` (dark `#3FC49C`) · `accent-600` `#1F9372` (dark `#63D2B0`) · `accent-50` `#E6F6F0` · `accent-100` `#C6EBDE` · `accent-300` `#6FCDAC`

### Neutrals (kühles Ice, Navy-getönt)
| Token | Light | Dark |
|---|---|---|
| `neutral-0` | `#FFFFFF` | `#191D2E` |
| `neutral-50` | `#F7F9FB` | `#141724` |
| `neutral-100` | `#EFF3F7` | `#1D2133` |
| `neutral-150` | `#E7ECF2` | `#252A3F` |
| `neutral-200` | `#DCE3EB` | `#2F354C` |
| `neutral-300` | `#C6D0DC` | `#3B425C` |
| `neutral-400` | `#9CA9BC` | `#59617D` |
| `neutral-500` | `#77839A` | `#848CA5` |
| `neutral-600` | `#5A6580` | `#A2A9BE` |
| `neutral-700` | `#414B66` | `#C2C7D6` |
| `neutral-800` | `#2E3550` | `#DFE2EB` |
| `neutral-900` | `#232B57` | `#F2F4F8` |

### Lernstatus (fg / bg / border / solid)
| Status | fg (light) | bg (light) | border (light) | solid |
|---|---|---|---|---|
| `new` (Neu) | `#5A6580` | `#EEF1F5` | `#DAE0E8` | `#9CA9BC` |
| `unknown` (Nicht gewusst) | `#B3382F` | `#FBEBE9` | `#F2CFCA` | `#C4483E` |
| `hard` (Schwer) | `#9A6A0B` | `#FAF0D8` | `#EDDCAC` | `#D19A26` |
| `known` (Kann ich) | `#177D62` | `#E2F4ED` | `#BFE6D6` | `#2CAF88` |
| `secure` (Sicher) | `#24549E` | `#E8F0FB` | `#C9DBF4` | `#2E66BD` |

Dark fg: new `#A2A9BE` · unknown `#F0938A` · hard `#E4BA5E` · known `#4FCBA3` · secure `#85AEED` (bg/border siehe `colors.css`).
„Kann ich" nutzt das Marken-Grün, „Sicher" das Marken-Blau — Meisterung konvergiert auf die Markenfarben.

### Semantik / Feedback
`success` `#2CAF88` · `warning` `#D19A26` · `danger` `#C4483E` · `info` `#219EC9`

### Flächen & Text (theme-aware Aliase)
`bg-app` = neutral-50 · `surface` = neutral-0 (dark: neutral-100) · `surface-sunken` = neutral-100 · `surface-inset` = neutral-150 ·
`text-primary` = neutral-900 · `text-secondary` = neutral-600 · `text-tertiary` = neutral-500 · `text-on-primary` = #FFF (dark #0E1A2C) · `text-link` = primary-600 ·
`border` = neutral-200 · `border-strong` = neutral-300 · `divider` = neutral-150 · `overlay` = rgba(35,43,87,.42)

## Typografie
- Familien: display **Schibsted Grotesk**, text **Hanken Grotesk**, mono **JetBrains Mono**
- Gewichte: 400 / 500 / 600 / 700 / 800
- Größen: display-xl 44 · display-lg 34 · display-md 28 · title 22 · heading 19 · body-lg 17 · body 15 · label 13 · micro 11
- Line-height: tight 1.08 · snug 1.25 · normal 1.45 · relaxed 1.6
- Tracking: tight -0.02em · snug -0.01em · wide 0.02em · eyebrow 0.08em
- Rollen: lemma (700 44/1.08 display) · title (700 22 display) · heading (600 19 display) · body (400 15 text) · body-strong (600 15 text) · label (500 13 text)

## Spacing (4px-Basis)
0·`4`·`8`·`12`·`16`·`20`·`24`·`32`·`40`·`48`·`64`·`80` (space-0…space-12)
Semantisch: gap-inline 8 · gap-stack 12 · gap-section 24 · pad-card 20 · pad-screen 20 · tap-min 44 · screen-max 440

## Radii
xs 6 · sm 10 · md 12 (Buttons/Inputs) · lg 16 (Cards) · xl 20 (Fokus-Vokabelkarte) · 2xl 26 · full 999

## Elevation (kühl navy-getönt)
xs · sm (Cards Ruhe) · md (raised / Hover) · lg (Sheets) · xl (Modal). Werte in `shadows.css`.
Ring: `--ring` = `0 0 0 3px var(--primary-100)`.
