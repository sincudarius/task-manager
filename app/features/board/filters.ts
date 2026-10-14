import type { BoardFilters, Task } from "./types";

export const DEFAULT_FILTERS: BoardFilters = {
  assignees: [],
  epic: null,
  type: null,
  label: null,
  priorities: [],
};

export function matchTask(task: Task, search: string, filters: BoardFilters): boolean {
  const q = search.trim().toLowerCase();
  if (
    q &&
    !(
      task.title.toLowerCase().includes(q) ||
      task.key.toLowerCase().includes(q) ||
      (task.tag ?? "").toLowerCase().includes(q)
    )
  ) {
    return false;
  }
  if (filters.assignees.length > 0 && !filters.assignees.includes(task.assignee ?? "")) {
    return false;
  }
  if (filters.epic !== null && task.epic !== filters.epic) return false;
  if (filters.type !== null && task.type !== filters.type) return false;
  if (filters.label !== null && task.tag !== filters.label) return false;
  if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
    return false;
  }
  return true;
}

export function hasActiveFilters(search: string, filters: BoardFilters): boolean {
  return (
    search.trim().length > 0 ||
    filters.assignees.length > 0 ||
    filters.epic !== null ||
    filters.type !== null ||
    filters.label !== null ||
    filters.priorities.length > 0
  );
}
