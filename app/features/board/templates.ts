import type { BoardState, BoardTemplateId, Column, Task } from "./types";

export const BOARD_TEMPLATES: { id: BoardTemplateId; label: string; hint: string }[] = [
  { id: "basic", label: "Basic", hint: "To Do / In Progress / Done" },
  { id: "review", label: "Review flow", hint: "To Do … PO Review / Done" },
  { id: "blank", label: "Blank", hint: "One empty column" },
];

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

function col(title: string): Column {
  return { id: uid("col"), title };
}

const DEMO_TASKS: Task[] = [
  {
    id: "task_seed_1",
    key: "HADES-1443",
    title: "[BE] → Journal Handling Multiple Work IDs",
    tag: "Outbound General",
    assignee: "AF",
    priority: "high",
    type: "Story",
    epic: "Outbound",
  },
  {
    id: "task_seed_2",
    key: "HADES-1830",
    title: "[BE] → Log publisher stops after 10 ish minutes",
    assignee: "AF",
    priority: "medium",
    type: "Bug",
    epic: "Platform",
  },
];

export function buildBoardFromTemplate(templateId: BoardTemplateId): Pick<BoardState, "columns" | "tasksByColumn" | "templateId"> {
  if (templateId === "basic") {
    const columns = [col("TO DO"), col("IN PROGRESS"), col("DONE")];
    return {
      templateId,
      columns,
      tasksByColumn: Object.fromEntries(columns.map((c) => [c.id, []])),
    };
  }
  if (templateId === "blank") {
    const columns = [col("TO DO")];
    return {
      templateId,
      columns,
      tasksByColumn: Object.fromEntries(columns.map((c) => [c.id, []])),
    };
  }
  // review — default, mirrors the 6-column example
  const titles = ["TO DO", "IN PROGRESS", "CODE REVIEW", "QUALITY REVIEW", "PO REVIEW", "DONE"];
  const columns = titles.map((t) => col(t));
  const tasksByColumn: Record<string, Task[]> = Object.fromEntries(
    columns.map((c) => [c.id, []]),
  );
  tasksByColumn[columns[0].id] = [...DEMO_TASKS];
  return { templateId, columns, tasksByColumn };
}

export function nextTaskKey(tasksByColumn: Record<string, Task[]>): string {
  let max = 1830;
  for (const list of Object.values(tasksByColumn)) {
    for (const t of list) {
      const m = /HADES-(\d+)/.exec(t.key);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return `HADES-${max + 1}`;
}
