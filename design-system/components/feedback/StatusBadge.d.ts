import * as React from "react";

/**
 * @startingPoint section="Learning" subtitle="5-level vocabulary status indicator" viewport="700x160"
 */
export interface StatusBadgeProps {
  /** Internal status value. UI labels are applied automatically. */
  status?: "new" | "unknown" | "hard" | "known" | "secure";
  /** "soft" = filled pill, "dot" = colored dot + label. */
  variant?: "soft" | "dot";
  size?: "sm" | "md";
  showLabel?: boolean;
  style?: React.CSSProperties;
}

export function StatusBadge(props: StatusBadgeProps): JSX.Element;
