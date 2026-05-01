"use client";

import { useState } from "react";
import { Circle, CircleCheckBig, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  hydrated: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskClick?: () => void;
}

export const TaskList = ({
  tasks,
  hydrated,
  emptyTitle,
  emptyDescription,
  onToggleTask,
  onDeleteTask,
  onAddTaskClick,
}: TaskListProps) => {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-slate-500 dark:text-zinc-400">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
            {emptyTitle}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {emptyDescription}
          </p>
        </div>
        {onAddTaskClick && (
          <Button
            type="button"
            variant="default"
            size="icon"
            className="size-10 rounded-full"
            onClick={onAddTaskClick}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <button
              type="button"
              aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
              onClick={() => onToggleTask(task.id)}
              className="text-slate-500 transition hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
            >
              {task.completed ? (
                <CircleCheckBig className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium text-slate-800 dark:text-zinc-100",
                  task.completed &&
                    "text-slate-400 line-through dark:text-zinc-500",
                )}
              >
                {task.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {task.type === "daily" ? "Daily task" : `One-time task (${task.date})`}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
              onClick={() => setTaskToDelete(task.id)}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {taskToDelete && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm transition-opacity animate-in fade-in" 
            onClick={() => setTaskToDelete(null)} 
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              Delete Task
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setTaskToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                onDeleteTask(taskToDelete);
                setTaskToDelete(null);
              }}>Delete</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
