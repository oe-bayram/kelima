import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-fähiges className-Merging (clsx + tailwind-merge) für die UI-Bausteine. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
