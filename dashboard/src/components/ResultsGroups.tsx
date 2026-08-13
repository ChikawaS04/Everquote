import type { QuoteResult } from "@oaqa/schema";
import { RESULT_GROUPS, STATUS_LABELS, groupForStatus } from "../statusGroups.js";

const currency = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

interface ResultRowProps {
  result: QuoteResult;
  onOpenEvidence: (resultId: string) => void;
}

function ResultRow({ result, onOpenEvidence }: ResultRowProps) {
  const group = groupForStatus(result.status);
  const groupDef = RESULT_GROUPS.find((g) => g.id === group)!;

  return (
    <div className="result-row">
      <div className="result-row__identity">
        <div className="result-row__brand">{result.source.brand}</div>
        <div className="result-row__chain">
          {result.source.brand} → {result.source.legalUnderwriter} → {result.source.insurerGroup}
        </div>
        {result.coverage.varianceFlags.length > 0 && (
          <div className="variance-flags">
            {result.coverage.varianceFlags.map((flag) => (
              <span key={flag.field}>
                {flag.field}: {flag.observedValue} (benchmark {flag.benchmarkValue})
              </span>
            ))}
          </div>
        )}
      </div>

      <span
        className="status-chip"
        style={{ background: `var(${groupDef.colorBgVar})`, color: `var(${groupDef.colorVar})` }}
      >
        {STATUS_LABELS[result.status]}
      </span>

      <span className={`provenance-badge ${result.provenance === "live_evidence" ? "provenance-badge--live" : ""}`}>
        {result.provenance === "live_evidence" ? "Live evidence" : "Predicted"}
      </span>

      {group === "comparable" && result.price?.annualPremium !== undefined && (
        <span className="result-row__price">{currency.format(result.price.annualPremium)}/yr</span>
      )}

      <button type="button" className="evidence-button" onClick={() => onOpenEvidence(result.resultId)}>
        Evidence
      </button>
    </div>
  );
}

interface ResultsGroupsProps {
  results: QuoteResult[];
  hideEstimates: boolean;
  onOpenEvidence: (resultId: string) => void;
}

/**
 * 🔒 PROTECTED (BUILD_SPEC.md §4a): grouped by terminal status, never
 * flattened into one table. Unresolved always renders, never collapsed.
 * "Hide estimates" hides only the Estimates group's rows — the section
 * itself stays visible with a note, so hiding never reads as "nothing here."
 */
export function ResultsGroups({ results, hideEstimates, onOpenEvidence }: ResultsGroupsProps) {
  return (
    <div>
      {RESULT_GROUPS.map((group) => {
        const rows = results.filter((r) => groupForStatus(r.status) === group.id);
        const isHidden = hideEstimates && group.id === "estimates";

        return (
          <section className="card result-group" key={group.id} aria-labelledby={`group-${group.id}-heading`}>
            <div className="result-group__header">
              <span className="swatch" style={{ background: `var(${group.colorVar})` }} />
              <h2 id={`group-${group.id}-heading`}>{group.label}</h2>
              <span className="result-group__count">{rows.length}</span>
            </div>

            {isHidden ? (
              <p className="result-group__hidden-note">Hidden by the "Hide estimates" filter — {rows.length} result(s) not shown.</p>
            ) : rows.length === 0 ? (
              <p className="result-group__empty">No sources in this group yet.</p>
            ) : (
              rows.map((result) => <ResultRow key={result.resultId} result={result} onOpenEvidence={onOpenEvidence} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
