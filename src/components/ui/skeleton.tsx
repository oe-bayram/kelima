import { View } from 'react-native';

import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <View className={cn('rounded-md bg-neutral-200 dark:bg-neutral-800', className)} />;
}

export function ListSkeleton() {
  return (
    <View className="gap-3 p-4">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View className="gap-3 p-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-48 w-full" />
    </View>
  );
}
