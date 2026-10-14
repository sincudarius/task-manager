import { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@tanstack/react-store";
import { boardStore, boardActions } from "../store/board-store";
import { hasActiveFilters, matchTask } from "../filters";
import type { BoardState, Column } from "../types";
import { TaskCard } from "./TaskCard";
import { QuickAdd } from "./QuickAdd";

export function BoardColumn({
  column,
  isDoneColumn,
}: {
  column: Column;
  isDoneColumn?: boolean;
}) {
  const tasksByColumn = useStore(boardStore, (s: BoardState) => s.tasksByColumn);
  const search = useStore(boardStore, (s: BoardState) => s.search);
  const filters = useStore(boardStore, (s: BoardState) => s.filters);
  const allTasks = tasksByColumn[column.id] ?? [];
  const tasks = allTasks.filter((t) => matchTask(t, search, filters));
  const filtering = hasActiveFilters(search, filters);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { kind: "column", columnId: column.id } });

  const commitRename = () => {
    boardActions.renameColumn(column.id, draft);
    setEditing(false);
  };

  const handleDelete = () => {
    if (allTasks.length > 0) {
      const ok = window.confirm(
        `Delete “${column.title}”? Its ${allTasks.length} task(s) will move to the first column.`,
      );
      if (!ok) return;
    }
    boardActions.deleteColumn(column.id);
  };

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex w-full flex-col rounded-2xl border border-cream-300 bg-raised/60 p-2 dark:border-moss-600 dark:bg-moss-900/40 ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
      aria-label={column.title}
    >
      <header className="flex items-center gap-1 px-1 pb-2 pt-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${column.title} to reorder`}
          title="Drag to reorder column"
          className="cursor-grab touch-none rounded px-1 text-ink/30 hover:bg-cream-200 hover:text-ink/60 active:cursor-grabbing dark:text-fog/30 dark:hover:bg-moss-800 dark:hover:text-fog/60"
        >
          ⠿
        </button>
        {editing ? (
          <form
            className="flex flex-1 gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              commitRename();
            }}
          >
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraft(column.title);
                  setEditing(false);
                }
              }}
              aria-label="Column title"
              className="w-full rounded-md border border-sage-500 bg-surface px-1.5 py-0.5 text-xs font-semibold text-ink outline-none dark:border-sage-400 dark:bg-moss-950 dark:text-fog"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(column.title);
              setEditing(true);
            }}
            title="Rename column"
            className="flex flex-1 items-center gap-2 truncate rounded px-1 text-left"
          >
            <span className="truncate text-xs font-semibold tracking-wide text-ink/70 dark:text-fog/70">
              {column.title}
            </span>
            <span className="rounded-full bg-cream-200 px-1.5 text-[11px] font-medium text-ink/60 dark:bg-moss-800 dark:text-fog/60">
              {allTasks.length}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${column.title}`}
          title="Delete column"
          className="rounded px-1.5 py-0.5 text-ink/30 hover:bg-clay-100 hover:text-clay-700 dark:text-fog/30 dark:hover:bg-clay-400/10 dark:hover:text-clay-400"
        >
          ×
        </button>
      </header>

      <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-1 pb-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              draggingDisabled={filtering}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-300 px-3 py-6 text-center text-xs text-ink/40 dark:border-moss-600 dark:text-fog/40">
            {filtering ? "No matches" : "Drop tasks here"}
          </div>
        ) : null}
      </div>

      {isDoneColumn ? (
        <button
          type="button"
          className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink/50 hover:bg-cream-200 dark:text-fog/50 dark:hover:bg-moss-800"
        >
          <span aria-hidden>⌕</span> See older work items
        </button>
      ) : null}
      <QuickAdd columnId={column.id} />
    </section>
  );
}
