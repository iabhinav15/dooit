export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  date: string;
  expected: number;
  completed: number;
  percentage: number;
  level: HeatmapLevel;
}

export interface HeatmapData {
  year: number;
  years: number[];
  days: HeatmapDay[];
  totalExpected: number;
  totalCompleted: number;
  averagePercentage: number;
  activeDays: number;
  perfectDays: number;
}
