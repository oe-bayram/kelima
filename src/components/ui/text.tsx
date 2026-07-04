import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

const textVariants = cva('text-neutral-900 dark:text-neutral-100', {
  variants: {
    variant: {
      title: 'text-3xl font-bold',
      subtitle: 'text-xl font-semibold',
      body: 'text-base',
      caption: 'text-sm text-neutral-500 dark:text-neutral-400',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type Props = TextProps & VariantProps<typeof textVariants> & { className?: string };

/** Typografie-Skala auf NativeWind-Basis (title | subtitle | body | caption). */
export function Text({ variant, className, ...props }: Props) {
  return <RNText className={cn(textVariants({ variant }), className)} {...props} />;
}
