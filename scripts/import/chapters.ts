import type { ImportReport } from './report';
import { buildExamples, buildForms, deriveFormenStatus, indexAdd } from './transform';
import type {
  ChapterRow,
  EntryRow,
  ExampleRow,
  FormRow,
  Genus,
  RawBeispiel,
  RawForm,
  RawMember,
  RawNomen,
  RawNumberEntry,
  RawWordGroup,
  VocabularyChapterRow,
  Wortart,
} from './types';
import { type IdAllocator, normalizeLemma, normalizeWortart, slug } from './util';

export interface ChaptersResult {
  chapters: ChapterRow[];
  links: VocabularyChapterRow[];
  entries: EntryRow[];
  forms: FormRow[];
  examples: ExampleRow[];
}

type Adapted =
  | {
      kind: 'entry';
      lemma: string;
      wortart: Wortart;
      translationTr: string | null;
      hinweis: string | null;
      formen?: RawForm[];
      beispiele?: RawBeispiel[];
      nomen?: RawNomen;
    }
  | { kind: 'nested'; art: string; eintraege: RawNumberEntry[] }
  | { kind: 'skip'; reason: string };

function toGenus(g?: string | null): Genus | null {
  return g === 'maskulin' || g === 'feminin' || g === 'neutrum' ? g : null;
}

/** Erkennt die (10) heterogenen Mitglieder-Formen und bringt sie auf eine gemeinsame Form. */
function adaptMember(m: RawMember): Adapted {
  if (m.art && Array.isArray(m.eintraege)) {
    return { kind: 'nested', art: m.art, eintraege: m.eintraege };
  }
  if (m.lemma && m.wortart) {
    return {
      kind: 'entry',
      lemma: m.lemma,
      wortart: normalizeWortart(m.wortart) as Wortart,
      translationTr: m.tr ?? m.uebersetzung_tr ?? null,
      hinweis: null,
      formen: m.formen,
      beispiele: m.beispiele,
      nomen: typeof m.nomen === 'object' ? m.nomen : undefined,
    };
  }
  if (m.abkuerzung) {
    return {
      kind: 'entry',
      lemma: m.abkuerzung,
      wortart: 'wendung',
      translationTr: m.tr ?? null,
      hinweis: m.bedeutung ?? null,
    };
  }
  if (m.symbol && m.wort) {
    return {
      kind: 'entry',
      lemma: m.wort,
      wortart: 'nomen',
      translationTr: m.tr ?? null,
      hinweis: m.symbol,
    };
  }
  if (m.bezeichnung) {
    const noteStr = typeof m.note !== 'undefined' ? `Note ${m.note}` : null;
    const nomenStr = typeof m.nomen === 'string' ? m.nomen : null;
    const hinweis = [nomenStr, noteStr].filter(Boolean).join(' · ') || null;
    return {
      kind: 'entry',
      lemma: m.bezeichnung,
      wortart: 'nomen',
      translationTr: m.tr ?? null,
      hinweis,
    };
  }
  if (m.de) {
    return {
      kind: 'entry',
      lemma: m.de,
      wortart: 'wendung',
      translationTr: m.tr ?? null,
      hinweis: null,
    };
  }
  return { kind: 'skip', reason: `unbekannte Mitgliederstruktur: {${Object.keys(m).join(',')}}` };
}

function matchEntry(
  index: Map<string, EntryRow[]>,
  normalized: string,
  wortart: Wortart,
): EntryRow | undefined {
  const bucket = index.get(normalized);
  if (!bucket?.length) return undefined;
  return bucket.find((e) => e.wortart === wortart) ?? bucket[0];
}

/**
 * Legt einen synthetischen VocabularyEntry für ein Wortgruppen-Mitglied an
 * (source='wortgruppe') inkl. eigener Formen/Beispiele. Aktualisiert den Index.
 */
function createSyntheticEntry(
  a: Extract<Adapted, { kind: 'entry' }>,
  allocator: IdAllocator,
  index: Map<string, EntryRow[]>,
  report: ImportReport,
): { entry: EntryRow; forms: FormRow[]; examples: ExampleRow[] } {
  const id = allocator.allocate(`vocab_${slug(a.lemma)}_${a.wortart}`, a.nomen?.genus ?? undefined);
  const forms = a.formen ? buildForms(id, a.formen, report) : [];
  const examples = a.beispiele ? buildExamples(id, a.beispiele, report) : [];
  const entry: EntryRow = {
    id,
    lemma: a.lemma,
    normalizedLemma: normalizeLemma(a.lemma),
    wortart: a.wortart,
    translationTr: a.translationTr,
    hauptwort: null,
    artikel: a.nomen?.artikel ?? null,
    genus: toGenus(a.nomen?.genus),
    plural: a.nomen?.plural ?? null,
    pluralOriginal: a.nomen?.plural_original ?? null,
    nurPlural: a.nomen?.nur_plural ?? null,
    unzaehlbar: null,
    femininForm: null,
    hilfsverb: null,
    trennbar: null,
    reflexiv: null,
    verbRektion: null,
    steigerbar: null,
    praepositionRektion: null,
    formenStatus: deriveFormenStatus(a.wortart, forms),
    source: 'wortgruppe',
    hinweis: a.hinweis,
  };
  indexAdd(index, entry);
  return { entry, forms, examples };
}

