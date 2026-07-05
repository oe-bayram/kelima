import * as React from "react";

export interface CodeInputProps {
  /** Number of digit boxes (default 6). */
  length?: number;
  value?: string;
  /** Fires on every edit with the joined string. */
  onChange?: (code: string) => void;
  /** Fires once when all boxes are filled. */
  onComplete?: (code: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export function CodeInput(props: CodeInputProps): JSX.Element;
