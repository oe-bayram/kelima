import * as React from "react";

/**
 * @startingPoint section="Core" subtitle="Primary action button, 4 variants × 3 sizes" viewport="700x220"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual weight. Default "primary". */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Default "md". */
  size?: "sm" | "md" | "lg";
  /** Lucide icon name shown before the label. */
  iconLeft?: string;
  /** Lucide icon name shown after the label. */
  iconRight?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
