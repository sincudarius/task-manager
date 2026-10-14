import { useStore } from "@tanstack/react-store";
import { boardStore, boardActions } from "../store/board-store";
import { BOARD_TEMPLATES } from "../templates";
import type { BoardState, BoardTemplateId } from "../types";

export function TemplatePicker() {
  const templateId = useStore(boardStore, (s: BoardState) => s.templateId);
  const tasksByColumn = useStore(boardStore, (s: BoardState) => s.tasksByColumn);

  return (
    <label className="flex shrink-0 items-center gap-2 text-[13px]">
      <span className="font-medium text-ink/60 dark:text-fog/60">Template</span>
      <select
        value={templateId}
        onChange={(e) => {
          const next = e.target.value as BoardTemplateId;
          const count = Object.values(tasksByColumn).flat().length;
          if (count > 0) {
            const ok = window.confirm(
              "Switch template? Current columns and tasks will be replaced.",
            );
            if (!ok) return;
          }
          boardActions.setTemplate(next);
        }}
        aria-label="Column template"
        className="rounded-lg border border-cream-300 bg-surface px-2 py-1.5 text-[13px] font-medium text-ink outline-none focus:border-sage-500 dark:border-moss-600 dark:bg-moss-900 dark:text-fog dark:focus:border-sage-400"
      >
        {BOARD_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id} title={t.hint}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
