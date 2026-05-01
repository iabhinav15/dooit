"use client";

import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  buildDateWindow,
  formatDateKey,
  formatDayLabel,
  formatShortDateLabel,
  isTodayDateKey,
} from "@/lib/date";
import { cn } from "@/lib/utils";

interface DateNavProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}

export const DateNav = ({ selectedDate, onSelectDate }: DateNavProps) => {
  const dates = useMemo(() => buildDateWindow(new Date(), 30), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const selectedElement = container.querySelector('[data-selected="true"]') as HTMLElement;
    if (selectedElement) {
      const containerWidth = container.offsetWidth;
      const elementOffset = selectedElement.offsetLeft;
      const elementWidth = selectedElement.offsetWidth;
      
      const scrollPosition = elementOffset - containerWidth / 2 + elementWidth / 2;
      container.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  }, [selectedDate, dates]);

  return (
    <div className="border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max gap-2 pb-1">
          {dates.map((date) => {
            const dateKey = formatDateKey(date);
            const isSelected = dateKey === selectedDate;
            const isToday = isTodayDateKey(dateKey);

            return (
              <Button
                key={dateKey}
                type="button"
                data-selected={isSelected}
                variant={isSelected ? "default" : "secondary"}
                className={cn(
                  "h-auto min-w-[80px] flex-col gap-0.5 rounded-xl px-3 py-2 text-left",
                  !isSelected &&
                    "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
                )}
                onClick={() => onSelectDate(dateKey)}
              >
                <span className="text-xs font-medium uppercase tracking-wide">
                  {formatDayLabel(date)}
                </span>
                <span className="text-sm font-semibold">{formatShortDateLabel(date)}</span>
                {isToday ? <span className="text-[10px] uppercase">Today</span> : null}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