/** Wortgruppen → Chapter(wortgruppe) + (gematchte oder neue) Einträge + Verknüpfungen. */
export function buildWordGroupChapters(
  wordGroups: RawWordGroup[],
  index: Map<string, EntryRow[]>,
  allocator: IdAllocator,
  report: ImportReport,
): ChaptersResult {
  const chapters: ChapterRow[] = [];
  const links: VocabularyChapterRow[] = [];
  const entries: EntryRow[] = [];
  const forms: FormRow[] = [];
  const examples: ExampleRow[] = [];
  const usedChapterIds = new Set<string>();

  const linkTo = (
    chapterId: string,
    entryId: string,
    linkedInChapter: Set<string>,
    order: { n: number },
  ): void => {
    if (linkedInChapter.has(entryId)) return;
    linkedInChapter.add(entryId);
    links.push({ id: `${chapterId}__${entryId}`, chapterId, entryId, sortOrder: order.n++ });
  };

  const resolveEntry = (a: Extract<Adapted, { kind: 'entry' }>): EntryRow => {
    const match = matchEntry(index, normalizeLemma(a.lemma), a.wortart);
    if (match) return match;
    const created = createSyntheticEntry(a, allocator, index, report);
    entries.push(created.entry);
    forms.push(...created.forms);
    examples.push(...created.examples);
    return created.entry;
  };

  wordGroups.forEach((group, groupIndex) => {
    let chapterId = `chapter_wg_${slug(group.gruppe)}`;
    let n = 2;
    while (usedChapterIds.has(chapterId)) chapterId = `chapter_wg_${slug(group.gruppe)}_${n++}`;
    usedChapterIds.add(chapterId);

    const linkedInChapter = new Set<string>();
    const order = { n: 0 };

    for (const raw of group.mitglieder) {
      const a = adaptMember(raw);
      if (a.kind === 'skip') {
        report.addSkippedMember(group.gruppe, a.reason);
        continue;
      }
      if (a.kind === 'nested') {
        for (const sub of a.eintraege) {
          if (!sub.wort) {
            report.addSkippedMember(group.gruppe, `verschachtelt ohne 'wort' (${a.art})`);
            continue;
          }
          const entry = resolveEntry({
            kind: 'entry',
            lemma: sub.wort,
            wortart: 'numerale',
            translationTr: sub.tr ?? null,
            hinweis: [
              a.art,
              sub.symbol ?? (typeof sub.zahl !== 'undefined' ? String(sub.zahl) : null),
            ]
              .filter(Boolean)
              .join(' · '),
          });
          linkTo(chapterId, entry.id, linkedInChapter, order);
        }
        continue;
      }
      const entry = resolveEntry(a);
      linkTo(chapterId, entry.id, linkedInChapter, order);
    }

    chapters.push({
      id: chapterId,
      chapterType: 'wortgruppe',
      title: group.gruppe,
      titleTr: group.uebersetzung_tr ?? null,
      description: null,
      sortOrder: groupIndex,
      memberCount: linkedInChapter.size,
    });
  });

  return { chapters, links, entries, forms, examples };
}

/** Alphabetische Auto-Kapitel („Vokabeln 001–050") über die Haupteinträge. */
export function buildAutoChapters(mainEntries: EntryRow[]): {
  chapters: ChapterRow[];
  links: VocabularyChapterRow[];
} {
  const sorted = [...mainEntries].sort((a, b) =>
    a.normalizedLemma.localeCompare(b.normalizedLemma, 'de'),
  );
  const chapters: ChapterRow[] = [];
  const links: VocabularyChapterRow[] = [];
  const size = 50;

  for (let i = 0; i * size < sorted.length; i++) {
    const chunk = sorted.slice(i * size, (i + 1) * size);
    const start = i * size + 1;
    const end = i * size + chunk.length;
    const chapterId = `chapter_auto_${String(i + 1).padStart(3, '0')}`;
    chapters.push({
      id: chapterId,
      chapterType: 'auto',
      title: `Vokabeln ${String(start).padStart(3, '0')}–${String(end).padStart(3, '0')}`,
      titleTr: null,
      description: null,
      sortOrder: i,
      memberCount: chunk.length,
    });
    chunk.forEach((e, j) =>
      links.push({ id: `${chapterId}__${e.id}`, chapterId, entryId: e.id, sortOrder: j }),
    );
  }

  return { chapters, links };
}
