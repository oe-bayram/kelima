import * as React from "react";

export interface InputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  /** Lucide icon name shown at the start of the field. */
  iconLeft?: string;
  /** Error message; also turns the border red. */
  error?: string;
  /** Helper text below the field. */
  hint?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
