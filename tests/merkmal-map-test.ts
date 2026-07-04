import { describe, expect, it } from '@jest/globals';

import { KNOWN_MERKMALE, mapMerkmal } from '../scripts/import/merkmal-map';

describe('mapMerkmal', () => {
  it('maps all 96 known merkmal strings to a known category (never sonstige)', () => {
    const unmapped = KNOWN_MERKMALE.filter((m) => mapMerkmal(m).kategorie === 'sonstige');
    expect(unmapped).toEqual([]);
  });

  it('maps noun declension', () => {
    expect(mapMerkmal('Genitiv Plural')).toMatchObject({
      kategorie: 'deklination',
      kasus: 'genitiv',
      numerus: 'plural',
    });
  });

  it('routes feminine declension to weibliche_form', () => {
    expect(mapMerkmal('Nominativ Singular (feminin)')).toMatchObject({
      kategorie: 'weibliche_form',
      kasus: 'nominativ',
      numerus: 'singular',
    });
  });

  it('maps a finite indicative verb form', () => {
    expect(mapMerkmal('Perfekt ich')).toMatchObject({
      kategorie: 'konjugation',
      tempus: 'perfekt',
      modus: 'indikativ',
      genusVerbi: 'aktiv',
      person: 1,
      numerus: 'singular',
    });
  });

  it('maps passive forms', () => {
    expect(mapMerkmal('Präsens Passiv er/sie/es')).toMatchObject({
      kategorie: 'konjugation',
      tempus: 'praesens',
      genusVerbi: 'passiv',
      person: 3,
      numerus: 'singular',
    });
  });

  it('maps Konjunktiv II', () => {
    expect(mapMerkmal('Konjunktiv II du')).toMatchObject({
      kategorie: 'konjugation',
      modus: 'konjunktiv2',
      person: 2,
    });
  });

  it('maps polite imperative', () => {
    expect(mapMerkmal('Imperativ Sie')).toMatchObject({
      kategorie: 'imperativ',
      anrede: 'sie_hoeflich',
    });
  });

  it('flags truly unknown merkmal as sonstige', () => {
    expect(mapMerkmal('Total Nonsense').kategorie).toBe('sonstige');
  });
});
