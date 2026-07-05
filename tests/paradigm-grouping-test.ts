import { describe, expect, it } from '@jest/globals';

import {
  buildComparison,
  buildDeclension,
  buildFiniteTable,
  isFallbackForms,
  type ParadigmForm,
} from '@/components/vocab/paradigm/grouping';
import { genusOf, isDue, normalizeSearch, statusOf } from '@/lib/vocab';

function pf(
  p: Partial<ParadigmForm> & Pick<ParadigmForm, 'form' | 'merkmalText' | 'kategorie'>,
): ParadigmForm {
  return { sortOrder: 0, ...p };
}

const KASUS = ['nominativ', 'genitiv', 'dativ', 'akkusativ'] as const;

function nounForms(): ParadigmForm[] {
  const out: ParadigmForm[] = [];
  for (const kasus of KASUS) {
    for (const numerus of ['singular', 'plural'] as const) {
      out.push(
        pf({
          form: `${kasus}-${numerus}`,
          merkmalText: 'x',
          kategorie: 'deklination',
          kasus,
          numerus,
        }),
      );
    }
  }
  return out;
}

describe('buildDeclension', () => {
  it('builds a 4x2 table', () => {
    const v = buildDeclension(nounForms());
    expect(v?.rows).toHaveLength(4);
    expect(v?.showSingular).toBe(true);
    expect(v?.showPlural).toBe(true);
    expect(v?.singleColumn).toBe(false);
    expect(v?.rows[0].kasus).toBe('nominativ');
  });

  it('collapses to a single column for plural-only nouns', () => {
    const pluralOnly = nounForms().filter((f) => f.numerus === 'plural');
    const v = buildDeclension(pluralOnly);
    expect(v?.singleColumn).toBe(true);
    expect(v?.showSingular).toBe(false);
  });

  it('returns null without declension forms', () => {
    expect(
      buildDeclension([pf({ form: 'x', merkmalText: 'x', kategorie: 'grundform' })]),
    ).toBeNull();
  });
});

describe('buildFiniteTable', () => {
  function praesens(): ParadigmForm[] {
    const persons: [number, 'singular' | 'plural'][] = [
      [1, 'singular'],
      [2, 'singular'],
      [3, 'singular'],
      [1, 'plural'],
      [2, 'plural'],
      [3, 'plural'],
    ];
    return persons.map(([person, numerus]) =>
      pf({
        form: `f${person}${numerus}`,
        merkmalText: 'x',
        kategorie: 'konjugation',
        tempus: 'praesens',
        modus: 'indikativ',
        genusVerbi: 'aktiv',
        person,
        numerus,
      }),
    );
  }

  it('returns 6 rows in pronoun order for a full present tense', () => {
    const rows = buildFiniteTable(praesens(), {
      tempus: 'praesens',
      modus: 'indikativ',
      genusVerbi: 'aktiv',
    });
    expect(rows).toHaveLength(6);
    expect(rows?.map((r) => r.pronoun)).toEqual([
      'ich',
      'du',
      'er/sie/es',
      'wir',
      'ihr',
      'sie/Sie',
    ]);
  });

  it('returns only 3.Sg/3.Pl for passive (2 rows)', () => {
    const passive = [
      pf({
        form: 'wird',
        merkmalText: 'x',
        kategorie: 'konjugation',
        tempus: 'praesens',
        modus: 'indikativ',
        genusVerbi: 'passiv',
        person: 3,
        numerus: 'singular',
      }),
      pf({
        form: 'werden',
        merkmalText: 'x',
        kategorie: 'konjugation',
        tempus: 'praesens',
        modus: 'indikativ',
        genusVerbi: 'passiv',
        person: 3,
        numerus: 'plural',
      }),
    ];
    const rows = buildFiniteTable(passive, {
      tempus: 'praesens',
      modus: 'indikativ',
      genusVerbi: 'passiv',
    });
    expect(rows).toHaveLength(2);
  });

  it('selects Konjunktiv by modus, ignoring the synthetic tempus', () => {
    const konj = pf({
      form: 'ginge',
      merkmalText: 'x',
      kategorie: 'konjugation',
      tempus: 'praeteritum',
      modus: 'konjunktiv2',
      genusVerbi: 'aktiv',
      person: 3,
      numerus: 'singular',
    });
    const indik = pf({
      form: 'ging',
      merkmalText: 'x',
      kategorie: 'konjugation',
      tempus: 'praeteritum',
      modus: 'indikativ',
      genusVerbi: 'aktiv',
      person: 3,
      numerus: 'singular',
    });
    const rows = buildFiniteTable([konj, indik], { modus: 'konjunktiv2', genusVerbi: 'aktiv' });
    expect(rows).toHaveLength(1);
    expect(rows?.[0].form.form).toBe('ginge');
  });
});

describe('buildComparison', () => {
  it('builds 3 rows for a comparable adjective', () => {
    const forms = [
      pf({ form: 'schnell', merkmalText: 'x', kategorie: 'grundform', grad: 'positiv' }),
      pf({ form: 'schneller', merkmalText: 'x', kategorie: 'steigerung', grad: 'komparativ' }),
      pf({ form: 'am schnellsten', merkmalText: 'x', kategorie: 'steigerung', grad: 'superlativ' }),
    ];
    expect(buildComparison(forms)).toHaveLength(3);
  });

  it('collapses to 1 row for a non-comparable word', () => {
    expect(
      buildComparison([pf({ form: 'oft', merkmalText: 'x', kategorie: 'grundform' })]),
    ).toHaveLength(1);
  });
});

describe('isFallbackForms', () => {
  it('is true for formenStatus basis', () => {
    expect(
      isFallbackForms([pf({ form: 'x', merkmalText: 'x', kategorie: 'deklination' })], 'basis'),
    ).toBe(true);
  });
  it('is true when all forms are sonstige', () => {
    expect(
      isFallbackForms([pf({ form: 'x', merkmalText: 'x', kategorie: 'sonstige' })], 'vollstaendig'),
    ).toBe(true);
  });
  it('is false for a normal paradigm', () => {
    expect(isFallbackForms(nounForms(), 'vollstaendig')).toBe(false);
  });
});

describe('vocab helpers', () => {
  it('defaults status to neu', () => {
    expect(statusOf(undefined)).toBe('neu');
    expect(statusOf({ status: 'sicher' })).toBe('sicher');
  });
  it('detects due dates', () => {
    expect(isDue({ dueAt: '2000-01-01T00:00:00.000Z' })).toBe(true);
    expect(isDue({ dueAt: '2999-01-01T00:00:00.000Z' })).toBe(false);
    expect(isDue(null)).toBe(false);
  });
  it('derives genus from article', () => {
    expect(genusOf({ artikel: 'der' })).toBe('maskulin');
    expect(genusOf({ artikel: 'die' })).toBe('feminin');
    expect(genusOf({ genus: 'neutrum' })).toBe('neutrum');
    expect(genusOf({ artikel: null })).toBeNull();
  });
  it('normalizes search terms (umlauts, case)', () => {
    expect(normalizeSearch('Fußgänger')).toBe('fussganger');
    expect(normalizeSearch('Größe')).toBe('grosse');
  });
});
