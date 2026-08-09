import type { TerminalStatus } from "./status.js";

export type DistributionType =
  | "direct"
  | "agent"
  | "broker"
  | "aggregator"
  | "affinity"
  | "MGA_program"
  | "mutual"
  | "residual";

export type ProductScope =
  | "standard_PPA"
  | "nonstandard_PPA"
  | "high_net_worth"
  | "collector"
  | "commercial_specialty"
  | "unknown";

export type RequirementFlag = "licence" | "VIN" | "membership" | "callback" | "human" | "other";

/**
 * Market registry record — the crown jewel deliverable (BUILD_SPEC.md §4 step 2
 * and Appendix). One row per distinct route into the Ontario PPA market.
 */
export interface RegistryRecord {
  registryId: string;
  legalUnderwriter: string;
  insurerGroup: string;
  brandOrProgram: string;
  distributionType: DistributionType;
  productScope: ProductScope;
  /** Dedup key: two registry rows sharing this value resolve to the same rate program. */
  distinctRateSourceId: string;
  quoteUrl?: string;
  publicPhoneRoute?: string;
  licensedIntermediary?: string;
  requirements: RequirementFlag[];
  automationNotes?: string;
  status: TerminalStatus;
  /**
   * Authoritative evidence URL. Optional: a seed row curated from public
   * knowledge but not yet live-verified honestly may not have one yet —
   * forcing a value here would tempt fabrication (see BUILD_SPEC.md §2).
   */
  sourceUrl?: string;
  /** ISO 8601 — when this row was last touched/curated, not a claim of live verification. */
  lastVerifiedAt: string;
  evidenceArtifact?: string;
  /**
   * True once this row has been live-probed (browser/voice/broker-panel
   * confirmation) during the hackathon window. Feeds the freshness metric
   * (BUILD_SPEC.md §8) — distinct from `lastVerifiedAt`, which a seed-only
   * row also has.
   */
  verifiedDuringHackathonWindow: boolean;
  /**
   * Raw Appendix A token(s) this row accounts for, when more than one
   * distinct token in the brief's seed list resolved to the same real-world
   * legal entity (e.g. "S&Y" and "Scottish & York" are the same insurer).
   * Present only on merged rows — its length is always >1 when set. This is
   * what makes the dedup decision demonstrable in the data itself rather
   * than asserted only in source comments; /registry's reconcile.ts checks
   * it against the full Appendix A token count on every build.
   */
  mergedAliases?: string[];
}
