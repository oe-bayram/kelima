import * as React from "react";

export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Accessible label (also the tooltip). */
  label: string;
  variant?: "ghost" | "soft" | "outline";
  size?: "sm" | "md" | "lg";
  /** Renders the brand "on" state (e.g. favorited). */
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
