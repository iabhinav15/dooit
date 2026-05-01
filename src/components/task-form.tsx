"use client";

import { type FormEvent, useEffect, useState } from "react";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CreateTaskInput, TaskType } from "@/types/task";

interface TaskFormProps {
  defaultDate: string;
  onAddTask: (input: CreateTaskInput) => void;
  onTaskAdded?: () => void;
  className?: string;
}

export const TaskForm = ({
  defaultDate,
  onAddTask,
  onTaskAdded,
  className,
}: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("daily");
  const [oneTimeDate, setOneTimeDate] = useState(defaultDate);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setOneTimeDate(defaultDate);
  }, [defaultDate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    if (taskType === "one-time" && !oneTimeDate) {
      return;
    }

    onAddTask({
      title: trimmedTitle,
      type: taskType,
      date: taskType === "one-time" ? oneTimeDate : undefined,
    });

    setTitle("");
    onTaskAdded?.();
  };

  return (
    <form
      className={cn(
        "space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700 dark:text-zinc-300"
          htmlFor="task-title"
        >
          New Task
        </label>
        <Input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-zinc-300"
            htmlFor="task-type"
          >
            Task Type
          </label>
          <div className="relative">
            <button
              type="button"
              id="task-type"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-700"
            >
              <span>{taskType === "daily" ? "Daily" : "One-Time"}</span>
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    className="flex w-full items-center px-3 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setTaskType("daily");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center px-3 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setTaskType("one-time");
                      setIsDropdownOpen(false);
                    }}
                  >
                    One-Time
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-zinc-300"
            htmlFor="task-date"
          >
            Task Date
          </label>
          <Input
            id="task-date"
            type="date"
            disabled={taskType !== "one-time"}
            value={oneTimeDate}
            onChange={(event) => setOneTimeDate(event.target.value)}
            required={taskType === "one-time"}
          />
        </div>
      </div>

      <Button className="w-full" type="submit">
        Add Task
      </Button>
    </form>
  );
};
