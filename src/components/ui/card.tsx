import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

type Props = ViewProps & { className?: string };

export function Card({ className, ...props }: Props) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: Props) {
  return <View className={cn('gap-1 p-4 pb-2', className)} {...props} />;
}

export function CardContent({ className, ...props }: Props) {
  return <View className={cn('p-4 pt-2', className)} {...props} />;
}
