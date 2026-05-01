"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { getHeatmapAction } from "@/app/actions/heatmap";
import { Button } from "@/components/ui/button";
import { parseDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { HeatmapData, HeatmapDay, HeatmapLevel } from "@/types/heatmap";

interface HeatmapCalendarProps {
  initialData: HeatmapData;
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const levelClasses: Record<HeatmapLevel, string> = {
  0: "bg-slate-100 dark:bg-zinc-800",
  1: "bg-emerald-200 dark:bg-emerald-950",
  2: "bg-emerald-400 dark:bg-emerald-800",
  3: "bg-emerald-600 dark:bg-emerald-600",
  4: "bg-emerald-800 dark:bg-emerald-400",
};

const buildWeeks = (days: HeatmapDay[]): Array<Array<HeatmapDay | null>> => {
  if (days.length === 0) return [];

  const firstDay = parseDateKey(days[0].date).getDay();
  const paddedDays: Array<HeatmapDay | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...days,
  ];

  return Array.from(
    { length: Math.ceil(paddedDays.length / 7) },
    (_, weekIndex) => paddedDays.slice(weekIndex * 7, weekIndex * 7 + 7),
  );
};

const formatDayDetails = (day: HeatmapDay): string => {
  const label = format(parseDateKey(day.date), "MMM d, yyyy");

  if (day.expected === 0) {
    return `No tasks expected on ${label}`;
  }

  return `${day.completed} of ${day.expected} tasks completed on ${label} (${day.percentage}%)`;
};

export const HeatmapCalendar = ({ initialData }: HeatmapCalendarProps) => {
  const [data, setData] = useState(initialData);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const weeks = useMemo(() => buildWeeks(data.days), [data.days]);

  const monthLabels = useMemo(
    () =>
      weeks.map((week, index) => {
        const firstDay = week.find(Boolean);
        const previousDay = weeks[index - 1]?.find(Boolean);

        if (!firstDay) return "";

        const month = format(parseDateKey(firstDay.date), "MMM");

        if (!previousDay) return month;

        const previousMonth = format(parseDateKey(previousDay.date), "MMM");
        return month === previousMonth ? "" : month;
      }),
    [weeks],
  );

  const minYear = Math.min(...data.years);
  const maxYear = Math.max(...data.years);

  const loadYear = (year: number) => {
    setIsYearMenuOpen(false);

    startTransition(async () => {
      const nextData = await getHeatmapAction(year);
      setData(nextData);
      setHoveredDay(null);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {data.totalCompleted} of {data.totalExpected} expected tasks completed
          </p>
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
            {data.averagePercentage}% in {data.year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9"
            onClick={() => loadYear(data.year - 1)}
            disabled={isPending || data.year <= minYear}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsYearMenuOpen((isOpen) => !isOpen)}
              disabled={isPending}
              className="inline-flex h-9 min-w-24 items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-emerald-900"
              aria-label="Heatmap year"
              aria-haspopup="listbox"
              aria-expanded={isYearMenuOpen}
              aria-controls="heatmap-year-list"
            >
              <span>{data.year}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 transition-transform dark:text-zinc-400",
                  isYearMenuOpen && "rotate-180",
                )}
              />
            </button>

            {isYearMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsYearMenuOpen(false)}
                />
                <div
                  id="heatmap-year-list"
                  role="listbox"
                  aria-label="Heatmap year"
                  className="absolute left-1/2 top-full z-50 mt-2 max-h-64 w-32 -translate-x-1/2 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {data.years.map((year) => {
                    const isSelected = year === data.year;

                    return (
                      <button
                        key={year}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "flex h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-zinc-100 dark:hover:bg-zinc-800",
                          isSelected &&
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                        )}
                        onClick={() => loadYear(year)}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span>{year}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9"
            onClick={() => loadYear(data.year + 1)}
            disabled={isPending || data.year >= maxYear}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-500">
            Active days
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            {data.activeDays}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-500">
            Perfect days
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            {data.perfectDays}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-500">
            Completion
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            {data.averagePercentage}%
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-190">
          <div className="ml-9 grid auto-cols-[12px] grid-flow-col gap-0.75">
            {monthLabels.map((month, index) => (
              <div
                key={`${month}-${index}`}
                className="h-5 text-[11px] leading-5 text-slate-500 dark:text-zinc-400"
              >
                {month}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="grid grid-rows-7 gap-0.75 pt-px text-[11px] text-slate-500 dark:text-zinc-400">
              {weekdays.map((weekday, index) => (
                <div key={weekday} className="h-3 leading-3">
                  {index % 2 === 1 ? weekday : ""}
                </div>
              ))}
            </div>

            <div className="grid auto-cols-[12px] grid-flow-col gap-0.75">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-0.75">
                  {week.map((day, dayIndex) =>
                    day ? (
                      <button
                        key={day.date}
                        type="button"
                        title={formatDayDetails(day)}
                        aria-label={formatDayDetails(day)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onFocus={() => setHoveredDay(day)}
                        onBlur={() => setHoveredDay(null)}
                        className={cn(
                          "h-3 w-3 rounded-xs outline-none ring-emerald-500 transition hover:ring-2 focus-visible:ring-2",
                          levelClasses[day.level],
                        )}
                      />
                    ) : (
                      <span
                        key={`${weekIndex}-${dayIndex}`}
                        className="h-3 w-3"
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-5 text-sm text-slate-600 dark:text-zinc-300">
          {hoveredDay
            ? formatDayDetails(hoveredDay)
            : "Hover a day to view task completion details."}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as HeatmapLevel[]).map((level) => (
            <span
              key={level}
              className={cn("h-3 w-3 rounded-xs", levelClasses[level])}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
