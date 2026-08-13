import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { RegistryRecord, RoutePlan } from "@oaqa/schema";
import { planRoute } from "./decide.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_INPUT = path.resolve(__dirname, "../../registry/data/registry.json");
const OUTPUT_DIR = path.resolve(__dirname, "../data");

function assertRegistryRecords(value: unknown): asserts value is RegistryRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected an array of RegistryRecord at ${REGISTRY_INPUT}, got ${typeof value}`);
  }
  for (const [i, row] of value.entries()) {
    const r = row as Partial<RegistryRecord>;
    if (
      typeof r.registryId !== "string" ||
      typeof r.distinctRateSourceId !== "string" ||
      typeof r.status !== "string" ||
      typeof r.distributionType !== "string" ||
      typeof r.productScope !== "string" ||
      !Array.isArray(r.requirements)
    ) {
      throw new Error(`Registry row at index ${i} is missing required RegistryRecord fields — refusing to plan against malformed input.`);
    }
  }
}

async function main() {
  const plannedAt = new Date().toISOString();

  const raw = JSON.parse(await readFile(REGISTRY_INPUT, "utf8"));
  assertRegistryRecords(raw);
  const registryRecords: RegistryRecord[] = raw;

  const plans: RoutePlan[] = registryRecords.map((record) => planRoute(record, plannedAt));

  const byPredictedStatus = new Map<string, number>();
  const byPlannedAction = new Map<string, number>();
  for (const plan of plans) {
    byPredictedStatus.set(plan.predictedStatus, (byPredictedStatus.get(plan.predictedStatus) ?? 0) + 1);
    byPlannedAction.set(plan.plannedAction, (byPlannedAction.get(plan.plannedAction) ?? 0) + 1);
  }

  const summary = {
    generatedAt: plannedAt,
    registrySource: REGISTRY_INPUT,
    totalPlans: plans.length,
    byPredictedStatus: Object.fromEntries(byPredictedStatus),
    byPlannedAction: Object.fromEntries(byPlannedAction),
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, "planned-routes.json"), JSON.stringify(plans, null, 2) + "\n", "utf8");
  await writeFile(path.join(OUTPUT_DIR, "planned-routes-summary.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");

  console.log(`Wrote ${plans.length} route plans to ${OUTPUT_DIR}`);
  console.log("By predicted status:", summary.byPredictedStatus);
  console.log("By planned action:", summary.byPlannedAction);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
