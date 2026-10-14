import { Store } from "@tanstack/react-store";
import { arrayMove } from "@dnd-kit/sortable";
import { buildBoardFromTemplate, nextTaskKey, uid } from "../templates";
import { DEFAULT_FILTERS } from "../filters";
import type { BoardState, BoardTemplateId, Priority, Task } from "../types";

const STORAGE_KEY = "tm-board-v1";

function loadInitial(): BoardState {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BoardState;
        if (Array.isArray(parsed.columns) && parsed.tasksByColumn) {
          // Merge defaults so boards saved before filters existed still load.
          const tasksByColumn = parsed.tasksByColumn as Record<string, Task[]>;
          for (const list of Object.values(tasksByColumn)) {
            for (const t of list) {
              if (!t.type) t.type = "Task";
            }
          }
          return {
            ...parsed,
            tasksByColumn,
            filters: { ...DEFAULT_FILTERS, ...(parsed.filters ?? {}) },
            search: "",
          };
        }
      }
    } catch {
      // fall through to seed
    }
  }
  const seed = buildBoardFromTemplate("review");
  return { ...seed, filters: { ...DEFAULT_FILTERS }, search: "" };
}

export const boardStore = new Store<BoardState>(loadInitial());

if (typeof localStorage !== "undefined") {
  boardStore.subscribe(() => {
    try {
      const s = boardStore.state;
      const { search: _search, ...persisted } = s;
      void _search;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // storage unavailable — keep in-memory state
    }
  });
}

function set(patch: Partial<BoardState>) {
  boardStore.setState((prev) => ({ ...prev, ...patch }));
}

