import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { storage } from './storage';

/**
 * QueryClient with React Native-friendly defaults.
 *
 * IMPORTANT: for persistence to be useful, `gcTime` must be >= the persister's
 * `maxAge` (default 24h). Otherwise queries are garbage-collected from memory
 * before they can be restored/served from disk.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long fetched data is considered fresh (no background refetch).
      staleTime: 1000 * 60 * 5, // 5 minutes
      // How long inactive/unused data is kept in cache (and worth persisting).
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      // RN has no window focus; refetch when the network/app reconnects instead.
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Adapt the synchronous MMKV API to the Web `Storage` shape that
 * `createSyncStoragePersister` expects ({ getItem, setItem, removeItem }).
 * MMKV reads/writes synchronously, so the *sync* persister is the right choice
 * (no need for the async-storage persister).
 */
const clientStorage = {
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.remove(key); // v4 renamed `delete` -> `remove`
  },
};

export const persister = createSyncStoragePersister({
  // Cast because the persister types the DOM `Storage` interface, but only
  // getItem/setItem/removeItem are ever used.
  storage: clientStorage as unknown as Storage,
  key: 'KELIMA_QUERY_CACHE',
  throttleTime: 1000,
});

/**
 * Pass this to <PersistQueryClientProvider persistOptions={persistOptions}>.
 * maxAge should not exceed queries' gcTime (see note above).
 */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  // buster: bump this string to invalidate all persisted caches on release.
  buster: '',
};
