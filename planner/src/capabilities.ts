/**
 * Our capabilities — the other half of "requirements × capabilities"
 * (BUILD_SPEC.md §4 step 3). Single config object, same pattern as the
 * frozen coverage benchmark: every decision in decide.ts reads this, never a
 * hardcoded assumption about the participant.
 *
 * Unlike the benchmark, this is not 🔒 frozen — it describes this
 * participant's real situation (BUILD_SPEC.md §1), which is fixed for the
 * challenge but not a locked design decision.
 */
export interface ParticipantCapabilities {
  licenceClass: "G1";
  hasVehicle: false;
  hasVin: false;
  operatingMode: "estimate_only";
  /** Group/employer/membership relationships actually held — empty for this participant. */
  membershipsHeld: string[];
}

export const PARTICIPANT_CAPABILITIES: ParticipantCapabilities = {
  licenceClass: "G1",
  hasVehicle: false,
  hasVin: false,
  operatingMode: "estimate_only",
  membershipsHeld: [],
};
