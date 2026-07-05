import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

/**
 * Typografie-Skala nach dem Lernwort-Design-System (design-system/TOKENS.md).
 * `lemma` ist das Vokabel-Wort (Held), `title`/`heading` Überschriften,
 * `label`/`caption` Meta-Text. Schrift-Gewicht kommt über gewichts-explizite
 * Font-Familien (RN wählt Gewichte nicht selbst) — display = Schibsted Grotesk,
 * Body/Label = Hanken Grotesk. Farbe folgt den warmen Neutrals + Dark-Variante.
 */
const textVariants = cva('font-sans text-neutral-900 dark:text-neutral-100', {
  variants: {
    variant: {
      lemma: 'font-display-black text-4xl tracking-tight',
      display: 'font-display-black text-3xl tracking-tight',
      title: 'font-display text-2xl tracking-tight',
      subtitle: 'font-sans-semibold text-xl',
      heading: 'font-sans-semibold text-lg',
      body: 'font-sans text-base',
      bodyStrong: 'font-sans-semibold text-base',
      label: 'font-sans-medium text-sm text-neutral-600 dark:text-neutral-300',
      caption: 'font-sans text-sm text-neutral-500 dark:text-neutral-400',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type Props = TextProps & VariantProps<typeof textVariants> & { className?: string };

/** Typografie-Skala auf NativeWind-Basis (lemma | display | title | subtitle | heading | body | bodyStrong | label | caption). */
export function Text({ variant, className, ...props }: Props) {
  return <RNText className={cn(textVariants({ variant }), className)} {...props} />;
}
