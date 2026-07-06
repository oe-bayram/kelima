# Kelima — Design System

A design system for **Kelima**, a React-Native app for learning German **B1 vocabulary** (Goethe-Zertifikat B1 / Deutsch-Test für Zuwanderer). Learners study vocabulary chapter-by-chapter as cards, get quizzed by another person, rate how well they know each word, repeat problem words, and keep progress via cloud sync. Optional Turkish translations are shown alongside.

The brief: **modern, beautiful, minimal, and made for learning.** This system delivers that with a calm ice-paper palette, the Kelima ocean-blue primary, a clear typographic hierarchy that puts the *Lemma* (the word) center stage, and a didactic 5-step learning-status color language.

> **Local mirror.** This folder is the offline copy of the claude.ai/design
> project (id `bca96c9e-…`), the Kelima design system. Use it as the source of
> truth for the app's look — you do not need to reopen the design project.
> Colors are extracted from the official **Kelima logo** (`assets/logo.svg`):
> a tilted flashcard "K" over an open book on an ocean gradient. See `INDEX.md`.

---

## How this maps to the app
- **5 learning statuses** (`new`, `unknown`, `hard`, `known`, `secure`) → German labels *Neu · Nicht gewusst · Schwer · Kann ich · Sicher*, driven by `StatusBadge` / `StatusMeter` and the status color tokens.
- **4-level rating** after each card → `RatingButtons` (Nicht gewusst / Schwer / Kann ich / Sicher), each tied to a repetition interval.
- **Vocab card with tabs** (Übersicht / Beispiele / Formen / Grammatik) → `VocabCardView` in the App UI kit.
- **Learn vs. Test** sessions, including the examiner "Antwort anzeigen" reveal flow.
- **Auth** (Anmelden / Registrieren / Code-Bestätigung / Passwort vergessen / Neues Passwort) → `AuthScreen` in `ui_kits/app/screens-auth.jsx`, using `Input`, `PasswordInput`, `CodeInput`, `SegmentedControl`, `Button`.

---

## CONTENT FUNDAMENTALS

The UI language is **German**, addressing the learner informally with **„du"** (e.g. *„Hallo, Mara"*, *„Bereit für ein paar Vokabeln?"*, *„Weiterlernen"*). It is warm but not cute — encouraging without exclamation-mark hype.

