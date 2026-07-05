The brand's learning-status indicator. Maps the 5 internal states (`new`, `unknown`, `hard`, `known`, `secure`) to German labels (Neu, Nicht gewusst, Schwer, Kann ich, Sicher) and the red→amber→green→blue progression. Always use this for status — never hand-color labels.

```jsx
<StatusBadge status="hard" />
<StatusBadge status="secure" variant="dot" />
```
