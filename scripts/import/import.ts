import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildAutoChapters, buildWordGroupChapters } from './chapters';
import { ImportReport } from './report';
import { transformEntries } from './transform';
import type { ChapterRow, VocabularyChapterRow } from './types';
import { createIdAllocator, parseArgs } from './util';
import { validateSource } from './validate';

const DEFAULT_FILE = 'data/wortliste_b1_struktur.json';

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const file = typeof args.file === 'string' ? args.file : DEFAULT_FILE;
  const dryRun = Boolean(args['dry-run']);
  const version = typeof args.version === 'string' ? args.version : '';
  const onlyArg = typeof args.only === 'string' ? args.only : '';
  const only = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim())) : undefined;

  const report = new ImportReport();
  report.startedAt = Date.now();
  report.dryRun = dryRun;
  report.version = version;
  report.sourceFile = file;

  // 1) Laden
  const abs = resolve(process.cwd(), file);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    console.error(`Datei konnte nicht gelesen/geparst werden: ${abs}\n${String(e)}`);
    process.exit(1);
  }

  // 2) Validieren
  const validation = validateSource(raw);
  report.validationIssues = validation.issues;
  if (!validation.ok) {
    console.error(`Validierung fehlgeschlagen: ${validation.issues.length} Fehler`);
    validation.issues.slice(0, 30).forEach((i) => console.error(`  • ${i.path}: ${i.message}`));
    if (validation.issues.length > 30) {
      console.error(`  … und ${validation.issues.length - 30} weitere`);
    }
    process.exit(1);
  }
  const source = validation.data;

  // 3) Transformieren + Kapitel bauen
  const allocator = createIdAllocator();
  const { entries, forms, examples, index } = transformEntries(source.eintraege, allocator, report);
  const wg = buildWordGroupChapters(source.wortgruppen, index, allocator, report);
  const auto = buildAutoChapters(entries); // nur Haupteinträge

  const chapters: ChapterRow[] = [...wg.chapters, ...auto.chapters];
  const vocabularyChapters: VocabularyChapterRow[] = [...wg.links, ...auto.links];
  const allEntries = [...entries, ...wg.entries];
  const allForms = [...forms, ...wg.forms];
  const allExamples = [...examples, ...wg.examples];

  report.count('VocabularyEntry').toCreate = allEntries.length;
  report.count('VocabularyForm').toCreate = allForms.length;
  report.count('VocabularyExample').toCreate = allExamples.length;
  report.count('Chapter').toCreate = chapters.length;
  report.count('VocabularyChapter').toCreate = vocabularyChapters.length;

  console.log(
    `Einträge: ${allEntries.length} (Haupt ${entries.length} + Wortgruppen ${wg.entries.length})`,
  );
  console.log(
    `Formen: ${allForms.length} (Haupt ${forms.length} + Wortgruppen ${wg.forms.length})`,
  );
  console.log(`Beispiele: ${allExamples.length}`);
  console.log(
    `Kapitel: ${chapters.length} (Wortgruppen ${wg.chapters.length} + Auto ${auto.chapters.length})`,
  );
  console.log(`Verknüpfungen: ${vocabularyChapters.length}`);

  // 4) Schreiben (nur außerhalb Dry-Run)
  if (!dryRun) {
    const { Amplify } = await import('aws-amplify');
    const { signIn } = await import('aws-amplify/auth');
    const { makeClient, writeAll, writeContentVersion } = await import('./write');

    const outputsPath = resolve(process.cwd(), 'amplify_outputs.json');
    let outputs: Parameters<typeof Amplify.configure>[0];
    try {
      outputs = JSON.parse(readFileSync(outputsPath, 'utf8'));
    } catch {
      console.error('amplify_outputs.json fehlt – bitte zuerst `npx ampx sandbox` starten.');
      process.exit(1);
    }
    Amplify.configure(outputs);

    const email = process.env.KELIMA_ADMIN_EMAIL;
    const password = process.env.KELIMA_ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('KELIMA_ADMIN_EMAIL / KELIMA_ADMIN_PASSWORD (Env) nicht gesetzt.');
      process.exit(1);
    }
    await signIn({ username: email, password });

    const client = makeClient();
    await writeAll(
      client,
      { entries: allEntries, forms: allForms, examples: allExamples, chapters, vocabularyChapters },
      report,
      { only },
    );

    if (!only) {
      const versionNum = version ? Number(version.replace(/\D/g, '').slice(0, 8)) || 1 : 1;
      await writeContentVersion(client, report, {
        version: versionNum,
        label: version,
        sourceFile: file,
        entriesCount: allEntries.length,
        formsCount: allForms.length,
        examplesCount: allExamples.length,
        chaptersCount: chapters.length,
      });
    }
  }

  // 5) Report
  report.durationMs = Date.now() - report.startedAt;
  report.printSummary();
  writeFileSync(
    resolve(process.cwd(), 'import-report.json'),
    JSON.stringify(report.toJSON(), null, 2),
    'utf8',
  );

  const totalErrors = Object.values(report.perModel).reduce((s, c) => s + c.errors, 0);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
