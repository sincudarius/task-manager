import { useStore } from "@tanstack/react-store";
import type { ReactNode } from "react";
import { boardStore, boardActions } from "../store/board-store";
import { hasActiveFilters } from "../filters";
import type { BoardState } from "../types";

const selectClass =
  "max-w-40 shrink-0 cursor-pointer truncate rounded-lg border border-cream-300 bg-surface px-2 py-1.5 text-[13px] font-medium text-ink/70 outline-none hover:border-sage-500 focus:border-sage-500 dark:border-moss-600 dark:bg-moss-900 dark:text-fog/70 dark:hover:border-sage-400 dark:focus:border-sage-400";

function distinct(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort();
}

export function FilterBar({ children }: { children?: ReactNode }) {
  const tasksByColumn = useStore(boardStore, (s: BoardState) => s.tasksByColumn);
  const filters = useStore(boardStore, (s: BoardState) => s.filters);
  const search = useStore(boardStore, (s: BoardState) => s.search);

  const all = Object.values(tasksByColumn).flat();
  const assignees = distinct(all.map((t) => t.assignee));
  const epics = distinct(all.map((t) => t.epic));
  const types = distinct(all.map((t) => t.type));
  const labels = distinct(all.map((t) => t.tag));

  const filteringAssignees = filters.assignees.length > 0;
  const active = hasActiveFilters(search, filters);

  return (
    <div className="flex items-center gap-2 overflow-x-auto" aria-label="Board filters">
      {assignees.length > 0 ? (
        <div className="flex shrink-0 items-center" role="group" aria-label="Filter by assignee">
          {assignees.map((a) => {
            const selected = filters.assignees.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => boardActions.toggleAssigneeFilter(a)}
                aria-pressed={selected}
                title={`Filter by ${a}`}
                className={`-ml-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper text-[10px] font-semibold first:ml-0 dark:border-moss-950 ${
                  selected
                    ? "bg-sage-700 text-white ring-2 ring-sage-500 ring-offset-1 ring-offset-paper dark:bg-sage-400 dark:text-moss-950 dark:ring-sage-400 dark:ring-offset-moss-950"
                    : "bg-sage-800 text-fog dark:bg-moss-600 dark:text-fog"
                } ${filteringAssignees && !selected ? "opacity-40" : "opacity-100"}`}
              >
                {a.slice(0, 2).toUpperCase()}
              </button>
            );
          })}
        </div>
      ) : null}

      <select
        value={filters.epic ?? "all"}
        onChange={(e) =>
          boardActions.setEpicFilter(e.target.value === "all" ? null : e.target.value)
        }
        aria-label="Filter by epic"
        className={selectClass}
      >
        <option value="all">Epic</option>
        {epics.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <select
        value={filters.type ?? "all"}
        onChange={(e) =>
          boardActions.setTypeFilter(e.target.value === "all" ? null : e.target.value)
        }
        aria-label="Filter by type"
        className={selectClass}
      >
        <option value="all">Type</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={filters.label ?? "all"}
        onChange={(e) =>
          boardActions.setLabelFilter(e.target.value === "all" ? null : e.target.value)
        }
        aria-label="Filter by label"
        className={selectClass}
      >
        <option value="all">Label</option>
        {labels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <select
        value=""
        onChange={(e) => {
          const v = e.target.value as "" | "my-work" | "high-priority";
          if (v) boardActions.applyQuickFilter(v);
        }}
        aria-label="Quick filters"
        className={selectClass}
      >
        <option value="">Quick filters</option>
        <option value="my-work">My work</option>
        <option value="high-priority">High priority</option>
      </select>

      {filters.priorities.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => boardActions.removePriorityFilter(p)}
          title="Remove priority filter"
          className="flex shrink-0 items-center gap-1 rounded-full border border-clay-600/30 bg-clay-100 px-2.5 py-1 text-xs font-medium text-clay-700 dark:border-clay-400/30 dark:bg-clay-400/10 dark:text-clay-400"
        >
          {p === "high" ? "High priority" : p} ×
        </button>
      ))}

      <button
        type="button"
        onClick={() => boardActions.clearFilters()}
        disabled={!active}
        className={`shrink-0 rounded-lg px-2 py-1.5 text-[13px] font-medium ${
          active
            ? "text-sage-700 hover:bg-sage-100 dark:text-sage-300 dark:hover:bg-moss-800"
            : "cursor-default text-ink/30 dark:text-fog/30"
        }`}
      >
        Clear filters
      </button>

      {children}

      <div className="ml-auto shrink-0">
        <select
          value="status"
          disabled
          aria-label="Group by"
          title="Grouping by status — more groupings coming soon"
          className="cursor-not-allowed rounded-lg border border-cream-300 bg-raised px-2 py-1.5 text-[13px] font-medium text-ink/40 outline-none dark:border-moss-600 dark:bg-moss-800 dark:text-fog/40"
        >
          <option value="status">Group: Status</option>
        </select>
      </div>
    </div>
  );
}
