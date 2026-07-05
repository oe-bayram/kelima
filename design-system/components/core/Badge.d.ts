import * as React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  tone?: "neutral" | "primary" | "accent" | "outline";
  /** Optional Lucide icon name before the label. */
  icon?: string;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
