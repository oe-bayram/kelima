// Kleine, abhängigkeitsfreie Helfer (Slugs, Hash, Normalisierung, Concurrency, CLI-Args).

const UMLAUT_MAP: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'ae',
  Ö: 'oe',
  Ü: 'ue',
  ß: 'ss',
};

export function foldUmlauts(input: string): string {
  return input.replace(/[äöüÄÖÜß]/g, (c) => UMLAUT_MAP[c] ?? c);
}

/** URL-/ID-tauglicher Slug: Umlaut-Fold, lowercase, nur [a-z0-9-]. */
export function slug(input: string): string {
  return foldUmlauts(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Suchschlüssel: lowercase, getrimmt, OHNE Umlaut-Folding (trennt schon/schön). */
export function normalizeLemma(lemma: string): string {
  return lemma.trim().toLowerCase();
}

const WORTART_MAP: Record<string, string> = {
  präposition: 'praeposition',
};

/** Wortart auf Enum-Wert ohne Umlaute normalisieren. */
export function normalizeWortart(w: string): string {
  const key = w.trim().toLowerCase();
  return WORTART_MAP[key] ?? key;
}

/** Deterministischer FNV-1a-32-Bit-Hash → 8 Hex-Zeichen. */
export function hash8(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Deterministischer ID-Allokator: gibt für eine Basis-ID entweder die Basis
 * zurück oder – bei Kollision – eine disambiguierte Variante (bevorzugter
 * Discriminator, sonst laufende Nummer). Über den gesamten Import geteilt,
 * damit Haupt- und Wortgruppen-Einträge nicht kollidieren.
 */
export function createIdAllocator() {
  const used = new Set<string>();
  return {
    has: (id: string) => used.has(id),
    allocate(base: string, discriminator?: string): string {
      if (!used.has(base)) {
        used.add(base);
        return base;
      }
      if (discriminator) {
        const withDisc = `${base}_${slug(discriminator)}`;
        if (!used.has(withDisc)) {
          used.add(withDisc);
          return withDisc;
        }
      }
      let n = 2;
      let candidate = `${base}_${n}`;
      while (used.has(candidate)) {
        n++;
        candidate = `${base}_${n}`;
      }
      used.add(candidate);
      return candidate;
    },
  };
}

export type IdAllocator = ReturnType<typeof createIdAllocator>;

/** Minimaler Concurrency-Limiter (kein Fremd-Paket). */
export function pLimit(concurrency: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const dequeue = () => {
    if (active >= concurrency) return;
    const run = queue.shift();
    if (!run) return;
    active++;
    run();
  };
  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--;
            dequeue();
          });
      });
      dequeue();
    });
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type CliArgs = Record<string, string | boolean>;

/** Sehr einfacher `--key value` / `--flag`-Parser. */
export function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}
