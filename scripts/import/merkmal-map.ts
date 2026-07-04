import type {
  Anrede,
  FormKategorie,
  GenusVerbi,
  Grad,
  Kasus,
  Modus,
  Numerus,
  Tempus,
} from './types';

export interface MappedForm {
  kategorie: FormKategorie;
  kasus?: Kasus;
  numerus?: Numerus;
  tempus?: Tempus;
  modus?: Modus;
  genusVerbi?: GenusVerbi;
  person?: number;
  anrede?: Anrede;
  grad?: Grad;
}

const KASUS: Record<string, Kasus> = {
  Nominativ: 'nominativ',
  Genitiv: 'genitiv',
  Dativ: 'dativ',
  Akkusativ: 'akkusativ',
};

const TEMPUS: Record<string, Tempus> = {
  Präsens: 'praesens',
  Präteritum: 'praeteritum',
  Perfekt: 'perfekt',
  Plusquamperfekt: 'plusquamperfekt',
  'Futur I': 'futur1',
  'Futur II': 'futur2',
};

function personNumerus(token: string): { person?: number; numerus?: Numerus } {
  switch (token) {
    case 'ich':
      return { person: 1, numerus: 'singular' };
    case 'du':
      return { person: 2, numerus: 'singular' };
    case 'er/sie/es':
      return { person: 3, numerus: 'singular' };
    case 'wir':
      return { person: 1, numerus: 'plural' };
    case 'ihr':
      return { person: 2, numerus: 'plural' };
    case 'sie/Sie':
      return { person: 3, numerus: 'plural' };
    default:
      return {};
  }
}

/**
 * Bildet einen der 96 `merkmal`-Strings auf strukturierte Felder ab.
 * Unbekannte Strings → `{ kategorie: 'sonstige' }` (Aufrufer meldet sie im Report).
 * Reihenfolge: spezifischste Regel zuerst.
 */
export function mapMerkmal(merkmal: string): MappedForm {
  const m = merkmal.trim();

  // Steigerung / Grundform
  if (m === 'Grundform') return { kategorie: 'grundform', grad: 'positiv' };
  if (m === 'Komparativ') return { kategorie: 'steigerung', grad: 'komparativ' };
  if (m === 'Superlativ') return { kategorie: 'steigerung', grad: 'superlativ' };

  // Nicht-finite Verbformen
  if (m === 'Infinitiv') return { kategorie: 'grundform' };
  if (m === 'zu-Infinitiv') return { kategorie: 'zu_infinitiv' };
  if (m === 'Infinitiv Perfekt') return { kategorie: 'infinitiv_perfekt' };
  if (m === 'Partizip I') return { kategorie: 'partizip1' };
  if (m === 'Partizip II') return { kategorie: 'partizip2' };

  // Imperativ
  if (m.startsWith('Imperativ')) {
    const who = m.slice('Imperativ'.length).trim();
    if (who === 'du')
      return { kategorie: 'imperativ', anrede: 'du', person: 2, numerus: 'singular' };
    if (who === 'ihr')
      return { kategorie: 'imperativ', anrede: 'ihr', person: 2, numerus: 'plural' };
    if (who === 'Sie')
      return { kategorie: 'imperativ', anrede: 'sie_hoeflich', person: 3, numerus: 'plural' };
    return { kategorie: 'imperativ' };
  }

  // Nomen-Deklination (+ (feminin)/(maskulin) → weibliche_form)
  const decl = m.match(
    /^(Nominativ|Genitiv|Dativ|Akkusativ) (Singular|Plural)(?:\s*\((feminin|maskulin)\))?$/,
  );
  if (decl) {
    return {
      kategorie: decl[3] ? 'weibliche_form' : 'deklination',
      kasus: KASUS[decl[1]],
      numerus: decl[2] === 'Singular' ? 'singular' : 'plural',
    };
  }

  // Konjunktiv I/II (finit)
  const konj = m.match(/^Konjunktiv (I|II) (.+)$/);
  if (konj) {
    return {
      kategorie: 'konjugation',
      modus: konj[1] === 'I' ? 'konjunktiv1' : 'konjunktiv2',
      tempus: konj[1] === 'I' ? 'praesens' : 'praeteritum',
      genusVerbi: 'aktiv',
      ...personNumerus(konj[2]),
    };
  }

  // Passiv (finit)
  const pass = m.match(
    /^(Präsens|Präteritum|Perfekt|Plusquamperfekt|Futur I|Futur II) Passiv (.+)$/,
  );
  if (pass) {
    return {
      kategorie: 'konjugation',
      tempus: TEMPUS[pass[1]],
      modus: 'indikativ',
      genusVerbi: 'passiv',
      ...personNumerus(pass[2]),
    };
  }

  // Indikativ Aktiv: "<Tempus> <person>"
  const fin = m.match(
    /^(Präsens|Präteritum|Perfekt|Plusquamperfekt|Futur I|Futur II) (ich|du|er\/sie\/es|wir|ihr|sie\/Sie)$/,
  );
  if (fin) {
    return {
      kategorie: 'konjugation',
      tempus: TEMPUS[fin[1]],
      modus: 'indikativ',
      genusVerbi: 'aktiv',
      ...personNumerus(fin[2]),
    };
  }

  // Wortgruppen-Kurzparadigma: "3. Person Singular <Tempus>"
  const kurz = m.match(/^3\. Person Singular (Präsens|Präteritum|Perfekt)$/);
  if (kurz) {
    return {
      kategorie: 'konjugation',
      tempus: TEMPUS[kurz[1]],
      modus: 'indikativ',
      genusVerbi: 'aktiv',
      person: 3,
      numerus: 'singular',
    };
  }

  // Outlier (unveränderliche Wortarten in Wortgruppen)
  if (m.startsWith('Präposition')) return { kategorie: 'grundform' };
  if (m === 'Adverb' || m === 'Adverb / Indefinitpronomen' || m === 'Indefinitpronomen') {
    return { kategorie: 'grundform' };
  }

  return { kategorie: 'sonstige' };
}

