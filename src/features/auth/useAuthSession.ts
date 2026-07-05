import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useEffect, useState } from 'react';

import { isAmplifyConfigured } from '@/lib/amplify';

export type AuthStatus = 'configuring' | 'authenticated' | 'unauthenticated';

/**
 * Deterministischer Auth-Status auf Basis des Amplify-Hub + `getCurrentUser`.
 */
export function useAuthSession(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>(
    isAmplifyConfigured ? 'configuring' : 'unauthenticated',
  );

  useEffect(() => {
    if (!isAmplifyConfigured) return;
    let active = true;

    const refresh = async () => {
      try {
        await getCurrentUser();
        if (active) setStatus('authenticated');
      } catch {
        if (active) setStatus('unauthenticated');
      }
    };

    void refresh();
    const unsubscribe = Hub.listen('auth', () => {
      void refresh();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return status;
}
