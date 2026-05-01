import type { DailyTask, OneTimeTask, Task } from "@/types/task";

export const getDailyTasks = (tasks: Task[]): DailyTask[] =>
  tasks.filter((task): task is DailyTask => task.type === "daily");

export const getOneTimeTasksByDate = (
  tasks: Task[],
  selectedDate: string,
): OneTimeTask[] =>
  tasks.filter(
    (task): task is OneTimeTask =>
      task.type === "one-time" && task.date === selectedDate,
  );
