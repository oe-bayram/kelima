Password field built on the `Input` look — a lock icon, a show/hide eye toggle, and an optional 4-segment strength meter that reuses the learning-status colors. Use it on Sign-in (no meter) and on Sign-up / password-reset (`showStrength`).

```jsx
<PasswordInput label="Passwort" value={pw} onChange={(e) => setPw(e.target.value)} />
<PasswordInput label="Neues Passwort" value={pw} onChange={(e) => setPw(e.target.value)} showStrength autoComplete="new-password" />
<PasswordInput label="Passwort" error="Mindestens 8 Zeichen" />
```

- The eye toggle switches `type` between `password` and `text`; the field matches `Input`.
- `showStrength` draws the meter from `scorePassword(value)` (0–4) → labels *Zu kurz / Schwach / Okay / Gut / Stark*.
- `autoComplete` should be `new-password` on Sign-up/reset, `current-password` on Sign-in.
