import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, View } from 'react-native';

import { cn } from '@/lib/utils';

const badgeVariants = cva('self-start rounded-full px-2 py-0.5', {
  variants: {
    variant: {
      default: 'bg-neutral-200 dark:bg-neutral-700',
      brand: 'bg-brand',
      outline: 'border border-neutral-300 dark:border-neutral-600',
    },
  },
  defaultVariants: { variant: 'default' },
});

type BadgeProps = VariantProps<typeof badgeVariants> & {
  label: string;
  /** Overwrite background (z. B. STATUS_BG_CLASS[status]). */
  className?: string;
  textClassName?: string;
};

export function Badge({ variant, label, className, textClassName }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <RNText
        className={cn('text-xs font-medium text-neutral-700 dark:text-neutral-200', textClassName)}
      >
        {label}
      </RNText>
    </View>
  );
}
