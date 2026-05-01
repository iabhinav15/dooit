import { addDays } from "date-fns";

import { buildDateWindow, formatDateKey } from "@/lib/date";
import { getDailyTasks, getOneTimeTasksByDate } from "@/lib/task-filters";
import type { Task } from "@/types/task";

const baseDate = new Date("2026-04-10T00:00:00.000Z");

const createTask = (overrides: Partial<Task>): Task => ({
  id: "task-id",
  title: "Task title",
  type: "daily",
  completed: false,
  completedDates: [],
  ...overrides,
} as Task);

describe("task logic", () => {
  it("creates a seven-day window centered around the given date", () => {
    const dates = buildDateWindow(baseDate, 3);

    expect(dates).toHaveLength(7);
    expect(formatDateKey(dates[0])).toBe(formatDateKey(addDays(baseDate, -3)));
    expect(formatDateKey(dates[6])).toBe(formatDateKey(addDays(baseDate, 3)));
  });

  it("returns only recurring daily tasks", () => {
    const tasks: Task[] = [
      createTask({ id: "1", type: "daily", title: "Workout" }),
      createTask({
        id: "2",
        type: "one-time",
        title: "Interview",
        date: "2026-04-10",
      }),
    ];

    const dailyTasks = getDailyTasks(tasks);

    expect(dailyTasks).toHaveLength(1);
    expect(dailyTasks[0]?.title).toBe("Workout");
  });

  it("returns only one-time tasks matching the selected date", () => {
    const tasks: Task[] = [
      createTask({
        id: "1",
        type: "one-time",
        title: "Doctor visit",
        date: "2026-04-10",
      }),
      createTask({
        id: "2",
        type: "one-time",
        title: "Project launch",
        date: "2026-04-12",
      }),
      createTask({ id: "3", type: "daily", title: "Read" }),
    ];

    const oneTimeTasks = getOneTimeTasksByDate(tasks, "2026-04-10");

    expect(oneTimeTasks).toHaveLength(1);
    expect(oneTimeTasks[0]?.title).toBe("Doctor visit");
  });
});
