import { useState } from "react";
import { boardActions } from "../store/board-store";

export function QuickAdd({ columnId }: { columnId: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-sage-700 hover:bg-sage-100 dark:text-sage-300 dark:hover:bg-moss-800"
      >
        <span aria-hidden className="text-base leading-none">
          +
        </span>
        Create
      </button>
    );
  }

  const submit = () => {
    if (!value.trim()) {
      setOpen(false);
      return;
    }
    boardActions.addTask(columnId, value);
    setValue("");
    setOpen(false);
  };

  return (
    <form
      className="mt-2 rounded-xl border border-cream-300 bg-surface p-2 dark:border-moss-600 dark:bg-moss-900"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setValue("");
          }
        }}
        placeholder="Task title"
        aria-label="New task title"
        className="w-full rounded-lg border border-cream-300 bg-paper px-2 py-1.5 text-[13px] text-ink outline-none placeholder:text-ink/40 focus:border-sage-500 dark:border-moss-600 dark:bg-moss-950 dark:text-fog dark:placeholder:text-fog/40 dark:focus:border-sage-400"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-sage-700 px-3 py-1 text-[13px] font-medium text-white hover:bg-sage-800 dark:bg-sage-500 dark:text-moss-950 dark:hover:bg-sage-400"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setValue("");
          }}
          className="rounded-lg px-3 py-1 text-[13px] text-ink/60 hover:bg-raised dark:text-fog/60 dark:hover:bg-moss-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
