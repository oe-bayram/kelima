import { generateClient } from 'aws-amplify/data';

import type { Schema } from '../../amplify/data/resource';
import type { ImportReport } from './report';
import type {
  ChapterRow,
  ContentModelName,
  EntryRow,
  ExampleRow,
  FormRow,
  VocabularyChapterRow,
} from './types';
import { pLimit, sleep } from './util';

export type DataClient = ReturnType<typeof generateClient<Schema>>;

export function makeClient(): DataClient {
  return generateClient<Schema>({ authMode: 'userPool' });
}

// Der generierte Client-Typ ist zu komplex, um ihn generisch zu indexieren –
// wir arbeiten mit einer schmalen strukturellen Schnittstelle.
interface GqlResult {
  data?: unknown;
  errors?: { message?: string }[];
  nextToken?: string | null;
}
interface AnyModel {
  list: (args: {
    selectionSet: string[];
    limit?: number;
    nextToken?: string | null;
  }) => Promise<{
    data: { id: string }[];
    nextToken?: string | null;
    errors?: { message?: string }[];
  }>;
  create: (input: object) => Promise<GqlResult>;
  update: (input: object) => Promise<GqlResult>;
}

export interface WriteData {
  entries: EntryRow[];
  forms: FormRow[];
  examples: ExampleRow[];
  chapters: ChapterRow[];
  vocabularyChapters: VocabularyChapterRow[];
}

function msg(errors?: { message?: string }[]): string {
  return (errors ?? []).map((e) => e.message ?? '').join('; ');
}

function isThrottle(errors?: { message?: string }[]): boolean {
  return (errors ?? []).some((e) =>
    /throttl|toomanyrequests|serviceunavailable|provisionedthroughput|rate exceeded/i.test(
      e.message ?? '',
    ),
  );
}

function isConflict(errors?: { message?: string }[]): boolean {
  return (errors ?? []).some((e) =>
    /conditionalcheckfailed|already exists|conditional request failed/i.test(e.message ?? ''),
  );
}

function isRetryableThrow(e: unknown): boolean {
  return /network|timeout|throttl|econn|socket|fetch failed|enotfound/i.test(String(e));
}

async function backoff(attempt: number): Promise<void> {
  const base = Math.min(2 ** attempt * 100, 5000);
  await sleep(base + Math.floor(Math.random() * 100));
}

async function withRetry(fn: () => Promise<GqlResult>, max = 5): Promise<GqlResult> {
  let attempt = 0;
  for (;;) {
    try {
      const res = await fn();
      if (res.errors?.length && isThrottle(res.errors) && attempt < max) {
        attempt++;
        await backoff(attempt);
        continue;
      }
      return res;
    } catch (e) {
      if (attempt < max && isRetryableThrow(e)) {
        attempt++;
        await backoff(attempt);
        continue;
      }
      throw e;
    }
  }
}

async function listExistingIds(model: AnyModel): Promise<Set<string>> {
  const ids = new Set<string>();
  let nextToken: string | null | undefined;
  do {
    const res = await model.list({ selectionSet: ['id'], limit: 1000, nextToken });
    if (res.errors?.length) throw new Error(`list failed: ${msg(res.errors)}`);
    for (const r of res.data) ids.add(r.id);
    nextToken = res.nextToken;
  } while (nextToken);
  return ids;
}

async function upsertRow(
  model: AnyModel,
  modelName: ContentModelName,
  row: { id: string },
  existing: Set<string>,
  report: ImportReport,
): Promise<void> {
  const counters = report.count(modelName);
  try {
    if (existing.has(row.id)) {
      const res = await withRetry(() => model.update(row));
      if (res.errors?.length) report.addError(modelName, msg(res.errors));
      else counters.updated++;
      return;
    }
    const res = await withRetry(() => model.create(row));
    if (!res.errors?.length) {
      counters.created++;
      return;
    }
    if (isConflict(res.errors)) {
      const up = await withRetry(() => model.update(row));
      if (up.errors?.length) report.addError(modelName, msg(up.errors));
      else counters.updated++;
      return;
    }
    report.addError(modelName, msg(res.errors));
  } catch (e) {
    report.addError(modelName, String(e));
  }
}

/** Schreibt alle Zeilen idempotent (pre-list → create/update) mit Concurrency + Retry. */
export async function writeAll(
  client: DataClient,
  data: WriteData,
  report: ImportReport,
  opts: { only?: Set<string>; concurrency?: number } = {},
): Promise<void> {
  const models = client.models as unknown as Record<string, AnyModel>;
  const steps: { name: ContentModelName; only: string; rows: { id: string }[] }[] = [
    { name: 'VocabularyEntry', only: 'entries', rows: data.entries },
    { name: 'VocabularyForm', only: 'forms', rows: data.forms },
    { name: 'VocabularyExample', only: 'examples', rows: data.examples },
    { name: 'Chapter', only: 'chapters', rows: data.chapters },
    { name: 'VocabularyChapter', only: 'chapters', rows: data.vocabularyChapters },
  ];

  for (const step of steps) {
    if (opts.only && !opts.only.has(step.only)) continue;
    const model = models[step.name];
    const existing = await listExistingIds(model);
    const counters = report.count(step.name);
    counters.toCreate = step.rows.filter((r) => !existing.has(r.id)).length;
    counters.toUpdate = step.rows.length - counters.toCreate;
    const limit = pLimit(opts.concurrency ?? 8);
    console.log(
      `→ ${step.name}: ${step.rows.length} Zeilen (${counters.toCreate} neu, ${counters.toUpdate} vorhanden) …`,
    );
    await Promise.all(
      step.rows.map((row) => limit(() => upsertRow(model, step.name, row, existing, report))),
    );
  }
}

/** Schreibt/aktualisiert den ContentVersion-Datensatz mit den Import-Zählern. */
export async function writeContentVersion(
  client: DataClient,
  report: ImportReport,
  info: {
    version: number;
    label: string;
    sourceFile: string;
    entriesCount: number;
    formsCount: number;
    examplesCount: number;
    chaptersCount: number;
  },
): Promise<void> {
  const model = (client.models as unknown as Record<string, AnyModel>).ContentVersion;
  const row = {
    id: `content_version_${info.version}`,
    version: info.version,
    label: info.label,
    importedAt: new Date().toISOString(),
    sourceFile: info.sourceFile,
    entriesCount: info.entriesCount,
    formsCount: info.formsCount,
    examplesCount: info.examplesCount,
    chaptersCount: info.chaptersCount,
    importDurationMs: report.durationMs,
  };
  const existing = await listExistingIds(model);
  await upsertRow(model, 'ContentVersion', row, existing, report);
}
