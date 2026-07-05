import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Vollständiges Datenschema (Masterplan §4) — Phase 2.
 *
 * Content-Modelle: eingeloggte Nutzer lesen, Gruppe `admin` (Import) schreibt.
 * User-Modelle: owner-basiert (jeder Nutzer nur eigene Daten). Enums ohne
 * Umlaute (GraphQL-Vorgabe); `wortart` wird beim Import normalisiert
 * (`präposition` → `praeposition`).
 *
 * @see https://docs.amplify.aws/react-native/build-a-backend/data/
 */
const schema = a.schema({
  // ---------------------------------------------------------------------------
  // Enums
  // ---------------------------------------------------------------------------
  Wortart: a.enum([
    'nomen',
    'verb',
    'adjektiv',
    'adverb',
    'praeposition',
    'konjunktion',
    'pronomen',
    'wendung',
    'partikel',
    'interjektion',
    'numerale',
  ]),
  Genus: a.enum(['maskulin', 'feminin', 'neutrum']),
  FormenStatus: a.enum(['basis', 'vollstaendig']),
  FormKategorie: a.enum([
    'grundform',
    'deklination',
    'konjugation',
    'imperativ',
    'partizip1',
    'partizip2',
    'zu_infinitiv',
    'infinitiv_perfekt',
    'steigerung',
    'weibliche_form',
    'sonstige',
  ]),
  Kasus: a.enum(['nominativ', 'genitiv', 'dativ', 'akkusativ']),
  Numerus: a.enum(['singular', 'plural']),
  Tempus: a.enum(['praesens', 'praeteritum', 'perfekt', 'plusquamperfekt', 'futur1', 'futur2']),
  Modus: a.enum(['indikativ', 'konjunktiv1', 'konjunktiv2']),
  GenusVerbi: a.enum(['aktiv', 'passiv']),
  Anrede: a.enum(['du', 'ihr', 'sie_hoeflich']),
  Grad: a.enum(['positiv', 'komparativ', 'superlativ']),
  ChapterType: a.enum(['wortgruppe', 'auto', 'manuell']),
  VocabularyStatus: a.enum(['neu', 'nicht_gewusst', 'schwer', 'kann_ich', 'sicher']),
  SessionType: a.enum(['lernen', 'test']),
  Rating: a.enum(['nicht_gewusst', 'schwer', 'kann_ich', 'sicher']),

  // ---------------------------------------------------------------------------
  // Content-Modelle (read: authenticated, write: admin)
  // ---------------------------------------------------------------------------
  VocabularyEntry: a
    .model({
      lemma: a.string().required(),
      normalizedLemma: a.string().required(),
      wortart: a.ref('Wortart').required(),
      translationTr: a.string(),
      hauptwort: a.string(),
      // Nomen
      artikel: a.string(),
      genus: a.ref('Genus'),
      plural: a.string(),
      pluralOriginal: a.string(),
      nurPlural: a.boolean(),
      unzaehlbar: a.boolean(),
      femininForm: a.string(),
      // Verb
      hilfsverb: a.string(),
      trennbar: a.boolean(),
      reflexiv: a.boolean(),
      verbRektion: a.string(),
      // Adjektiv
      steigerbar: a.boolean(),
      // Präposition
      praepositionRektion: a.string(),
      // Meta
      formenStatus: a.ref('FormenStatus'),
      source: a.string(), // "generated" | "wortgruppe"
      hinweis: a.string(),
    })
    .secondaryIndexes((index) => [
      index('normalizedLemma').queryField('listEntriesByNormalizedLemma'),
    ])
    .authorization((allow) => [allow.authenticated().to(['read']), allow.group('admin')]),

  VocabularyForm: a
    .model({
      entryId: a.id().required(),
      form: a.string().required(),
      merkmalText: a.string().required(),
      translationTr: a.string(),
      kategorie: a.ref('FormKategorie').required(),
      kasus: a.ref('Kasus'),
      numerus: a.ref('Numerus'),
      tempus: a.ref('Tempus'),
      modus: a.ref('Modus'),
      genusVerbi: a.ref('GenusVerbi'),
      person: a.integer(),
      anrede: a.ref('Anrede'),
      grad: a.ref('Grad'),
      sortOrder: a.integer().required(),
    })
    .secondaryIndexes((index) => [
      index('entryId').sortKeys(['sortOrder']).queryField('listFormsByEntry'),
    ])
    .authorization((allow) => [allow.authenticated().to(['read']), allow.group('admin')]),

  VocabularyExample: a
    .model({
      entryId: a.id().required(),
      textDe: a.string().required(),
      textTr: a.string(),
      sortOrder: a.integer().required(),
    })
    .secondaryIndexes((index) => [
      index('entryId').sortKeys(['sortOrder']).queryField('listExamplesByEntry'),
    ])
    .authorization((allow) => [allow.authenticated().to(['read']), allow.group('admin')]),

  Chapter: a
    .model({
      chapterType: a.ref('ChapterType').required(),
      title: a.string().required(),
      titleTr: a.string(),
      description: a.string(),
      sortOrder: a.integer().required(),
      memberCount: a.integer(),
    })
    .authorization((allow) => [allow.authenticated().to(['read']), allow.group('admin')]),

  VocabularyChapter: a
    .model({
      chapterId: a.id().required(),
      entryId: a.id().required(),
      sortOrder: a.integer().required(),
    })
    .secondaryIndexes((index) => [
      index('chapterId').sortKeys(['sortOrder']).queryField('listEntriesByChapter'),
      index('entryId').queryField('listChaptersByEntry'),
    ])
    .authorization((allow) => [allow.authenticated().to(['read']), allow.group('admin')]),

  ContentVersion: a
    .model({
      version: a.integer().required(),
      label: a.string(),
      importedAt: a.datetime(),
      sourceFile: a.string(),
      entriesCount: a.integer(),
      formsCount: a.integer(),
      examplesCount: a.integer(),
      chaptersCount: a.integer(),
      importDurationMs: a.integer(),
    })
    .authorization((allow) => [allow.authenticated().to(['read']), allow.group('admin')]),

  // ---------------------------------------------------------------------------
  // User-Modelle (owner-basiert) — genutzt ab Phase 4
  // ---------------------------------------------------------------------------
  UserVocabularyProgress: a
    .model({
      entryId: a.id().required(),
      status: a.ref('VocabularyStatus'),
      dueAt: a.datetime(),
      intervalDays: a.integer(),
      // Zähler
      seenCount: a.integer(), // in Lernsessions gezeigt/bewertet
      testCount: a.integer(), // in Testsessions beantwortet
      correctCount: a.integer(), // kann_ich | sicher
      wrongCount: a.integer(), // nicht_gewusst
      hardCount: a.integer(), // schwer
      // Zeitstempel
      lastSeenAt: a.datetime(), // letzte Lernsession
      lastTestedAt: a.datetime(), // letzte Testsession
      lastRatingAt: a.datetime(), // letzte Bewertung (beliebig)
      lastRating: a.ref('Rating'),
    })
    .secondaryIndexes((index) => [index('entryId').queryField('listProgressByEntry')])
    .authorization((allow) => [allow.owner()]),

  LearningSession: a
    .model({
      sessionType: a.ref('SessionType').required(),
      chapterId: a.string(),
      startedAt: a.datetime(),
      endedAt: a.datetime(),
      totalCount: a.integer(),
      correctCount: a.integer(),
    })
    .authorization((allow) => [allow.owner()]),

  LearningSessionItem: a
    .model({
      sessionId: a.id().required(),
      entryId: a.id().required(),
      rating: a.ref('Rating'),
      shownAt: a.datetime(),
      answeredAt: a.datetime(),
      clientTimestamp: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('sessionId').sortKeys(['answeredAt']).queryField('listItemsBySession'),
    ])
    .authorization((allow) => [allow.owner()]),

  UserFavoriteVocabulary: a
    .model({
      entryId: a.id().required(),
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [index('entryId').queryField('listFavoritesByEntry')])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
