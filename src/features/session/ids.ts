import { getCurrentUser } from 'aws-amplify/auth';

/**
 * Deterministische IDs für idempotentes (Offline-)Nachspielen. Bewusst NICHT
 * gecached: `getCurrentUser()` liest nur lokale Tokens, und ein Cache würde nach
 * Nutzerwechsel (Sign-out → Sign-in) veralten.
 */
export async function currentUserId(): Promise<string> {
  const { userId } = await getCurrentUser();
  return userId;
}

/**
 * Progress-PK. `userId` im Schlüssel, weil `id` der globale DynamoDB-PK ist –
 * so kollidieren zwei Nutzer für dieselbe Vokabel nicht.
 */
export function progressId(userId: string, entryId: string): string {
  return `prog_${userId}_${entryId}`;
}

/** Session-Item-PK. Stabil pro Antwort → Replay erzeugt keine Duplikate. */
export function sessionItemId(sessionId: string, entryId: string, answeredAtEpoch: number): string {
  return `item_${sessionId}_${entryId}_${answeredAtEpoch}`;
}