const KASUS_IDX: Record<Kasus, number> = { nominativ: 0, genitiv: 1, dativ: 2, akkusativ: 3 };

/** Personordinal 0–5 (ich,du,er/sie/es,wir,ihr,sie/Sie) aus person+numerus. */
function personOrdinal(mapped: MappedForm): number {
  if (!mapped.person) return 0;
  return (mapped.numerus === 'plural' ? 3 : 0) + (mapped.person - 1);
}

/**
 * Paradigma-Reihenfolge (Masterplan §5, Kernformen zuerst). Ergibt einen
 * `sortOrder`-Integer je Form. `sonstige` bekommt vom Aufrufer eine laufende Nummer.
 */
export function formSortOrder(mapped: MappedForm): number {
  const p = personOrdinal(mapped);
  switch (mapped.kategorie) {
    case 'grundform':
      return 0;
    case 'steigerung':
      return mapped.grad === 'superlativ' ? 2 : mapped.grad === 'komparativ' ? 1 : 0;
    case 'deklination':
      return KASUS_IDX[mapped.kasus ?? 'nominativ'] * 2 + (mapped.numerus === 'plural' ? 1 : 0);
    case 'weibliche_form':
      return (
        100 + KASUS_IDX[mapped.kasus ?? 'nominativ'] * 2 + (mapped.numerus === 'plural' ? 1 : 0)
      );
    case 'imperativ':
      return 400 + (mapped.anrede === 'sie_hoeflich' ? 2 : mapped.anrede === 'ihr' ? 1 : 0);
    case 'partizip1':
      return 500;
    case 'partizip2':
      return 510;
    case 'zu_infinitiv':
      return 1400;
    case 'infinitiv_perfekt':
      return 1410;
    case 'konjugation': {
      if (mapped.genusVerbi === 'passiv') {
        const base =
          mapped.tempus === 'praeteritum' ? 1200 : mapped.tempus === 'perfekt' ? 1300 : 1100;
        return base + p;
      }
      if (mapped.modus === 'konjunktiv2') return 600 + p;
      if (mapped.modus === 'konjunktiv1') return 1000 + p;
      switch (mapped.tempus) {
        case 'praesens':
          return 100 + p;
        case 'praeteritum':
          return 200 + p;
        case 'perfekt':
          return 300 + p;
        case 'futur1':
          return 700 + p;
        case 'plusquamperfekt':
          return 800 + p;
        case 'futur2':
          return 900 + p;
        default:
          return 150 + p;
      }
    }
    default:
      return 9000;
  }
}

