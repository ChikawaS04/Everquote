import type { RegistryRecord } from "@oaqa/schema";
import type { RegistrySeedInput } from "./seedTypes.js";
import { slugify } from "./slugify.js";

/**
 * Turns a curated seed input into a full RegistryRecord: derives
 * registryId / distinct_rate_source_id, stamps an honest seed-stage
 * status (`unresolved` — see BUILD_SPEC.md §Appendix "seed only, requires
 * current validation"), and records that verification has not yet
 * happened during the hackathon window.
 */
export function enrich(seedInput: RegistrySeedInput, seedTimestamp: string): RegistryRecord {
  const registryId = slugify(seedInput.legalUnderwriter);

  return {
    registryId,
    legalUnderwriter: seedInput.legalUnderwriter,
    insurerGroup: seedInput.insurerGroup,
    brandOrProgram: seedInput.brandOrProgram,
    distributionType: seedInput.distributionType,
    productScope: seedInput.productScope,
    // One legal entity = one distinct rate source by default. Verified
    // collisions (e.g. an aggregator surfacing a carrier already seeded
    // directly) are caught by the dedupe pass, not asserted here.
    distinctRateSourceId: registryId,
    quoteUrl: seedInput.quoteUrl,
    sourceUrl: seedInput.quoteUrl,
    requirements: seedInput.requirements,
    automationNotes: seedInput.automationNotes,
    status: "unresolved",
    lastVerifiedAt: seedTimestamp,
    verifiedDuringHackathonWindow: false,
    mergedAliases: seedInput.mergedAliases,
  };
}
