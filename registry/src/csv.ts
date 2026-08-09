import type { RegistryRecord } from "@oaqa/schema";

const COLUMNS: (keyof RegistryRecord)[] = [
  "registryId",
  "legalUnderwriter",
  "insurerGroup",
  "brandOrProgram",
  "distributionType",
  "productScope",
  "distinctRateSourceId",
  "quoteUrl",
  "publicPhoneRoute",
  "licensedIntermediary",
  "requirements",
  "automationNotes",
  "status",
  "sourceUrl",
  "lastVerifiedAt",
  "evidenceArtifact",
  "verifiedDuringHackathonWindow",
];

function escapeCsvCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const stringValue = Array.isArray(value) ? value.join(";") : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function toCsv(records: RegistryRecord[]): string {
  const header = COLUMNS.join(",");
  const rows = records.map((record) => COLUMNS.map((col) => escapeCsvCell(record[col])).join(","));
  return [header, ...rows].join("\n") + "\n";
}