/** Die 96 bekannten Merkmal-Strings (für Coverage-Test & Doku). */
export const KNOWN_MERKMALE: readonly string[] = [
  'Nominativ Singular',
  'Genitiv Singular',
  'Dativ Singular',
  'Akkusativ Singular',
  'Nominativ Plural',
  'Genitiv Plural',
  'Dativ Plural',
  'Akkusativ Plural',
  'Grundform',
  'Infinitiv',
  'Präsens er/sie/es',
  'Präteritum er/sie/es',
  'Perfekt er/sie/es',
  'Plusquamperfekt er/sie/es',
  'Futur I er/sie/es',
  'Futur II er/sie/es',
  'Konjunktiv I er/sie/es',
  'Konjunktiv II er/sie/es',
  'Infinitiv Perfekt',
  'zu-Infinitiv',
  'Partizip I',
  'Partizip II',
  'Präsens ich',
  'Präsens du',
  'Präsens wir',
  'Präsens ihr',
  'Präsens sie/Sie',
  'Präteritum ich',
  'Präteritum du',
  'Präteritum wir',
  'Präteritum ihr',
  'Präteritum sie/Sie',
  'Perfekt ich',
  'Perfekt du',
  'Perfekt wir',
  'Perfekt ihr',
  'Perfekt sie/Sie',
  'Plusquamperfekt ich',
  'Plusquamperfekt du',
  'Plusquamperfekt wir',
  'Plusquamperfekt ihr',
  'Plusquamperfekt sie/Sie',
  'Futur I ich',
  'Futur I du',
  'Futur I wir',
  'Futur I ihr',
  'Futur I sie/Sie',
  'Futur II ich',
  'Futur II du',
  'Futur II wir',
  'Futur II ihr',
  'Futur II sie/Sie',
  'Konjunktiv I ich',
  'Konjunktiv I du',
  'Konjunktiv I wir',
  'Konjunktiv I ihr',
  'Konjunktiv I sie/Sie',
  'Konjunktiv II ich',
  'Konjunktiv II du',
  'Konjunktiv II wir',
  'Konjunktiv II ihr',
  'Konjunktiv II sie/Sie',
  'Imperativ du',
  'Imperativ ihr',
  'Imperativ Sie',
  'Präsens Passiv er/sie/es',
  'Präsens Passiv sie/Sie',
  'Präteritum Passiv er/sie/es',
  'Präteritum Passiv sie/Sie',
  'Perfekt Passiv er/sie/es',
  'Perfekt Passiv sie/Sie',
  'Komparativ',
  'Superlativ',
  'Nominativ Singular (feminin)',
  'Nominativ Plural (feminin)',
  'Genitiv Singular (feminin)',
  'Dativ Singular (feminin)',
  'Akkusativ Singular (feminin)',
  'Genitiv Plural (feminin)',
  'Dativ Plural (feminin)',
  'Akkusativ Plural (feminin)',
  'Nominativ Singular (maskulin)',
  'Nominativ Plural (maskulin)',
  'Genitiv Singular (maskulin)',
  'Dativ Singular (maskulin)',
  'Akkusativ Singular (maskulin)',
  'Genitiv Plural (maskulin)',
  'Dativ Plural (maskulin)',
  'Akkusativ Plural (maskulin)',
  'Adverb',
  '3. Person Singular Präsens',
  '3. Person Singular Präteritum',
  'Präposition (+Dativ/Akkusativ)',
  'Adverb / Indefinitpronomen',
  'Indefinitpronomen',
  '3. Person Singular Perfekt',
];
