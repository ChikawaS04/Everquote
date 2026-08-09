import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { RegistryRecord } from "@oaqa/schema";
import { SEED } from "./seed.js";
import { enrich } from "./enrich.js";
import { dedupe } from "./dedupe.js";
import { toCsv } from "./csv.js";
import { reconcileAppendixA } from "./reconcile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../data");

async function main() {
  const generatedAt = new Date().toISOString();

  // Reconcile BEFORE emitting anything: the headline count is only honest
  // if every raw Appendix A token is provably accounted for, and we'd
  // rather fail the build than ship a number nobody re-derived.
  const reconciliation = reconcileAppendixA(SEED);
  if (!reconciliation.ok) {
    console.error("Appendix A reconciliation FAILED — refusing to emit registry artifacts.");
    console.error(JSON.stringify(reconciliation, null, 2));
    process.exitCode = 1;
    return;
  }

  const enriched: RegistryRecord[] = SEED.map((seedInput) => enrich(seedInput, generatedAt));
  const deduped = dedupe(enriched);

  const supplemental = SEED.filter((s) => s.origin === "supplemental");

  const summary = {
    generatedAt,
    appendixA: {
      rawTokenCount: reconciliation.rawTokenCount,
      distinctLegalEntityCount: reconciliation.distinctLegalEntityCount,
      mergedGroups: reconciliation.mergedGroups,
      reconciliationOk: reconciliation.ok,
    },
    supplementalRoutes: {
      note: "Distribution routes named in the brief's Route Strategy / gap-fill notes, not additional rows in the Appendix A regulator-facing seed list — kept as a separate layer, never blended into the Appendix A count above.",
      count: supplemental.length,
      brands: supplemental.map((s) => s.brandOrProgram),
    },
    totalRegistryRows: reconciliation.distinctLegalEntityCount + supplemental.length,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, "registry.json"), JSON.stringify(deduped, null, 2) + "\n", "utf8");
  await writeFile(path.join(OUTPUT_DIR, "registry.csv"), toCsv(deduped), "utf8");
  await writeFile(path.join(OUTPUT_DIR, "registry-summary.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");

  const byStatus = new Map<string, number>();
  const byDistribution = new Map<string, number>();
  for (const record of deduped) {
    byStatus.set(record.status, (byStatus.get(record.status) ?? 0) + 1);
    byDistribution.set(record.distributionType, (byDistribution.get(record.distributionType) ?? 0) + 1);
  }

  console.log(`Wrote ${deduped.length} registry records to ${OUTPUT_DIR}`);
  console.log("By status:", Object.fromEntries(byStatus));
  console.log("By distribution type:", Object.fromEntries(byDistribution));

  const distinctRateSources = new Set(deduped.map((r) => r.distinctRateSourceId)).size;
  console.log(`Distinct rate sources: ${distinctRateSources} (of ${deduped.length} registry rows)`);

  console.log("\nAppendix A reconciliation:");
  console.log(
    `  ${summary.appendixA.rawTokenCount} raw tokens -> ${summary.appendixA.distinctLegalEntityCount} distinct legal entities (${summary.appendixA.mergedGroups.length} merge${summary.appendixA.mergedGroups.length === 1 ? "" : "s"})`,
  );
  for (const g of summary.appendixA.mergedGroups) {
    console.log(`    merged: [${g.rawTokens.join(", ")}] -> "${g.legalUnderwriter}"`);
  }
  console.log(`  + ${summary.supplementalRoutes.count} supplemental distribution routes (${summary.supplementalRoutes.brands.join(", ")})`);
  console.log(`  = ${summary.totalRegistryRows} total registry rows`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
