import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** Einheitliche Lade-/Fehler-/Erfolg-Behandlung für Queries. */
export function QueryBoundary<T>({
  query,
  loading,
  children,
}: {
  query: QueryLike<T>;
  loading?: ReactNode;
  children: (data: T) => ReactNode;
}): ReactElement {
  const { t } = useTranslation();
  if (query.isError) {
    return (
      <View className="flex-1 items-center justify-center gap-3 p-6">
        <Text variant="caption" className="text-center">
          {t('errors.loadFailed')}
        </Text>
        <Button variant="outline" label={t('actions.retry')} onPress={() => query.refetch()} />
      </View>
    );
  }
  if (query.isLoading || query.data === undefined) {
    return <>{loading ?? <ListSkeleton />}</>;
  }
  return <>{children(query.data)}</>;
}
