"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDateKey } from "@/lib/date";
import type { HeatmapData, HeatmapDay, HeatmapLevel } from "@/types/heatmap";

const getDateKeysForYear = (year: number): string[] => {
  const dates: string[] = [];
  const date = new Date(year, 0, 1);

  while (date.getFullYear() === year) {
    dates.push(formatDateKey(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

const getYearFromDate = (date: Date): number => date.getFullYear();

const getYearFromDateKey = (dateKey: string): number =>
  Number(dateKey.slice(0, 4));

const getLevel = (expected: number, percentage: number): HeatmapLevel => {
  if (expected === 0 || percentage === 0) return 0;
  if (percentage < 25) return 1;
  if (percentage < 50) return 2;
  if (percentage < 100) return 3;
  return 4;
};

const buildEmptyHeatmap = (year: number): HeatmapData => ({
  year,
  years: [year],
  days: getDateKeysForYear(year).map((date) => ({
    date,
    expected: 0,
    completed: 0,
    percentage: 0,
    level: 0,
  })),
  totalExpected: 0,
  totalCompleted: 0,
  averagePercentage: 0,
  activeDays: 0,
  perfectDays: 0,
});

export async function getHeatmapAction(year: number): Promise<HeatmapData> {
  const requestedYear = Number.isInteger(year)
    ? Math.min(Math.max(year, 1970), 9999)
    : new Date().getFullYear();
  const session = await getSession();

  if (!session?.userId) {
    return buildEmptyHeatmap(requestedYear);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { createdAt: true },
  });

  if (!user) {
    return buildEmptyHeatmap(requestedYear);
  }

  const startKey = `${requestedYear}-01-01`;
  const endKey = `${requestedYear}-12-31`;
  const todayKey = formatDateKey(new Date());
  const dateKeys = getDateKeysForYear(requestedYear);
  const expectedByDate = new Map(dateKeys.map((date) => [date, 0]));
  const completedByDate = new Map(dateKeys.map((date) => [date, 0]));

  const tasks = await prisma.task.findMany({
    where: { userId: session.userId },
    select: {
      id: true,
      type: true,
      date: true,
      completed: true,
      createdAt: true,
      completions: {
        where: {
          date: {
            gte: startKey,
            lte: endKey,
          },
        },
        select: { date: true },
      },
    },
  });

  const years = new Set<number>([
    requestedYear,
    getYearFromDate(user.createdAt),
    new Date().getFullYear(),
  ]);

  tasks.forEach((task) => {
    years.add(getYearFromDate(task.createdAt));

    if (task.date) {
      years.add(getYearFromDateKey(task.date));
    }

    const completionDates = new Set<string>();

    task.completions.forEach((completion) => {
      completionDates.add(completion.date);
      years.add(getYearFromDateKey(completion.date));

      if (completion.date <= todayKey) {
        completedByDate.set(
          completion.date,
          (completedByDate.get(completion.date) ?? 0) + 1,
        );
      }
    });

    if (
      task.completed &&
      todayKey >= startKey &&
      todayKey <= endKey &&
      !completionDates.has(todayKey)
    ) {
      completedByDate.set(todayKey, (completedByDate.get(todayKey) ?? 0) + 1);
    }

    if (task.type === "daily") {
      const createdDateKey = formatDateKey(task.createdAt);

      dateKeys.forEach((dateKey) => {
        if (dateKey >= createdDateKey && dateKey <= todayKey) {
          expectedByDate.set(dateKey, (expectedByDate.get(dateKey) ?? 0) + 1);
        }
      });
      return;
    }

    if (task.date && task.date >= startKey && task.date <= endKey && task.date <= todayKey) {
      expectedByDate.set(task.date, (expectedByDate.get(task.date) ?? 0) + 1);
    }
  });

  const days: HeatmapDay[] = dateKeys.map((date) => {
    const expected = expectedByDate.get(date) ?? 0;
    const completed = completedByDate.get(date) ?? 0;
    const percentage =
      expected > 0 ? Math.min(100, Math.round((completed / expected) * 100)) : 0;

    return {
      date,
      expected,
      completed,
      percentage,
      level: getLevel(expected, percentage),
    };
  });

  const totalExpected = days.reduce((total, day) => total + day.expected, 0);
  const totalCompleted = days.reduce((total, day) => total + day.completed, 0);
  const averagePercentage =
    totalExpected > 0
      ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100))
      : 0;

  const yearList = Array.from(years);
  const minYear = Math.min(...yearList);
  const maxYear = Math.max(...yearList);

  return {
    year: requestedYear,
    years: Array.from(
      { length: maxYear - minYear + 1 },
      (_, index) => maxYear - index,
    ),
    days,
    totalExpected,
    totalCompleted,
    averagePercentage,
    activeDays: days.filter((day) => day.completed > 0).length,
    perfectDays: days.filter(
      (day) => day.expected > 0 && day.completed >= day.expected,
    ).length,
  };
}
