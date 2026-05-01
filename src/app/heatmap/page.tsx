import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getHeatmapAction } from "@/app/actions/heatmap";
import { HeatmapCalendar } from "@/components/heatmap-calendar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function HeatmapPage() {
  const currentYear = new Date().getFullYear();
  const heatmapData = await getHeatmapAction(currentYear);

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-zinc-950 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hover:dark:bg-gray-400")}
            aria-label="Back to tasks"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              Dooit
            </p>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              Activity Heatmap
            </h1>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
          <HeatmapCalendar initialData={heatmapData} />
        </div>
      </div>
    </div>
  );
}
