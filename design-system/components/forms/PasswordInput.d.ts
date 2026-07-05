import * as React from "react";

export interface PasswordInputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Error message; also turns the border red. */
  error?: string;
  /** Helper text below the field. */
  hint?: string;
  disabled?: boolean;
  /** Show a 4-segment strength meter under the field. */
  showStrength?: boolean;
  autoComplete?: string;
  style?: React.CSSProperties;
}

export function PasswordInput(props: PasswordInputProps): JSX.Element;

/** Rough 0–4 strength score used by the meter. */
export function scorePassword(pw: string): number;
