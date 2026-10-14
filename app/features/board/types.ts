export type Priority = "high" | "medium" | "low" | "none";

export interface Task {
  id: string;
  key: string;
  title: string;
  tag?: string;
  assignee?: string;
  priority: Priority;
  /** Issue type, e.g. Story / Bug / Task */
  type: string;
  /** Parent epic name, e.g. Outbound */
  epic?: string;
}

export interface Column {
  id: string;
  title: string;
}

export type BoardTemplateId = "basic" | "review" | "blank";

export interface BoardState {
  columns: Column[];
  tasksByColumn: Record<string, Task[]>;
  templateId: BoardTemplateId;
  search: string;
  filters: BoardFilters;
}

/** Filter-bar selection. Empty arrays / null mean "all". */
export interface BoardFilters {
  assignees: string[];
  epic: string | null;
  type: string | null;
  label: string | null;
  priorities: Priority[];
}

export type DragKind = "task" | "column";
