import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

/**
 * Typografie-Skala nach dem Lernwort-Design-System (design-system/TOKENS.md).
 * `lemma` ist das Vokabel-Wort (Held), `title`/`heading` Überschriften,
 * `label`/`caption` Meta-Text. Farbe folgt den warmen Neutrals + Dark-Variante.
 */
const textVariants = cva('text-neutral-900 dark:text-neutral-100', {
  variants: {
    variant: {
      lemma: 'text-4xl font-extrabold tracking-tight',
      display: 'text-3xl font-extrabold tracking-tight',
      title: 'text-2xl font-bold tracking-tight',
      subtitle: 'text-xl font-semibold',
      heading: 'text-lg font-semibold',
      body: 'text-base',
      bodyStrong: 'text-base font-semibold',
      label: 'text-sm font-medium text-neutral-600 dark:text-neutral-300',
      caption: 'text-sm text-neutral-500 dark:text-neutral-400',
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
