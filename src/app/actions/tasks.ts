"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDateKey } from "@/lib/date";
import type { CreateTaskInput, Task } from "@/types/task";

interface PersistedTask {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  date: string | null;
  completions?: Array<{ date: string }>;
}

// Mapper to map Prisma Task to frontend Task type
function mapTask(
  task: PersistedTask,
  selectedDate = formatDateKey(new Date()),
): Task {
  const todayKey = formatDateKey(new Date());
  const persistedCompletedDates =
    task.completions?.map((completion: { date: string }) => completion.date) ??
    [];
  const completedDates =
    task.completed && !persistedCompletedDates.includes(todayKey)
      ? [...persistedCompletedDates, todayKey]
      : persistedCompletedDates;
  const completed =
    completedDates.includes(selectedDate) ||
    (task.completed && selectedDate === todayKey);

  if (task.type === "daily") {
    return {
      id: task.id,
      title: task.title,
      type: "daily",
      completed,
      completedDates,
    };
  } else {
    return {
      id: task.id,
      title: task.title,
      type: "one-time",
      date: task.date || "",
      completed,
      completedDates,
    };
  }
}

const isDateKey = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function getTasksAction(
  selectedDate = formatDateKey(new Date()),
): Promise<Task[]> {
  const session = await getSession();
  if (!session?.userId) return [];

  const tasks = await prisma.task.findMany({
    where: { userId: session.userId },
    include: {
      completions: {
        select: { date: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return tasks.map((task) => mapTask(task, selectedDate));
}

export async function addTaskAction(input: CreateTaskInput): Promise<Task> {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const task = await prisma.task.create({
    data: {
      title: input.title,
      type: input.type,
      date: input.date || null,
      userId: session.userId,
    },
    include: {
      completions: {
        select: { date: true },
        orderBy: { date: "asc" },
      },
    },
  });
  return mapTask(task);
}

export async function toggleTaskAction(
  taskId: string,
  dateKey = formatDateKey(new Date()),
): Promise<Task | null> {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  if (!isDateKey(dateKey)) throw new Error("Invalid date");

  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId: session.userId },
    include: {
      completions: {
        where: { date: dateKey },
        select: { id: true },
      },
    },
  });
  if (!existing) return null;
  if (existing.type === "one-time" && existing.date !== dateKey) {
    throw new Error("One-time tasks can only be completed on their task date");
  }
  if (
    existing.type === "daily" &&
    dateKey < formatDateKey(existing.createdAt)
  ) {
    throw new Error("Daily tasks cannot be completed before they were created");
  }

  const completion = existing.completions[0];
  const isLegacyCompletedToday =
    existing.completed && dateKey === formatDateKey(new Date());
  const wasCompleted = Boolean(completion) || isLegacyCompletedToday;

  if (wasCompleted && completion) {
    await prisma.taskCompletion.delete({ where: { id: completion.id } });
  } else if (!wasCompleted) {
    await prisma.taskCompletion.create({
      data: {
        date: dateKey,
        taskId,
        userId: session.userId,
      },
    });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      completed:
        existing.type === "one-time" || dateKey === formatDateKey(new Date())
          ? !wasCompleted
          : existing.completed,
    },
    include: {
      completions: {
        select: { date: true },
        orderBy: { date: "asc" },
      },
    },
  });
  return mapTask(task, dateKey);
}

export async function deleteTaskAction(taskId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await prisma.task.deleteMany({ where: { id: taskId, userId: session.userId } });
  return true;
}
