import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-clay-600",
  medium: "bg-harvest-400",
  low: "bg-sage-500",
  none: "bg-cream-300 dark:bg-moss-500",
};

const tagStyles =
  "inline-flex max-w-full items-center rounded-md bg-harvest-100 px-1.5 py-0.5 text-[11px] font-medium text-harvest-700 dark:bg-harvest-400/10 dark:text-harvest-400";

export function TaskCard({
  task,
  columnId,
  draggingDisabled,
}: {
  task: Task;
  columnId: string;
  draggingDisabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { kind: "task", taskId: task.id, columnId },
    disabled: draggingDisabled,
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`group cursor-grab touch-manipulation rounded-xl border border-cream-300 bg-surface p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-moss-600 dark:bg-moss-900 ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
      aria-label={task.title}
    >
      <p className="text-[13px] font-medium leading-snug text-ink dark:text-fog">{task.title}</p>
      {task.tag ? (
        <div className="mt-1.5 truncate">
          <span className={tagStyles}>{task.tag}</span>
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-sage-700 dark:text-sage-300">
          <span
            className={`inline-block h-2 w-2 rounded-full ${priorityStyles[task.priority]}`}
            aria-hidden
          />
          {task.key}
        </span>
        {task.assignee ? (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-800 text-[10px] font-semibold text-fog dark:bg-sage-400 dark:text-moss-950"
            title={task.assignee}
          >
            {task.assignee.slice(0, 2).toUpperCase()}
          </span>
        ) : null}
      </div>
    </article>
  );
}
