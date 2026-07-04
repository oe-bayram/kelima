// Zentrale Typen für das Import-Skript (spiegeln die Amplify-Enums als
// String-Literal-Unions, damit transform/merkmal-map ohne Amplify-Import typechecken).

export type Wortart =
  | 'nomen'
  | 'verb'
  | 'adjektiv'
  | 'adverb'
  | 'praeposition'
  | 'konjunktion'
  | 'pronomen'
  | 'wendung'
  | 'partikel'
  | 'interjektion'
  | 'numerale';

export type Genus = 'maskulin' | 'feminin' | 'neutrum';
export type FormenStatus = 'basis' | 'vollstaendig';
export type FormKategorie =
  | 'grundform'
  | 'deklination'
  | 'konjugation'
  | 'imperativ'
  | 'partizip1'
  | 'partizip2'
  | 'zu_infinitiv'
  | 'infinitiv_perfekt'
  | 'steigerung'
  | 'weibliche_form'
  | 'sonstige';
export type Kasus = 'nominativ' | 'genitiv' | 'dativ' | 'akkusativ';
export type Numerus = 'singular' | 'plural';
export type Tempus =
  'praesens' | 'praeteritum' | 'perfekt' | 'plusquamperfekt' | 'futur1' | 'futur2';
export type Modus = 'indikativ' | 'konjunktiv1' | 'konjunktiv2';
export type GenusVerbi = 'aktiv' | 'passiv';
export type Anrede = 'du' | 'ihr' | 'sie_hoeflich';
export type Grad = 'positiv' | 'komparativ' | 'superlativ';
export type ChapterType = 'wortgruppe' | 'auto' | 'manuell';

// ---------------------------------------------------------------------------
// Rohdaten (JSON) — bewusst locker; zod validiert, transform liest roh.
// ---------------------------------------------------------------------------
export interface RawForm {
  form: string;
  merkmal: string;
  tr?: string | null;
}
export interface RawBeispiel {
  de: string;
  tr?: string | null;
}
export interface RawWeiblich {
  lemma?: string;
  artikel?: string | null;
  plural?: string | null;
  plural_original?: string | null;
}
export interface RawNomen {
  artikel?: string | null;
  genus?: string | null;
  plural?: string | null;
  plural_original?: string | null;
  nur_plural?: boolean;
  weiblich?: RawWeiblich;
}
export interface RawVerb {
  trennbar?: boolean;
  hilfsverb?: string | null;
  reflexiv?: boolean;
  rektion?: string | null;
  konjugation?: Record<string, string>;
}
export interface RawEntry {
  lemma: string;
  wortart: string;
  uebersetzung_tr?: string | null;
  hauptwort?: string | null;
  formen: RawForm[];
  beispiele: RawBeispiel[];
  nomen?: RawNomen;
  verb?: RawVerb;
}
export interface RawNumberEntry {
  zahl?: string | number;
  wort?: string;
  symbol?: string;
  tr?: string | null;
  hinweis?: string;
}
export interface RawMember {
  lemma?: string;
  wortart?: string;
  uebersetzung_tr?: string | null;
  tr?: string | null;
  nomen?: RawNomen;
  verb?: RawVerb;
  formen?: RawForm[];
  beispiele?: RawBeispiel[];
  abkuerzung?: string;
  bedeutung?: string;
  symbol?: string;
  wort?: string;
  bezeichnung?: string;
  note?: number;
  de?: string;
  art?: string;
  eintraege?: RawNumberEntry[];
}
export interface RawWordGroup {
  typ?: string;
  gruppe: string;
  uebersetzung_tr?: string | null;
  mitglieder: RawMember[];
}
export interface RawSource {
  metadata?: Record<string, unknown>;
  eintraege: RawEntry[];
  wortgruppen: RawWordGroup[];
}

// ---------------------------------------------------------------------------
// Ziel-Zeilen (werden über den Amplify Data Client geschrieben)
// ---------------------------------------------------------------------------
export interface EntryRow {
  id: string;
  lemma: string;
  normalizedLemma: string;
  wortart: Wortart;
  translationTr?: string | null;
  hauptwort?: string | null;
  artikel?: string | null;
  genus?: Genus | null;
  plural?: string | null;
  pluralOriginal?: string | null;
  nurPlural?: boolean | null;
  unzaehlbar?: boolean | null;
  femininForm?: string | null;
  hilfsverb?: string | null;
  trennbar?: boolean | null;
  reflexiv?: boolean | null;
  verbRektion?: string | null;
  steigerbar?: boolean | null;
  praepositionRektion?: string | null;
  formenStatus?: FormenStatus | null;
  source?: string | null;
  hinweis?: string | null;
}
export interface FormRow {
  id: string;
  entryId: string;
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
export interface ExampleRow {
  id: string;
  entryId: string;
  textDe: string;
  textTr?: string | null;
  sortOrder: number;
}
export interface ChapterRow {
  id: string;
  chapterType: ChapterType;
  title: string;
  titleTr?: string | null;
  description?: string | null;
  sortOrder: number;
  memberCount?: number | null;
}
export interface VocabularyChapterRow {
  id: string;
  chapterId: string;
  entryId: string;
  sortOrder: number;
}

export type ContentModelName =
  | 'VocabularyEntry'
  | 'VocabularyForm'
  | 'VocabularyExample'
  | 'Chapter'
  | 'VocabularyChapter'
  | 'ContentVersion';
