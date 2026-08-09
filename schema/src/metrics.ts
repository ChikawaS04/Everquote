/**
 * The five coverage metrics (BUILD_SPEC.md §8). `unresolved` records remain
 * in every denominator — never silently dropped or converted.
 */
export interface CoverageMetrics {
  /** distinct rate sources with an evidence-backed terminal status ÷ verified applicable rate sources */
  marketCompletion: number;
  /** quoted_comparable results ÷ verified applicable rate sources */
  comparableQuoteYield: number;
  /** outcomes with a valid source + timestamp + redacted artifact ÷ all outcomes */
  evidenceRate: number;
  /** brands/routes mapped to an existing distinct_rate_source_id rather than double-counted */
  duplicateSuppression: number;
  /** % of registry records verified during the hackathon window */
  freshness: number;
  computedAt: string;
}
