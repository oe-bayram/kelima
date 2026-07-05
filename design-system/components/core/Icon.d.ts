import * as React from "react";

export interface IconProps {
  /** Lucide icon name, e.g. "volume-2", "star", "check". */
  name: string;
  /** Pixel size (square). Default 20. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
  /** CSS color; defaults to currentColor so it inherits text color. */
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

/** Lucide icon. Requires Lucide loaded on the page. */
export function Icon(props: IconProps): JSX.Element;
