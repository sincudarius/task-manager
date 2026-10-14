import { useState } from "react";
import { useStore } from "@tanstack/react-store";
import { boardStore, boardActions } from "../store/board-store";
import type { BoardState } from "../types";
import { TemplatePicker } from "./TemplatePicker";
import { FilterBar } from "./FilterBar";

export function BoardToolbar() {
  const search = useStore(boardStore, (s: BoardState) => s.search);
  const [newColumn, setNewColumn] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center text-xl font-semibold tracking-tight text-ink dark:text-fog">
        main board
      </h1>

      <input
        value={search}
        onChange={(e) => boardActions.setSearch(e.target.value)}
        placeholder="Search tasks by title, key, or tag…"
        aria-label="Search tasks"
        className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-2.5 text-sm text-ink shadow-sm outline-none placeholder:text-ink/40 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/30 dark:border-moss-600 dark:bg-moss-900 dark:text-fog dark:placeholder:text-fog/40 dark:focus:border-sage-400 dark:focus:ring-sage-400/20"
      />

      <FilterBar>
        <span
          aria-hidden
          className="h-5 w-px shrink-0 bg-cream-300 dark:bg-moss-600"
        />
        <TemplatePicker />
        <form
          className="flex shrink-0 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newColumn.trim()) return;
            boardActions.addColumn(newColumn);
            setNewColumn("");
          }}
        >
          <input
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            placeholder="New column name"
            aria-label="New column name"
            className="w-40 rounded-lg border border-cream-300 bg-surface px-2 py-1.5 text-[13px] text-ink outline-none placeholder:text-ink/40 focus:border-sage-500 dark:border-moss-600 dark:bg-moss-900 dark:text-fog dark:placeholder:text-fog/40 dark:focus:border-sage-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-sage-700 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-sage-800 dark:bg-sage-500 dark:text-moss-950 dark:hover:bg-sage-400"
          >
            + Add column
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            const ok = window.confirm("Reset board to the current template?");
            if (ok) boardActions.resetToTemplate();
          }}
          className="shrink-0 rounded-lg border border-cream-300 px-3 py-1.5 text-[13px] font-medium text-ink/70 hover:bg-raised dark:border-moss-600 dark:text-fog/70 dark:hover:bg-moss-800"
        >
          Reset
        </button>
      </FilterBar>
    </div>
  );
}
