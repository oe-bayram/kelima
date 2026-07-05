import React from "react";
import { Icon } from "../core/Icon.jsx";

/** scorePassword — rough 0–4 strength used by the meter. */
export function scorePassword(pw = "") {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH = [
  { label: "Zu kurz", color: "var(--status-new-solid)" },
  { label: "Schwach", color: "var(--status-unknown-solid)" },
  { label: "Okay", color: "var(--status-hard-solid)" },
  { label: "Gut", color: "var(--status-known-solid)" },
  { label: "Stark", color: "var(--status-secure-solid)" },
];

/**
 * PasswordInput — password field matching the Input look, with a show/hide eye
 * toggle and an optional 4-segment strength meter (uses the learning-status colors).
 */
export function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "Dein Passwort",
  error,
  hint,
  disabled = false,
  showStrength = false,
  autoComplete = "current-password",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const borderColor = error ? "var(--danger)" : focus ? "var(--primary-500)" : "var(--border-strong)";
  const pw = value || "";
  const score = scorePassword(pw);
  const strength = STRENGTH[score];

  return (
    <label style={{ display: "block", ...style }}>
      {label && (
        <span style={{ display: "block", font: "var(--text-label)", color: "var(--text-secondary)", marginBottom: 6 }}>{label}</span>
      )}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 50,
          padding: "0 6px 0 14px",
          background: disabled ? "var(--surface-sunken)" : "var(--surface)",
          border: `1.5px solid ${borderColor}`,
          borderRadius: "var(--r-md)",
          boxShadow: focus ? "var(--ring)" : "none",
          transition: "border-color .15s ease, box-shadow .15s ease",
        }}
      >
        <Icon name="lock" size={18} color="var(--text-tertiary)" />
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={reveal ? "text" : "password"}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            font: "var(--text-body)",
            fontSize: "var(--fs-body-lg)",
            color: "var(--text-primary)",
            minWidth: 0,
          }}
          {...rest}
        />
        <button
          type="button"
          aria-label={reveal ? "Passwort verbergen" : "Passwort anzeigen"}
          title={reveal ? "Passwort verbergen" : "Passwort anzeigen"}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setReveal((r) => !r)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            flex: "none",
            border: "none",
            background: "transparent",
            borderRadius: "var(--r-sm)",
            color: "var(--text-tertiary)",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <Icon name={reveal ? "eye-off" : "eye"} size={18} />
        </button>
      </span>

      {showStrength && pw.length > 0 && (
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ display: "flex", gap: 4, flex: 1 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{
                flex: 1,
                height: 4,
                borderRadius: "var(--r-full)",
                background: i < score ? strength.color : "var(--surface-inset)",
                transition: "background .2s ease",
              }} />
            ))}
          </span>
          <span style={{ font: "var(--text-label)", fontSize: "var(--fs-micro)", color: strength.color, minWidth: 44, textAlign: "right" }}>{strength.label}</span>
        </span>
      )}

      {(error || hint) && (
        <span style={{ display: "block", font: "var(--text-label)", fontSize: "var(--fs-micro)", color: error ? "var(--danger)" : "var(--text-tertiary)", marginTop: 6 }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
