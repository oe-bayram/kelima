import type { Genus, VocabularyStatus, Wortart } from '@/lib/enums';

// WICHTIG: NativeWind scannt nur LITERALE Klassenstrings – niemals `bg-status-${x}`
// interpolieren. Deshalb statische Klassen-Maps + separate Hex-Maps (für style/Icons).

export const STATUS_HEX: Record<VocabularyStatus, string> = {
  neu: '#64748b',
  nicht_gewusst: '#dc2626',
  schwer: '#f59e0b',
  kann_ich: '#0ea5e9',
  sicher: '#16a34a',
};

export const STATUS_BG_CLASS: Record<VocabularyStatus, string> = {
  neu: 'bg-status-neu',
  nicht_gewusst: 'bg-status-nichtGewusst',
  schwer: 'bg-status-schwer',
  kann_ich: 'bg-status-kannIch',
  sicher: 'bg-status-sicher',
};

export const STATUS_ORDER: readonly VocabularyStatus[] = [
  'neu',
  'nicht_gewusst',
  'schwer',
  'kann_ich',
  'sicher',
];

export const GENUS_HEX: Record<Genus, string> = {
  maskulin: '#2563eb',
  feminin: '#dc2626',
  neutrum: '#16a34a',
};

export const GENUS_TEXT_CLASS: Record<Genus, string> = {
  maskulin: 'text-genus-der',
  feminin: 'text-genus-die',
  neutrum: 'text-genus-das',
};

export const WORTART_ABBR: Record<Wortart, string> = {
  nomen: 'N',
  verb: 'V',
  adjektiv: 'Adj',
  adverb: 'Adv',
  praeposition: 'Präp',
  konjunktion: 'Konj',
  pronomen: 'Pron',
  wendung: 'Wend',
  partikel: 'Part',
  interjektion: 'Interj',
  numerale: 'Num',
};

const ARTIKEL_GENUS: Record<string, Genus> = { der: 'maskulin', die: 'feminin', das: 'neutrum' };

/** Genus aus `genus`-Feld oder – als Fallback – aus dem Artikel bestimmen. */
export function genusOf(entry: {
  genus?: Genus | string | null;
  artikel?: string | null;
}): Genus | null {
  const g = entry.genus;
  if (g === 'maskulin' || g === 'feminin' || g === 'neutrum') return g;
  if (entry.artikel && ARTIKEL_GENUS[entry.artikel]) return ARTIKEL_GENUS[entry.artikel];
  return null;
}

export function statusOf(progress?: { status?: VocabularyStatus | null } | null): VocabularyStatus {
  return progress?.status ?? 'neu';
}

export function isDue(
  progress?: { dueAt?: string | null } | null,
  now: number = Date.now(),
): boolean {
  if (!progress?.dueAt) return false;
  const t = Date.parse(progress.dueAt);
  return !Number.isNaN(t) && t <= now;
}

export function isLearned(status: VocabularyStatus): boolean {
  return status === 'kann_ich' || status === 'sicher';
}

const SEARCH_FOLD: Record<string, string> = { ä: 'a', ö: 'o', ü: 'u', ß: 'ss' };

/** Suchnormalisierung: lowercase + Umlaute/Diakritika entfernen. */
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => SEARCH_FOLD[c] ?? c)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');
}
