import type { TerminalStatus } from "@oaqa/schema";

/**
 * The six protected result groups (BUILD_SPEC.md §4a 🔒). Order here is
 * display order: Comparable -> Estimates -> Handoffs -> Blocked/Ineligible
 * -> Duplicates -> Unresolved. Never flatten this into one list, never
 * hide/collapse Unresolved by default.
 */
export type ResultGroupId = "comparable" | "estimates" | "handoffs" | "blocked" | "duplicates" | "unresolved";

export interface ResultGroupDef {
  id: ResultGroupId;
  label: string;
  colorVar: string;
  colorBgVar: string;
}

export const RESULT_GROUPS: ResultGroupDef[] = [
  { id: "comparable", label: "Comparable quotes", colorVar: "--status-good", colorBgVar: "--status-good-bg" },
  { id: "estimates", label: "Estimates", colorVar: "--status-warning", colorBgVar: "--status-warning-bg" },
  { id: "handoffs", label: "Handoffs / callback required", colorVar: "--status-neutral", colorBgVar: "--status-neutral-bg" },
  { id: "blocked", label: "Blocked / ineligible / not writing", colorVar: "--status-critical", colorBgVar: "--status-critical-bg" },
  { id: "duplicates", label: "Duplicates (suppressed)", colorVar: "--status-info", colorBgVar: "--status-info-bg" },
  { id: "unresolved", label: "Unresolved", colorVar: "--status-neutral", colorBgVar: "--status-neutral-bg" },
];

const STATUS_TO_GROUP: Record<TerminalStatus, ResultGroupId> = {
  quoted_comparable: "comparable",
  quoted_non_comparable: "comparable",
  estimate_only: "estimates",
  callback_required: "handoffs",
  manual_handoff: "handoffs",
  affinity_restricted: "handoffs",
  ineligible: "blocked",
  specialty_only: "blocked",
  not_currently_writing: "blocked",
  blocked: "blocked",
  duplicate_rate_source: "duplicates",
  unreachable: "unresolved",
  unresolved: "unresolved",
};

export function groupForStatus(status: TerminalStatus): ResultGroupId {
  return STATUS_TO_GROUP[status];
}

export const STATUS_LABELS: Record<TerminalStatus, string> = {
  quoted_comparable: "Quoted — comparable",
  quoted_non_comparable: "Quoted — non-comparable",
  estimate_only: "Estimate only",
  callback_required: "Callback required",
  manual_handoff: "Manual handoff",
  ineligible: "Ineligible",
  affinity_restricted: "Affinity restricted",
  specialty_only: "Specialty only",
  duplicate_rate_source: "Duplicate rate source",
  not_currently_writing: "Not currently writing",
  blocked: "Blocked",
  unreachable: "Unreachable",
  unresolved: "Unresolved",
};