- **Tone:** calm, supportive, matter-of-fact. Coaching, not gamified shouting. We celebrate quietly (*„Session beendet"*, a single recommendation line) rather than with confetti spam.
- **Casing:** sentence case for body and buttons (*„Antwort anzeigen"*, *„Schwierige Vokabeln lernen"*). UPPERCASE only for tiny eyebrow/meta labels with wide tracking (e.g. *TÜRKISCH*, *LERNSTATUS*). German nouns keep their capital (*Vokabeln, Kapitel, Formen*).
- **Buttons:** verbs first, short — *Anmelden, Weiterlernen, Testsession, Antwort anzeigen, Fertig*.
- **Status labels are fixed strings** — always *Neu / Nicht gewusst / Schwer / Kann ich / Sicher*. Never invent synonyms.
- **Numbers:** German formatting (*3.136 Vokabeln*, *20 % sicher* with a space before %). Tabular figures for counts.
- **Grammar vocabulary:** use the learner-facing German terms — *Artikel, Genus, Plural, Hilfsverb, trennbar, reflexiv, Rektion, Präsens/Präteritum/Perfekt 3. P. Sg.*
- **Turkish translations** appear as secondary, lighter text under the German, labelled *Türkisch*.
- **No emoji.** Meaning is carried by Lucide icons and the status color system, never by emoji.
- **Voice examples:** *„An der nächsten Kreuzung müssen Sie links abbiegen."* — real, natural B1 sentences; the formal *Sie* can appear *inside example sentences* even though the app UI uses *du*.

---

## VISUAL FOUNDATIONS

**Overall vibe.** Quiet, focused, paper-like. The screen mostly recedes so the word is the hero. Think a calm study app — closer to a well-made reading app than to a noisy game.

**Color.**
- *Neutrals are cool* — backgrounds are an ice off-white (`--neutral-50` #F7F9FB), surfaces pure white, ink the brand navy (#232B57). Text is never pure black — always the navy ramp.
- *Primary is Kelima blue* (`--primary-500` #1E86B8, deepening to the brand navy #204A94 at 700) — taken straight from the logo gradient. Used for the main CTA, active nav, focus rings. Hover/press go one step darker (600).
- *Accent is teal-green* (`--accent-500` #2CAF88, from the logo's green end and the "i"-dot #33B4A5) — sparingly, for streaks, success and the occasional highlight (e.g. the *7 Tage* streak badge, favorite stars).
- *The brand gradient* (`--gradient-brand`, green→teal→blue→navy from the logo) is reserved for brand moments: splash/login hero, app icon, marketing. Never as a component background.
- *Status progression* is didactic and reads left→right as mastery grows: **red → amber → teal-green → navy-blue** (Nicht gewusst → Schwer → Kann ich → Sicher), with `new` a neutral gray. "Kann ich" uses the brand green, "Sicher" the brand blue — mastery literally converges on the brand colors. Each status has a soft tint bg, a readable fg, a border, and a saturated solid (for dots, meters, charts). Always use the tokens / `StatusBadge`, never hand-pick.
- A **dark theme** is provided under `[data-theme="dark"]`: same coolness, lifted blues for contrast.

**Type.**
- *Display* — **Schibsted Grotesk** (bold, tight tracking): the Lemma, screen titles, big stat numbers.
- *Text* — **Hanken Grotesk**: all UI copy, labels, buttons; humanist, highly legible at small sizes.
- *Mono* — **JetBrains Mono**: grammatical forms, phonetic-style runs, IDs (`biegt ab · bog ab · ist abgebogen`).
- The Lemma is the single largest element on a card (≈40px). Hierarchy is created by size + weight + color, not by boxes.

**Spacing & layout.** 4px base scale. Generous but not wasteful (the chosen density is *balanced, leaning airy*). Phone content uses a 16px gutter; cards a 20px pad. Touch targets ≥ 44px. Single-column, scrollable bodies with a fixed header and (where relevant) a fixed bottom action bar / tab bar.

**Corners.** Soft, modern, *not* bubbly: buttons & inputs 12px, cards 16px, the focused vocab surface up to 20px, pills fully round.

**Elevation.** Low, cool navy-tinted shadows (`--shadow-sm`→`xl`). Cards rest on `shadow-sm`; raised/important cards on `shadow-md`; interactive cards lift to `shadow-md` on hover and tighten their border. Sheets/modals use `shadow-lg`/`xl`. No hard or colored drop shadows.

**Borders.** Hairline `1px var(--border)` (cool light gray) is the default separator and card outline. Dividers inside cards are even lighter (`--divider`). Inputs use a 1.5px border that turns primary-blue + a soft ring on focus.

**Backgrounds.** Flat ice paper. **No gradients on surfaces** — the brand gradient exists as a token but is reserved for brand moments (login hero, icon, marketing). No photographic hero imagery, no textures. Depth comes from white cards on the ice-white app background plus soft shadows. The bottom tab bar uses a translucent surface + blur.

**Animation.** Restrained and quick. Buttons scale to ~0.97 on press (≈80ms); cards lift shadow on hover (≈180ms); progress/meter bars ease their width (`cubic-bezier(.2,.7,.2,1)`, ~400ms). No bounces, no parallax, respect reduced-motion.

**Hover / press states.** Hover = a step-darker fill (primary 500→600) or a faint sunken background for ghost/secondary; press = a subtle scale-down. Active nav / favorited icon = primary tint background + primary fg. Disabled = 45–50% opacity, `not-allowed`.

---

## ICONOGRAPHY

- **System: [Lucide](https://lucide.dev)** — fine, line-based, 2px stroke. In the web design kit it is rendered through the `Icon` component. In the **React-Native app** use `@expo/vector-icons` (Lucide is the visual reference; match names/weights). Common icons: `house` / `layers` / `chart-no-axes-column` (tabs), `volume-2` (TTS), `star` (favorite), `play` (learn), `users` (test), `eye` (reveal), `alarm-clock` (due), `flame` (streak), `target` (problem words), `mail` / `lock` / `user` (auth).
- **Stroke weight** is consistent (2; active nav items nudge to ~2.4). Don't mix in filled icon sets.
- **Brand mark** (`assets/logo.svg`): the Kelima logo — a tilted flashcard "K" over an open book on the ocean gradient (navy #204A94 → blue #219EC9 → teal-green #2CAF88), navy ink #232B57. The only custom art; everything else is Lucide.
- **No emoji**, no unicode-glyph icons.

---

## CAVEATS

1. **Fonts are Google Fonts.** Schibsted Grotesk / Hanken Grotesk / JetBrains Mono. In the app, load them via `expo-font` (`@expo-google-fonts/*`) or bundled TTFs; otherwise the family falls back to system sans.
2. **Colors derive from the Kelima logo** — ocean-blue primary, navy ink, teal-green accent. Type, corners and density remain the system's proposal.
3. **Status colors** use a red→amber→teal-green→navy-blue progression — this is intentional and didactic, and converges on the brand colors.
4. **Icons = Lucide** as the visual language; the RN app uses `@expo/vector-icons` equivalents.
