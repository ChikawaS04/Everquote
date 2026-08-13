import type { QuoteResult } from "@oaqa/schema";
import { STATUS_LABELS } from "../statusGroups.js";

interface EvidenceDrawerProps {
  result: QuoteResult;
  onClose: () => void;
}

/**
 * BUILD_SPEC.md §4a: "an evidence drawer that reads 'prediction only — no
 * live evidence' on predicted rows" is structural, not polish — it is the
 * thesis made visible on the one screen a judge will actually click into.
 */
export function EvidenceDrawer({ result, onClose }: EvidenceDrawerProps) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Evidence" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="drawer-close" onClick={onClose}>
          Close
        </button>
        <h2>{result.source.brand}</h2>
        <p>{STATUS_LABELS[result.status]}</p>

        {result.provenance === "planner_prediction" ? (
          <>
            <div className="prediction-only-banner">
              <strong>Prediction only — no live evidence.</strong> The route planner predicted this outcome from the
              source's stated requirements against our capabilities; no attempt has been made yet.
            </div>
            <dl>
              <dt>Planned action</dt>
              <dd>{result.planning.plannedAction}</dd>
              <dt>Rationale</dt>
              <dd>{result.planning.rationale}</dd>
              <dt>Target quote URL (not proof of an attempt)</dt>
              <dd>{result.planning.targetQuoteUrl ?? "None on file"}</dd>
              <dt>Planned at</dt>
              <dd>{new Date(result.planning.plannedAt).toLocaleString("en-CA")}</dd>
            </dl>
          </>
        ) : (
          <dl>
            <dt>Source URL</dt>
            <dd>{result.evidence.sourceUrl}</dd>
            <dt>Timestamp</dt>
            <dd>{new Date(result.evidence.timestamp).toLocaleString("en-CA")}</dd>
            <dt>Redacted screenshot</dt>
            <dd>{result.evidence.redactedScreenshotPath ?? "Not captured"}</dd>
            <dt>Journey note</dt>
            <dd>{result.evidence.journeyNote ?? "—"}</dd>
            <dt>Confidence</dt>
            <dd>{result.confidence}</dd>
          </dl>
        )}
      </div>
    </div>
  );
}
