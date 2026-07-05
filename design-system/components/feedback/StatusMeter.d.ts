import * as React from "react";

export interface StatusMeterProps {
  /** Counts per status, e.g. { secure: 10, known: 8, hard: 4, unknown: 2, new: 26 }. */
  counts?: Partial<Record<"new" | "unknown" | "hard" | "known" | "secure", number>>;
  height?: number;
  rounded?: boolean;
  style?: React.CSSProperties;
}

export function StatusMeter(props: StatusMeterProps): JSX.Element;
