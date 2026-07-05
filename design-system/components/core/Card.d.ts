import * as React from "react";

export interface CardProps {
  children?: React.ReactNode;
  /** CSS padding value. Default var(--pad-card). */
  padding?: string;
  /** Enables hover/press affordance for tappable cards. */
  interactive?: boolean;
  /** Use a slightly higher resting elevation. */
  raised?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
