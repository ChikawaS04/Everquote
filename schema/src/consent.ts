/**
 * Consent & operating mode (BUILD_SPEC.md §5). Default mode is `estimate_only`
 * against a hypothetical, licence-number-free profile — see §2 guardrails.
 */
export type OperatingMode = "estimate_only" | "discovery" | "live";

export type Channel = "web" | "voice" | "broker_portal" | "email";

/** Per-route record of exactly which canonical fields were disclosed to a given source. */
export interface FieldDisclosureRecord {
  /** RegistryRecord.registryId or distinctRateSourceId */
  routeId: string;
  /** Canonical schema field paths, e.g. "applicant.address.postalCode" */
  fieldsDisclosed: string[];
  disclosedAt: string;
}

export interface ConsentRecord {
  consentTimestamp: string;
  mode: OperatingMode;
  /** Must be true whenever mode === "estimate_only" (§2 guardrail). */
  isHypotheticalProfile: boolean;
  permittedChannels: Channel[];
  /** Empty array = all sources permitted within mode/scope. */
  approvedInsurersOrBrokers: string[];
  perRouteFieldDisclosure: FieldDisclosureRecord[];
}
