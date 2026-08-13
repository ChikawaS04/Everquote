import { useEffect, useMemo, useState } from "react";
import type { NormalizedOutput, QuoteResult } from "@oaqa/schema";
import { CoverageBanner } from "./components/CoverageBanner.js";
import { BenchmarkStrip } from "./components/BenchmarkStrip.js";
import { Controls } from "./components/Controls.js";
import { ResultsGroups } from "./components/ResultsGroups.js";
import { MarketMapView } from "./components/MarketMapView.js";
import { EvidenceDrawer } from "./components/EvidenceDrawer.js";

export type SortKey = "annual_cost" | "brand";
export type ViewMode = "results" | "market_map";

function sortResults(results: QuoteResult[], sortKey: SortKey): QuoteResult[] {
  const copy = [...results];
  if (sortKey === "annual_cost") {
    copy.sort((a, b) => {
      const priceA = a.price?.annualPremium ?? Number.POSITIVE_INFINITY;
      const priceB = b.price?.annualPremium ?? Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  } else {
    copy.sort((a, b) => a.source.brand.localeCompare(b.source.brand));
  }
  return copy;
}

export default function App() {
  const [data, setData] = useState<NormalizedOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("annual_cost");
  const [hideEstimates, setHideEstimates] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("results");
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/normalized-output.json")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((json: NormalizedOutput) => setData(json))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const sortedResults = useMemo(() => (data ? sortResults(data.results, sortKey) : []), [data, sortKey]);

  const selectedResult = useMemo(
    () => (data ? data.results.find((r) => r.resultId === selectedResultId) ?? null : null),
    [data, selectedResultId],
  );

  if (error) {
    return (
      <div className="app-shell">
        <div className="card">
          <strong>Could not load normalized output.</strong>
          <p>{error}</p>
          <p>Run <code>npm run registry:build &amp;&amp; npm run planner:build &amp;&amp; npm run normalizer:build</code> from the repo root, then reload.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-shell">
        <p>Loading normalized market data…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Ontario All-Quote Agent — Market Coverage</h1>
        <p>
          Generated {new Date(data.generatedAt).toLocaleString("en-CA")} · every price on this page is anchored to the
          benchmark below.
        </p>
      </header>

      <CoverageBanner metrics={data.metrics} results={data.results} />

      <BenchmarkStrip benchmark={data.benchmark} />

      <Controls
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        hideEstimates={hideEstimates}
        onHideEstimatesChange={setHideEstimates}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "results" ? (
        <ResultsGroups results={sortedResults} hideEstimates={hideEstimates} onOpenEvidence={setSelectedResultId} />
      ) : (
        <MarketMapView results={data.results} />
      )}

      {selectedResult && <EvidenceDrawer result={selectedResult} onClose={() => setSelectedResultId(null)} />}
    </div>
  );
}
