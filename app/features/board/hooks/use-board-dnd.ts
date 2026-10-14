import { useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { boardActions } from "../store/board-store";
import type { Task } from "../types";

export function useBoardDnd() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as
      | { kind: "task"; taskId: string; columnId: string }
      | { kind: "column"; columnId: string }
      | undefined;
    if (data?.kind === "column") setActiveColumnId(data.columnId);
    else setActiveColumnId(null);
    // active task overlay is resolved in Board from the store by id
    if (data?.kind === "task") {
      setActiveTask({ id: data.taskId } as Task);
    } else {
      setActiveTask(null);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeData = active.data.current as
      | { kind: "task"; taskId: string; columnId: string }
      | { kind: "column" }
      | undefined;
    if (activeData?.kind !== "task") return;

    const overData = over.data.current as
      | { kind: "task"; taskId: string; columnId: string }
      | { kind: "column"; columnId: string }
      | undefined;

    // Hovering a task in another column → move there (append-then-sort on drop)
    if (overData?.kind === "task") {
      const fromCol = (active.data.current as { columnId: string }).columnId;
      if (fromCol !== overData.columnId) {
        boardActions.moveTaskToColumn(activeData.taskId, overData.columnId);
        // keep active payload in sync so a subsequent drop lands correctly
        active.data.current = { kind: "task", taskId: activeData.taskId, columnId: overData.columnId };
      }
    } else if (overData?.kind === "column") {
      const fromCol = (active.data.current as { columnId: string }).columnId;
      if (fromCol !== overData.columnId) {
        boardActions.moveTaskToColumn(activeData.taskId, overData.columnId);
        active.data.current = { kind: "task", taskId: activeData.taskId, columnId: overData.columnId };
      }
    } else if (typeof over.id === "string" && over.id.startsWith("col_")) {
      // Fallback: over a column container without data
      const fromCol = (active.data.current as { columnId: string }).columnId;
      if (fromCol !== (over.id as string)) {
        boardActions.moveTaskToColumn(activeData.taskId, over.id as string);
        active.data.current = { kind: "task", taskId: activeData.taskId, columnId: over.id as string };
      }
    }
  };

  const clear = () => {
    setActiveTask(null);
    setActiveColumnId(null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      clear();
      return;
    }
    const activeData = active.data.current as
      | { kind: "task"; taskId: string; columnId: string }
      | { kind: "column"; columnId: string }
      | undefined;
    const overData = over.data.current as
      | { kind: "task"; taskId: string; columnId: string }
      | { kind: "column"; columnId: string }
      | undefined;

    if (activeData?.kind === "column") {
      const overColumnId = overData?.kind === "column" ? overData.columnId : String(over.id);
      boardActions.reorderColumns(activeData.columnId, overColumnId);
    } else if (activeData?.kind === "task") {
      if (overData?.kind === "task") {
        boardActions.dropTaskOnTask(activeData.taskId, overData.taskId);
      } else {
        const columnId =
          overData?.kind === "column" ? overData.columnId : String(over.id);
        boardActions.dropTaskOnColumn(activeData.taskId, columnId);
      }
    }
    clear();
  };

  return { sensors, activeTask, activeColumnId, onDragStart, onDragOver, onDragEnd, onDragCancel: clear };
}
