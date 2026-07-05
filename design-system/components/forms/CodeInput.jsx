import React from "react";

/**
 * CodeInput — segmented one-time-code field for the Cognito e-mail confirmation
 * and password-reset codes. Digits auto-advance, Backspace steps back, and
 * pasting a full code fills every box. Controlled via value/onChange.
 */
export function CodeInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  error,
  disabled = false,
  autoFocus = false,
  style,
}) {
  const refs = React.useRef([]);
  const [focusIdx, setFocusIdx] = React.useState(autoFocus ? 0 : -1);
  const chars = Array.from({ length }, (_, i) => value[i] || "");

  React.useEffect(() => {
    if (autoFocus && refs.current[0]) refs.current[0].focus();
  }, [autoFocus]);

  const emit = (next) => {
    const joined = next.join("").slice(0, length);
    if (onChange) onChange(joined);
    if (joined.length === length && onComplete) onComplete(joined);
  };

  const handleChange = (i, raw) => {
    const digits = (raw.match(/\d/g) || []).join("");
    if (!digits) {
      const next = chars.slice();
      next[i] = "";
      emit(next);
      return;
    }
    const next = chars.slice();
    let p = i;
    for (const d of digits) {
      if (p >= length) break;
      next[p] = d;
      p++;
    }
    emit(next);
    const last = Math.min(i + digits.length, length - 1);
    if (refs.current[last]) refs.current[last].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      if (refs.current[i - 1]) refs.current[i - 1].focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1].focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1].focus();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, ...style }}>
        {chars.map((c, i) => {
          const active = focusIdx === i;
          const borderColor = error ? "var(--danger)" : active ? "var(--primary-500)" : "var(--border-strong)";
          return (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={c}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={disabled}
              aria-label={`Ziffer ${i + 1}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => { setFocusIdx(i); e.target.select(); }}
              onBlur={() => setFocusIdx(-1)}
              style={{
                flex: 1,
                minWidth: 0,
                height: 56,
                textAlign: "center",
                font: "var(--fw-bold) var(--fs-title)/1 var(--font-mono)",
                color: "var(--text-primary)",
                background: disabled ? "var(--surface-sunken)" : "var(--surface)",
                border: `1.5px solid ${borderColor}`,
                borderRadius: "var(--r-md)",
                boxShadow: active ? "var(--ring)" : "none",
                outline: "none",
                transition: "border-color .15s ease, box-shadow .15s ease",
              }}
            />
          );
        })}
      </div>
      {error && (
        <span style={{ display: "block", font: "var(--text-label)", fontSize: "var(--fs-micro)", color: "var(--danger)", marginTop: 6 }}>{error}</span>
      )}
    </div>
  );
}
