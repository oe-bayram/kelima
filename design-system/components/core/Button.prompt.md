Primary action control — solid pine-green primary, quiet secondary, ghost, and danger; three sizes; optional Lucide icons and a loading spinner.

```jsx
<Button variant="primary" size="lg" iconLeft="play" onClick={start}>Weiterlernen</Button>
<Button variant="secondary" iconLeft="shuffle">Testsession</Button>
<Button variant="ghost" size="sm">Überspringen</Button>
```

- `variant`: primary | secondary | ghost | danger
- `size`: sm | md | lg — md is the default; use lg for the main dashboard CTA
- `iconLeft` / `iconRight` take Lucide icon names; `loading` shows a spinner
- Requires Lucide loaded on the page (see Icon).
