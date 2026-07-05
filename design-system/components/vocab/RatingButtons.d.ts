import * as React from "react";

/**
 * @startingPoint section="Learning" subtitle="Four-level self-assessment / examiner rating row" viewport="700x180"
 */
export interface RatingButtonsProps {
  /** Called with the chosen rating: "unknown" | "hard" | "known" | "secure". */
  onRate?: (rating: "unknown" | "hard" | "known" | "secure") => void;
  /** Show the next-due interval under each label. Default true. */
  showInterval?: boolean;
  /** "grid" = 2×2 (mobile), "row" = single row of 4. */
  layout?: "grid" | "row";
  style?: React.CSSProperties;
}

export function RatingButtons(props: RatingButtonsProps): JSX.Element;
