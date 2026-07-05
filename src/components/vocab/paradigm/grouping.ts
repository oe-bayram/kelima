import type {
  Anrede,
  FormKategorie,
  GenusVerbi,
  Grad,
  Kasus,
  Modus,
  Numerus,
  Tempus,
} from '@/lib/enums';

// Reine, rendering-freie Gruppierungslogik für die Paradigma-Tabellen (Masterplan §5).
// Keine react/react-native/amplify-Imports → in Jest über @/… testbar.

export interface ParadigmForm {
  form: string;
  merkmalText: string;
  translationTr?: string | null;
  kategorie: FormKategorie;
  kasus?: Kasus | null;
  numerus?: Numerus | null;
  tempus?: Tempus | null;
  modus?: Modus | null;
  genusVerbi?: GenusVerbi | null;
  person?: number | null;
  anrede?: Anrede | null;
  grad?: Grad | null;
  sortOrder: number;
}

export const KASUS_ORDER: readonly Kasus[] = ['nominativ', 'genitiv', 'dativ', 'akkusativ'];

export const PERSONS: readonly { person: number; numerus: Numerus; pronoun: string }[] = [
  { person: 1, numerus: 'singular', pronoun: 'ich' },
  { person: 2, numerus: 'singular', pronoun: 'du' },
  { person: 3, numerus: 'singular', pronoun: 'er/sie/es' },
  { person: 1, numerus: 'plural', pronoun: 'wir' },
  { person: 2, numerus: 'plural', pronoun: 'ihr' },
  { person: 3, numerus: 'plural', pronoun: 'sie/Sie' },
];

export const IMPERATIV_ORDER: readonly Anrede[] = ['du', 'ihr', 'sie_hoeflich'];

// --- Deklination (Nomen / weibliche Form) --------------------------------
export interface DeclCell {
  kasus: Kasus;
  singular: ParadigmForm | null;
  plural: ParadigmForm | null;
}
export interface DeclensionView {
  rows: DeclCell[];
  showSingular: boolean;
  showPlural: boolean;
  singleColumn: boolean;
}

export function buildDeclension(
  forms: ParadigmForm[],
  opts: { feminine?: boolean } = {},
): DeclensionView | null {
  const kategorie: FormKategorie = opts.feminine ? 'weibliche_form' : 'deklination';
  const cells = forms.filter((f) => f.kategorie === kategorie);
  if (cells.length === 0) return null;
  const rows: DeclCell[] = KASUS_ORDER.map((k) => ({
    kasus: k,
    singular: cells.find((f) => f.kasus === k && f.numerus === 'singular') ?? null,
    plural: cells.find((f) => f.kasus === k && f.numerus === 'plural') ?? null,
  })).filter((r) => r.singular || r.plural);
  if (rows.length === 0) return null;
  const showSingular = rows.some((r) => r.singular);
  const showPlural = rows.some((r) => r.plural);
  return { rows, showSingular, showPlural, singleColumn: showSingular !== showPlural };
}

// --- Finite Verbformen ----------------------------------------------------
export interface FiniteRow {
  person: number;
  numerus: Numerus;
  pronoun: string;
  form: ParadigmForm;
}

/**
 * Selektiert eine finite Tabelle. Für Konjunktiv `tempus` WEGLASSEN (Import
 * speichert Konjunktiv als modus=konjunktiv1|2 mit synthetischem tempus).
 * Passiv liefert nur 3.Sg/3.Pl → 2 Zeilen.
 */
export function buildFiniteTable(
  forms: ParadigmForm[],
  sel: { tempus?: Tempus; modus: Modus; genusVerbi: GenusVerbi },
): FiniteRow[] | null {
  const pool = forms.filter(
    (f) =>
      f.kategorie === 'konjugation' &&
      (sel.tempus === undefined || f.tempus === sel.tempus) &&
      (f.modus ?? 'indikativ') === sel.modus &&
      (f.genusVerbi ?? 'aktiv') === sel.genusVerbi,
  );
  const rows = PERSONS.map((p) => {
    const form = pool.find((f) => f.person === p.person && f.numerus === p.numerus);
    return form ? { person: p.person, numerus: p.numerus, pronoun: p.pronoun, form } : null;
  }).filter((r): r is FiniteRow => r !== null);
  return rows.length ? rows : null;
}

export function findFinite(
  forms: ParadigmForm[],
  sel: { tempus: Tempus; person: number; numerus: Numerus },
): ParadigmForm | null {
  return (
    forms.find(
      (f) =>
        f.kategorie === 'konjugation' &&
        (f.modus ?? 'indikativ') === 'indikativ' &&
        (f.genusVerbi ?? 'aktiv') === 'aktiv' &&
        f.tempus === sel.tempus &&
        f.person === sel.person &&
        f.numerus === sel.numerus,
    ) ?? null
  );
}

export function findByKategorie(
  forms: ParadigmForm[],
  kategorie: FormKategorie,
): ParadigmForm | null {
  return forms.find((f) => f.kategorie === kategorie) ?? null;
}

export function buildImperative(forms: ParadigmForm[]): ParadigmForm[] {
  const imp = forms.filter((f) => f.kategorie === 'imperativ');
  return IMPERATIV_ORDER.map((a) => imp.find((f) => f.anrede === a)).filter(
    (f): f is ParadigmForm => !!f,
  );
}

// --- Steigerung (Adjektiv / Adverb) ---------------------------------------
export interface ComparisonRow {
  grad: Grad;
  form: ParadigmForm;
}

export function buildComparison(forms: ParadigmForm[]): ComparisonRow[] | null {
  const grades: Grad[] = ['positiv', 'komparativ', 'superlativ'];
  const rows = grades
    .map((g) => {
      const form =
        forms.find((f) => f.grad === g) ??
        (g === 'positiv' ? forms.find((f) => f.kategorie === 'grundform') : undefined);
      return form ? { grad: g, form } : null;
    })
    .filter((r): r is ComparisonRow => r !== null);
  return rows.length ? rows : null;
}

/** Wortart-unabhängiger Fallback: keine strukturierten Formen nutzbar. */
export function isFallbackForms(forms: ParadigmForm[], formenStatus?: string | null): boolean {
  return (
    formenStatus === 'basis' || forms.length === 0 || forms.every((f) => f.kategorie === 'sonstige')
  );
}
