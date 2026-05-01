export type TaskType = "daily" | "one-time";

interface BaseTask {
  id: string;
  title: string;
  completed: boolean;
  completedDates: string[];
}

export interface DailyTask extends BaseTask {
  type: "daily";
}

export interface OneTimeTask extends BaseTask {
  type: "one-time";
  date: string;
}

export type Task = DailyTask | OneTimeTask;

export interface CreateTaskInput {
  title: string;
  type: TaskType;
  date?: string;
}

