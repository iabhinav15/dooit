import { addDays, format, parse, startOfDay } from "date-fns";

const DATE_KEY_FORMAT = "yyyy-MM-dd";

export const formatDateKey = (date: Date): string =>
  format(startOfDay(date), DATE_KEY_FORMAT);

export const parseDateKey = (dateKey: string): Date =>
  parse(dateKey, DATE_KEY_FORMAT, new Date());

export const isTodayDateKey = (dateKey: string): boolean =>
  dateKey === formatDateKey(new Date());

export const buildDateWindow = (
  centerDate: Date,
  distanceFromCenter = 3,
): Date[] => {
  const start = addDays(startOfDay(centerDate), -distanceFromCenter);

  return Array.from({ length: distanceFromCenter * 2 + 1 }, (_, offset) =>
    addDays(start, offset),
  );
};

export const formatDayLabel = (date: Date): string => format(date, "EEE");

export const formatShortDateLabel = (date: Date): string => format(date, "d MMM");

export const formatLongDateLabel = (dateKey: string): string =>
  format(parseDateKey(dateKey), "EEEE, d MMMM");
