import { View } from 'react-native';

import type { StatusCounts } from '@/features/stats/statsLogic';
import { cn } from '@/lib/utils';
import { STATUS_BG_CLASS, STATUS_ORDER } from '@/lib/vocab';

/** Gestapelter Verteilungsbalken über die 5 Lernstatus (proportional per flex). */
export function StatusBar({ counts, className }: { counts: StatusCounts; className?: string }) {
  const total = STATUS_ORDER.reduce((sum, st) => sum + counts[st], 0);
  return (
    <View
      className={cn(
        'h-2.5 w-full flex-row overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
        className,
      )}
    >
      {total > 0
        ? STATUS_ORDER.map((st) =>
            counts[st] > 0 ? (
              <View key={st} className={STATUS_BG_CLASS[st]} style={{ flex: counts[st] }} />
            ) : null,
          )
        : null}
    </View>
  );
}
