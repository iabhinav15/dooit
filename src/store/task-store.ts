"use client";

import { create } from "zustand";

import { formatDateKey } from "@/lib/date";
import type { CreateTaskInput, Task } from "@/types/task";

interface TaskStoreState {
  tasks: Task[];
  selectedDate: string;
  hydrated: boolean;
  loadTasks: () => void;
  setSelectedDate: (date: string) => void;
  addTask: (input: CreateTaskInput) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

import {
  addTaskAction,
  deleteTaskAction,
  getTasksAction,
  toggleTaskAction,
} from "@/app/actions/tasks";

const applySelectedDate = (tasks: Task[], selectedDate: string): Task[] =>
  tasks.map((task) => ({
    ...task,
    completed: task.completedDates.includes(selectedDate),
  }));

const toggleCompletedDate = (task: Task, selectedDate: string): Task => {
  const completedDates = task.completedDates.includes(selectedDate)
    ? task.completedDates.filter((date) => date !== selectedDate)
    : [...task.completedDates, selectedDate].sort();

  return {
    ...task,
    completedDates,
    completed: completedDates.includes(selectedDate),
  };
};

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: [],
  selectedDate: formatDateKey(new Date()),
  hydrated: false,
  loadTasks: async () => {
    try {
      const selectedDate = get().selectedDate;
      const dbTasks = await getTasksAction(selectedDate);
      set({
        tasks: dbTasks,
        hydrated: true,
      });
    } catch (e) {
      console.error("Failed to fetch tasks from DB", e);
      set({
        tasks: [],
        hydrated: true,
      });
    }
  },
  setSelectedDate: (date) => {
    set((state) => ({
      selectedDate: date,
      tasks: applySelectedDate(state.tasks, date),
    }));
  },
  addTask: async (input) => {
    const title = input.title.trim();

    if (!title) {
      return;
    }

    try {
      // Create an optimistic task temp id
      const tempId = `temp-${Date.now()}`;
      const tempTask: Task =
        input.type === "daily"
          ? {
              id: tempId,
              title,
              type: "daily",
              completed: false,
              completedDates: [],
            }
          : {
              id: tempId,
              title,
              type: "one-time",
              date: input.date!,
              completed: false,
              completedDates: [],
            };

      set({ tasks: [tempTask, ...get().tasks] });

      const newTask = await addTaskAction(input);
      set({ tasks: [newTask, ...get().tasks.filter(t => t.id !== tempId)] });
    } catch (e) {
      console.error("Failed to add task", e);
      // Could remove the optimistic task here on failure
    }
  },
  toggleTask: async (taskId) => {
    const selectedDate = get().selectedDate;
    const previousTasks = get().tasks;
    // Optimistic update
    const nextTasks = previousTasks.map((task) =>
      task.id === taskId ? toggleCompletedDate(task, selectedDate) : task,
    );
    set({ tasks: nextTasks });

    try {
      const updatedTask = await toggleTaskAction(taskId, selectedDate);
      if (updatedTask) {
        set({
          tasks: get().tasks.map((task) =>
            task.id === taskId ? updatedTask : task,
          ),
        });
      }
    } catch (e) {
      console.error("Failed to toggle task", e);
      // Revert optimistic update
      set({ tasks: previousTasks });
    }
  },
  deleteTask: async (taskId) => {
    // Optimistic update
    const previousTasks = get().tasks;
    const nextTasks = get().tasks.filter((task) => task.id !== taskId);
    set({ tasks: nextTasks });

    try {
      await deleteTaskAction(taskId);
    } catch (e) {
      console.error("Failed to delete task", e);
      // Revert optimistic update
      set({ tasks: previousTasks });
    }
  },
}));
