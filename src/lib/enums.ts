// Enum-Literal-Typen, gespiegelt aus amplify/data/resource.ts. Bewusst ohne
// Amplify-Import, damit reine Module (grouping.ts, vocab.ts) in Jest ohne
// native Abhängigkeiten testbar bleiben.

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
export type VocabularyStatus = 'neu' | 'nicht_gewusst' | 'schwer' | 'kann_ich' | 'sicher';
export type Rating = 'nicht_gewusst' | 'schwer' | 'kann_ich' | 'sicher';
export type SessionType = 'lernen' | 'test';
