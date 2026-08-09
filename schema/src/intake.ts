/**
 * Intake profile — OAF-1 superset (BUILD_SPEC.md §5).
 *
 * Structural guardrail: `LicenceIdentity` has no licence-number field.
 * That is deliberate, not an omission — see §2 "no fabricated, borrowed,
 * generated, or altered driver's licence numbers." Routes that demand a
 * number stop at `manual_handoff` / `estimate_only` / `blocked`; the type
 * system makes it impossible to fill one in.
 */

// ---- Applicant / contact / household ----------------------------------

export interface Address {
  unit?: string;
  streetNumber: string;
  streetName: string;
  city: string;
  province: "ON";
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  preferredContactMethod: "email" | "phone" | "none";
}

export interface Applicant {
  fullName: string;
  dateOfBirth: string;
  address: Address;
  contact: ContactInfo;
  maritalStatus?: string;
  occupation?: string;
}

export interface HouseholdMember {
  memberId: string;
  relationshipToApplicant: string;
  fullName: string;
  dateOfBirth: string;
  isDriver: boolean;
}

export interface Household {
  members: HouseholdMember[];
}

// ---- Driver info --------------------------------------------------------

export interface LicenceIdentity {
  licenceClass: "G1" | "G2" | "G" | "other";
  province: string;
  /** Structurally locked false — this build never carries a licence number. */
  hasLicenceNumber: false;
}

export interface LicensingGap {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LicensingTimeline {
  dateFirstLicensedAnyClass?: string;
  dateFirstLicensedG1?: string;
  dateFullyLicensedG?: string;
  gapsInLicensing: LicensingGap[];
}

export interface DriverTraining {
  completedApprovedCourse: boolean;
  courseProviderName?: string;
  completionDate?: string;
}

export interface DriverAssignment {
  /** Links to Vehicle.vehicleId when a vehicle is assigned. */
  assignedVehicleId?: string;
  usageRole: "principal" | "occasional" | "excluded" | "unassigned";
}

export interface DiscountEligibility {
  claimsFreeYears?: number;
  winterTiresInstalled?: boolean;
  multiVehicleHousehold?: boolean;
  multiLineHousehold?: boolean;
  affinityGroupMembership: string[];
  telematicsOptIn: boolean;
  other?: string[];
}

export interface Driver {
  driverId: string;
  /** memberId of the Applicant or a HouseholdMember this driver refers to. */
  personId: string;
  licenceIdentity: LicenceIdentity;
  timeline: LicensingTimeline;
  training: DriverTraining;
  assignment: DriverAssignment;
  discountEligibility: DiscountEligibility;
}

// ---- Vehicle & use --------------------------------------------------------

export interface VehicleIdentity {
  /** Absent for this participant — no vehicle owned, no VIN. */
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
}

export interface VehicleOwnership {
  ownershipStatus: "owned" | "leased" | "financed" | "not_owned";
  registeredOwnerId?: string;
  dateAcquired?: string;
}

export interface VehicleUse {
  primaryUse: "pleasure" | "commute" | "business" | "rideshare" | "delivery" | "unknown";
  annualKm?: number;
  oneWayCommuteKm?: number;
  parkingLocationOvernight?: "garage" | "driveway" | "street" | "lot" | "unknown";
}

export interface VehicleRiskDetails {
  antiTheftDevice?: boolean;
  winterTires?: boolean;
  modifications: string[];
}

export interface VehicleSpecialUse {
  rideshareOrDelivery: boolean;
  collectorOrClassic: boolean;
  commercialUse: boolean;
}

export interface Vehicle {
  vehicleId: string;
  identity: VehicleIdentity;
  ownership: VehicleOwnership;
  use: VehicleUse;
  riskDetails: VehicleRiskDetails;
  specialUse: VehicleSpecialUse;
}

// ---- History --------------------------------------------------------------

export interface CurrentInsuranceHistory {
  currentlyInsured: boolean;
  currentInsurerName?: string;
  policyExpiryDate?: string;
  yearsWithCurrentInsurer?: number;
  lapseInCoverage: boolean;
  lapseDurationDays?: number;
  lapseReason?: string;
}

export interface LicencePermitEvent {
  eventType: "suspension" | "reinstatement" | "demerit_points" | "other";
  date: string;
  description: string;
}

export interface CancellationRecord {
  cancelledByInsurer: boolean;
  cancellationDate?: string;
  cancellationReason?: string;
}

export interface MisrepresentationOrFraudHistory {
  everMisrepresented: boolean;
  everConvictedOfFraud: boolean;
  details?: string;
}

export interface AccidentOrClaim {
  date: string;
  atFault: boolean | "disputed" | "unknown";
  claimType: string;
  amountPaid?: number;
  description?: string;
}

export interface Conviction {
  date: string;
  offence: string;
  demeritPoints?: number;
}

export interface InsuranceHistory {
  currentInsurance: CurrentInsuranceHistory;
  licencePermitEvents: LicencePermitEvent[];
  cancellations: CancellationRecord[];
  misrepresentationOrFraud: MisrepresentationOrFraudHistory;
  accidentsAndClaims: AccidentOrClaim[];
  convictions: Conviction[];
}

// ---- Top-level intake profile ---------------------------------------------

export interface IntakeProfile {
  profileId: string;
  applicant: Applicant;
  household: Household;
  drivers: Driver[];
  vehicles: Vehicle[];
  history: InsuranceHistory;
}
