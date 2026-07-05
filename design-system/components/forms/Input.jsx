import React from "react";
import { Icon } from "../core/Icon.jsx";

/** Input — text field with optional label, leading icon and error state. */
export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  iconLeft,
  error,
  hint,
  disabled = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderColor = error ? "var(--danger)" : focus ? "var(--primary-500)" : "var(--border-strong)";
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
          padding: "0 14px",
          background: disabled ? "var(--surface-sunken)" : "var(--surface)",
          border: `1.5px solid ${borderColor}`,
          borderRadius: "var(--r-md)",
          boxShadow: focus ? "var(--ring)" : "none",
          transition: "border-color .15s ease, box-shadow .15s ease",
        }}
      >
        {iconLeft && <Icon name={iconLeft} size={18} color="var(--text-tertiary)" />}
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          disabled={disabled}
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
      </span>
      {(error || hint) && (
        <span style={{ display: "block", font: "var(--text-label)", fontSize: "var(--fs-micro)", color: error ? "var(--danger)" : "var(--text-tertiary)", marginTop: 6 }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