export const boardActions = {
  setSearch(search: string) {
    set({ search });
  },

  setTemplate(templateId: BoardTemplateId) {
    const built = buildBoardFromTemplate(templateId);
    boardStore.setState((prev) => ({
      ...prev,
      ...built,
      filters: { ...DEFAULT_FILTERS },
      search: "",
    }));
  },

  resetToTemplate() {
    const built = buildBoardFromTemplate(boardStore.state.templateId);
    boardStore.setState((prev) => ({ ...prev, ...built, filters: { ...DEFAULT_FILTERS } }));
  },

  addColumn(title: string) {
    const name = title.trim() || `COLUMN ${boardStore.state.columns.length + 1}`;
    const column = { id: uid("col"), title: name.toUpperCase() };
    boardStore.setState((prev) => ({
      ...prev,
      columns: [...prev.columns, column],
      tasksByColumn: { ...prev.tasksByColumn, [column.id]: [] },
    }));
  },

  renameColumn(columnId: string, title: string) {
    const name = title.trim();
    if (!name) return;
    boardStore.setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === columnId ? { ...c, title: name.toUpperCase() } : c)),
    }));
  },

  deleteColumn(columnId: string) {
    boardStore.setState((prev) => {
      const remaining = prev.columns.filter((c) => c.id !== columnId);
      if (remaining.length === 0) return prev;
      const orphaned = prev.tasksByColumn[columnId] ?? [];
      const tasksByColumn: Record<string, Task[]> = {};
      for (const c of remaining) tasksByColumn[c.id] = prev.tasksByColumn[c.id] ?? [];
      tasksByColumn[remaining[0].id] = [...tasksByColumn[remaining[0].id], ...orphaned];
      delete tasksByColumn[columnId];
      return { ...prev, columns: remaining, tasksByColumn };
    });
  },

  reorderColumns(activeId: string, overId: string) {
    if (activeId === overId) return;
    boardStore.setState((prev) => {
      const from = prev.columns.findIndex((c) => c.id === activeId);
      const to = prev.columns.findIndex((c) => c.id === overId);
      if (from < 0 || to < 0) return prev;
      return { ...prev, columns: arrayMove(prev.columns, from, to) };
    });
  },

  addTask(columnId: string, title: string) {
    const name = title.trim();
    if (!name) return;
    boardStore.setState((prev) => {
      const task: Task = {
        id: uid("task"),
        key: nextTaskKey(prev.tasksByColumn),
        title: name,
        assignee: "ME",
        priority: "none",
        type: "Task",
      };
      return {
        ...prev,
        tasksByColumn: {
          ...prev.tasksByColumn,
          [columnId]: [...(prev.tasksByColumn[columnId] ?? []), task],
        },
      };
    });
  },

  /** Move a task to another column (append) — used on drag-over. */
  moveTaskToColumn(taskId: string, toColumnId: string) {
    boardStore.setState((prev) => {
      let fromColumn: string | null = null;
      let task: Task | null = null;
      for (const [cid, list] of Object.entries(prev.tasksByColumn)) {
        const found = list.find((t) => t.id === taskId);
        if (found) {
          fromColumn = cid;
          task = found;
          break;
        }
      }
      if (!task || fromColumn === toColumnId) return prev;
      return {
        ...prev,
        tasksByColumn: {
          ...prev.tasksByColumn,
          [fromColumn as string]: (prev.tasksByColumn[fromColumn as string] ?? []).filter(
            (t) => t.id !== taskId,
          ),
          [toColumnId]: [...(prev.tasksByColumn[toColumnId] ?? []), task],
        },
      };
    });
  },

  /** Reorder / cross-move on drop onto a task. */
  dropTaskOnTask(activeId: string, overId: string) {
    if (activeId === overId) return;
    boardStore.setState((prev) => {
      let fromColumn: string | null = null;
      let toColumn: string | null = null;
      let task: Task | null = null;
      for (const [cid, list] of Object.entries(prev.tasksByColumn)) {
        if (list.some((t) => t.id === activeId)) {
          fromColumn = cid;
          task = list.find((t) => t.id === activeId) ?? null;
        }
        if (list.some((t) => t.id === overId)) toColumn = cid;
      }
      if (!task || !fromColumn || !toColumn) return prev;
      if (fromColumn === toColumn) {
        const list = prev.tasksByColumn[fromColumn];
        return {
          ...prev,
          tasksByColumn: {
            ...prev.tasksByColumn,
            [fromColumn]: arrayMove(
              list,
              list.findIndex((t) => t.id === activeId),
              list.findIndex((t) => t.id === overId),
            ),
          },
        };
      }
      const source = (prev.tasksByColumn[fromColumn] ?? []).filter((t) => t.id !== activeId);
      const dest = [...(prev.tasksByColumn[toColumn] ?? [])];
      const overIndex = dest.findIndex((t) => t.id === overId);
      dest.splice(overIndex < 0 ? dest.length : overIndex, 0, task);
      return {
        ...prev,
        tasksByColumn: { ...prev.tasksByColumn, [fromColumn]: source, [toColumn]: dest },
      };
    });
  },

  /** Drop onto an (empty) column — append to end. */
  dropTaskOnColumn(taskId: string, columnId: string) {
    boardStore.setState((prev) => {
      let fromColumn: string | null = null;
      let task: Task | null = null;
      for (const [cid, list] of Object.entries(prev.tasksByColumn)) {
        const found = list.find((t) => t.id === taskId);
        if (found) {
          fromColumn = cid;
          task = found;
          break;
        }
      }
      if (!task || !fromColumn) return prev;
      if (fromColumn === columnId) {
        // dropped on its own column container → move to end
        const list = prev.tasksByColumn[fromColumn].filter((t) => t.id !== taskId);
        return {
          ...prev,
          tasksByColumn: { ...prev.tasksByColumn, [fromColumn]: [...list, task] },
        };
      }
      return {
        ...prev,
        tasksByColumn: {
          ...prev.tasksByColumn,
          [fromColumn]: (prev.tasksByColumn[fromColumn] ?? []).filter((t) => t.id !== taskId),
          [columnId]: [...(prev.tasksByColumn[columnId] ?? []), task],
        },
      };
    });
  },

  // ---- filter bar ----

  toggleAssigneeFilter(assignee: string) {
    boardStore.setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        assignees: prev.filters.assignees.includes(assignee)
          ? prev.filters.assignees.filter((a) => a !== assignee)
          : [...prev.filters.assignees, assignee],
      },
    }));
  },

  setEpicFilter(epic: string | null) {
    set({ filters: { ...boardStore.state.filters, epic } });
  },

  setTypeFilter(type: string | null) {
    set({ filters: { ...boardStore.state.filters, type } });
  },

  setLabelFilter(label: string | null) {
    set({ filters: { ...boardStore.state.filters, label } });
  },

  removePriorityFilter(priority: Priority) {
    boardStore.setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        priorities: prev.filters.priorities.filter((p) => p !== priority),
      },
    }));
  },

  applyQuickFilter(id: "my-work" | "high-priority") {
    if (id === "my-work") {
      set({ filters: { ...DEFAULT_FILTERS, assignees: ["ME"] } });
    } else {
      set({ filters: { ...DEFAULT_FILTERS, priorities: ["high"] } });
    }
  },

  clearFilters() {
    boardStore.setState((prev) => ({ ...prev, filters: { ...DEFAULT_FILTERS }, search: "" }));
  },
};
