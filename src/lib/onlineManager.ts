import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Verbindet `@react-native-community/netinfo` mit TanStacks `onlineManager`,
 * damit Query/Mutation-Retries und die Offline-Outbox den echten Netzstatus
 * kennen (RN hat keinen `window`-Online-Event). Einmal beim App-Start aufrufen.
 */
export function setupOnlineManager(): void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
    }),
  );
}
