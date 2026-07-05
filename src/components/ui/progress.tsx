import { View } from 'react-native';

import { cn } from '@/lib/utils';

/** Fortschrittsbalken; `value` ∈ [0,1]. */
export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 100;
  return (
    <View
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
        className,
      )}
    >
      <View className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </View>
  );
}
