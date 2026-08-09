/**
 * Terminal status enum — verbatim from the challenge brief (BUILD_SPEC.md §5).
 * Every route resolves to exactly one of these. `unresolved` must never be
 * silently converted to any other status — see §8 honest-accounting rule.
 */
export type TerminalStatus =
  | "quoted_comparable"
  | "quoted_non_comparable"
  | "estimate_only"
  | "callback_required"
  | "manual_handoff"
  | "ineligible"
  | "affinity_restricted"
  | "specialty_only"
  | "duplicate_rate_source"
  | "not_currently_writing"
  | "blocked"
  | "unreachable"
  | "unresolved";

export const TERMINAL_STATUSES: readonly TerminalStatus[] = [
  "quoted_comparable",
  "quoted_non_comparable",
  "estimate_only",
  "callback_required",
  "manual_handoff",
  "ineligible",
  "affinity_restricted",
  "specialty_only",
  "duplicate_rate_source",
  "not_currently_writing",
  "blocked",
  "unreachable",
  "unresolved",
];

/**
 * Confidence enum (BUILD_SPEC.md §5):
 * high   — returned exact premium + matching coverage
 * medium — licensed rep's documented quote
 * low    — estimate or unresolved coverage difference
 */
export type ConfidenceLevel = "high" | "medium" | "low";

export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = ["high", "medium", "low"];
