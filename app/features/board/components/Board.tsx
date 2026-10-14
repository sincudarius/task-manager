import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useStore } from "@tanstack/react-store";
import { boardStore } from "../store/board-store";
import { useBoardDnd } from "../hooks/use-board-dnd";
import { BoardToolbar } from "./BoardToolbar";
import { BoardColumn } from "./BoardColumn";
import type { BoardState } from "../types";

export function Board() {
  const columns = useStore(boardStore, (s: BoardState) => s.columns);
  const tasksByColumn = useStore(boardStore, (s: BoardState) => s.tasksByColumn);
  const search = useStore(boardStore, (s: BoardState) => s.search);
  const dnd = useBoardDnd();

  const activeTaskFull =
    dnd.activeTask != null
      ? Object.values(tasksByColumn)
          .flat()
          .find((t) => t.id === dnd.activeTask?.id) ?? null
      : null;

  const activeColumn = dnd.activeColumnId
    ? columns.find((c) => c.id === dnd.activeColumnId) ?? null
    : null;

  const searching = search.trim().length > 0;

  return (
    <main className="flex min-h-[calc(100vh-72px)] w-full flex-col gap-5 px-[16px] pb-10">
      <BoardToolbar />
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={closestCorners}
        onDragStart={dnd.onDragStart}
        onDragOver={searching ? undefined : dnd.onDragOver}
        onDragEnd={dnd.onDragEnd}
        onDragCancel={dnd.onDragCancel}
      >
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex min-h-[60vh] flex-1 items-stretch gap-3 pb-4" role="list" aria-label="Board columns">
            {columns.map((column, index) => (
              <div key={column.id} role="listitem" className="flex min-w-0 flex-1">
                <BoardColumn
                  column={column}
                  isDoneColumn={index === columns.length - 1 && column.title === "DONE"}
                />
              </div>
            ))}
            {columns.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-cream-300 p-8 text-sm text-ink/50 dark:border-moss-600 dark:text-fog/50">
                No columns yet — add one above or switch template.
              </p>
            ) : null}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeTaskFull ? (
            <div className="w-64 rounded-xl border border-sage-500 bg-surface p-3 text-[13px] font-medium shadow-lg dark:border-sage-400 dark:bg-moss-900">
              {activeTaskFull.title}
            </div>
          ) : activeColumn ? (
            <div className="w-72 rounded-2xl border border-sage-500 bg-raised p-3 text-xs font-semibold shadow-lg dark:border-sage-400 dark:bg-moss-800">
              {activeColumn.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
