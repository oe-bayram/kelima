import * as React from "react";

export interface ProgressBarProps {
  value?: number;
  max?: number;
  height?: number;
  /** Fill color; defaults to brand primary. */
  color?: string;
  track?: string;
  style?: React.CSSProperties;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
