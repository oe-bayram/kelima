Segmented one-time-code field for the Cognito e-mail confirmation and password-reset codes. Digits auto-advance, Backspace steps back to the previous box, and pasting a full code fills every box at once. Numeric only, set in the mono type for a receipt-like feel.

```jsx
<CodeInput length={6} value={code} onChange={setCode} onComplete={verify} autoFocus />
<CodeInput value="1284" error="Code abgelaufen" />
```

- `onChange` receives the joined string; `onComplete` fires once when full — wire it to auto-submit.
- Pair it with a "Code erneut senden" text link and a resend countdown (see the Auth-Flow kit).
