import type { QuoteResult } from "./quoteResult.js";
import type { CoverageMetrics } from "./metrics.js";
import type { CoverageBenchmark } from "./benchmark.js";

/**
 * The single self-contained JSON artifact the dashboard reads (BUILD_SPEC.md
 * §4a data contract). All truth is precomputed by the pipeline — the UI does
 * no computation beyond sort/filter/group.
 */
export interface NormalizedOutput {
  generatedAt: string;
  benchmark: CoverageBenchmark;
  metrics: CoverageMetrics;
  results: QuoteResult[];
}
