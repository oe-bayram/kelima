# Token-Referenz (kompakt)

Vollständige Werte in `tokens/`. Diese Tabelle ist zum schnellen Nachschlagen.

## Farben — Light / Dark

### Primär (Pinien-Grün)
| Token | Light | Dark |
|---|---|---|
| `primary-50` | `#E9F5EF` | `#0C2A20` |
| `primary-100` | `#CFE9DD` | `#103625` |
| `primary-200` | `#A6D6C1` | `#15583F` |
| `primary-300` | `#6FBF9C` | `#1E7A57` |
| `primary-400` | `#3FA67D` | `#2E9772` |
| `primary-500` (base) | `#1F8160` | `#41B88C` |
| `primary-600` (hover/press) | `#1A6E51` | `#5CC8A0` |
| `primary-700` | `#14543E` | `#84D8BA` |
| `primary-800` | `#0E3C2D` | – |
| `primary-900` | `#0A2C21` | – |

### Akzent (warmes Clay)
`accent-500` `#C8703D` (dark `#E0905E`) · `accent-600` `#AE5C2E` (dark `#EBA678`) · `accent-50` `#FBEFE7` · `accent-100` `#F5D9C7` · `accent-300` `#E5A579`

### Neutrals (warmes Papier)
| Token | Light | Dark |
|---|---|---|
| `neutral-0` | `#FFFFFF` | `#1A1B19` |
| `neutral-50` | `#FAFAF8` | `#141513` |
| `neutral-100` | `#F3F2EC` | `#1F211E` |
| `neutral-150` | `#ECEAE2` | `#272925` |
| `neutral-200` | `#E3E1D7` | `#31332E` |
| `neutral-300` | `#D2CFC2` | `#3D403A` |
| `neutral-400` | `#B0AC9C` | `#5C5F57` |
| `neutral-500` | `#8A867A` | `#8A8D83` |
| `neutral-600` | `#6A6760` | `#A7A99F` |
| `neutral-700` | `#4C4A44` | `#C6C8BE` |
| `neutral-800` | `#312F2B` | `#E2E3DC` |
| `neutral-900` | `#1A1A18` | `#F4F4EF` |

### Lernstatus (fg / bg / border / solid)
| Status | fg (light) | bg (light) | border (light) | solid |
|---|---|---|---|---|
| `new` (Neu) | `#6A6760` | `#EFEEE8` | `#DCDAD0` | `#A8A498` |
| `unknown` (Nicht gewusst) | `#B23A2E` | `#FAEAE7` | `#F0CFC9` | `#C0392E` |
| `hard` (Schwer) | `#A06A12` | `#F8EFD7` | `#EDDBAE` | `#C98A1E` |
| `known` (Kann ich) | `#1A6E51` | `#E4F1EA` | `#C4E2D2` | `#1F8160` |
| `secure` (Sicher) | `#2D62C9` | `#E8EEFB` | `#CBD9F4` | `#2D62C9` |

Dark fg: new `#A7A99F` · unknown `#F0938A` · hard `#E6B85C` · known `#5CC8A0` · secure `#87A8F0` (bg/border siehe `colors.css`).

### Semantik / Feedback
`success` `#1F8160` · `warning` `#C98A1E` · `danger` `#C0392E` · `info` `#2D62C9`

### Flächen & Text (theme-aware Aliase)
`bg-app` = neutral-50 · `surface` = neutral-0 (dark: neutral-100) · `surface-sunken` = neutral-100 · `surface-inset` = neutral-150 ·
`text-primary` = neutral-900 · `text-secondary` = neutral-600 · `text-tertiary` = neutral-500 · `text-on-primary` = #FFF (dark #0A2018) · `text-link` = primary-600 ·
`border` = neutral-200 · `border-strong` = neutral-300 · `divider` = neutral-150 · `overlay` = rgba(26,26,24,.40)

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

## Elevation (warm getönt)
xs · sm (Cards Ruhe) · md (raised / Hover) · lg (Sheets) · xl (Modal). Werte in `shadows.css`.
Ring: `--ring` = `0 0 0 3px var(--primary-100)`.
