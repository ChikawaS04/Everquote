import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { NormalizedOutput, QuoteResult, RegistryRecord, RoutePlan } from "@oaqa/schema";
import { COVERAGE_BENCHMARK } from "./benchmarkConfig.js";
import { liftPrediction } from "./liftPrediction.js";
import { computeMetrics, type RegistrySummary } from "./metrics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_INPUT = path.resolve(__dirname, "../../registry/data/registry.json");
const REGISTRY_SUMMARY_INPUT = path.resolve(__dirname, "../../registry/data/registry-summary.json");
const PLANNED_ROUTES_INPUT = path.resolve(__dirname, "../../planner/data/planned-routes.json");
const OUTPUT_DIR = path.resolve(__dirname, "../data");

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function main() {
  const generatedAt = new Date().toISOString();

  const registryRecords = await readJson<RegistryRecord[]>(REGISTRY_INPUT);
  const registrySummary = await readJson<RegistrySummary>(REGISTRY_SUMMARY_INPUT);
  const routePlans = await readJson<RoutePlan[]>(PLANNED_ROUTES_INPUT);

  const registryByRegistryId = new Map(registryRecords.map((r) => [r.registryId, r]));

  // Day 2: every result is a planner prediction — there is no live evidence
  // yet (that's Day 3). Day 3's browser/voice agents will add live_evidence
  // results into this same array; the union in @oaqa/schema is what lets
  // both provenances coexist here without either one impersonating the other.
  const results: QuoteResult[] = routePlans.map((plan) => {
    const record = registryByRegistryId.get(plan.registryId);
    if (!record) {
      throw new Error(
        `Route plan references unknown registryId "${plan.registryId}" — registry.json and planned-routes.json are out of sync.`,
      );
    }
    return liftPrediction(record, plan);
  });

  const metrics = computeMetrics(results, registryRecords, registrySummary, generatedAt);

  const output: NormalizedOutput = {
    generatedAt,
    benchmark: COVERAGE_BENCHMARK,
    metrics,
    results,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, "normalized-output.json"), JSON.stringify(output, null, 2) + "\n", "utf8");

  const byStatus = new Map<string, number>();
  for (const r of results) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);

  console.log(`Wrote ${results.length} normalized results to ${OUTPUT_DIR}`);
  console.log("By status:", Object.fromEntries(byStatus));
  console.log("Metrics:", metrics);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
