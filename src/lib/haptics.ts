import * as Haptics from 'expo-haptics';

/**
 * Defensive Haptik-Wrapper. Fehler (natives Modul noch nicht im Build, Web,
 * Simulator ohne Haptik) werden verschluckt, damit die App auch ohne nativen
 * Rebuild weiterläuft — die Haptik ist dann einfach still.
 */
function safe(run: () => Promise<unknown>): void {
  try {
    void run().catch(() => {});
  } catch {
    /* natives Modul fehlt → ignorieren */
  }
}

/** Kurzes, leichtes Tippen (z. B. Bewertung, Favorit umschalten). */
export function hapticLight(): void {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Erfolgs-Feedback (z. B. Session abgeschlossen). */
export function hapticSuccess(): void {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
