import type { SortKey, ViewMode } from "../App.js";

interface ControlsProps {
  sortKey: SortKey;
  onSortKeyChange: (key: SortKey) => void;
  hideEstimates: boolean;
  onHideEstimatesChange: (value: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Sort/filter operate WITHIN groups, never by dissolving them (BUILD_SPEC.md
 * §4a 🔒). "Hide estimates" only affects the Estimates group — see
 * ResultsGroups, which keeps the group heading visible with a hidden-count
 * note rather than removing the section.
 */
export function Controls({ sortKey, onSortKeyChange, hideEstimates, onHideEstimatesChange, viewMode, onViewModeChange }: ControlsProps) {
  return (
    <section className="card controls-bar" aria-label="Controls">
      <label>
        Sort within groups
        <select value={sortKey} onChange={(e) => onSortKeyChange(e.target.value as SortKey)}>
          <option value="annual_cost">Annual cost</option>
          <option value="brand">Brand (A–Z)</option>
        </select>
      </label>

      <label>
        <input type="checkbox" checked={hideEstimates} onChange={(e) => onHideEstimatesChange(e.target.checked)} />
        Hide estimates
      </label>

      <div className="view-toggle" role="group" aria-label="View">
        <button type="button" aria-pressed={viewMode === "results"} onClick={() => onViewModeChange("results")}>
          Results view
        </button>
        <button type="button" aria-pressed={viewMode === "market_map"} onClick={() => onViewModeChange("market_map")}>
          Market-map view
        </button>
      </div>
    </section>
  );
}
