"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, User, Activity } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

import { DateNav } from "@/components/date-nav";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatLongDateLabel } from "@/lib/date";
import { getDailyTasks, getOneTimeTasksByDate } from "@/lib/task-filters";
import { useTaskStore } from "@/store/task-store";

export const TodoApp = () => {
  const [isAddTaskSheetOpen, setIsAddTaskSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);

  const {
    tasks,
    selectedDate,
    hydrated,
    loadTasks,
    setSelectedDate,
    addTask,
    toggleTask,
    deleteTask,
  } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const dailyTasks = useMemo(() => getDailyTasks(tasks), [tasks]);
  const oneTimeTasks = useMemo(
    () => getOneTimeTasksByDate(tasks, selectedDate),
    [tasks, selectedDate],
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gradient-to-b from-slate-50 via-slate-100 to-emerald-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <header className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              Dooit
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Plan Your Day
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {formatLongDateLabel(selectedDate)}
            </p>
          </div>

          <div className="flex gap-2">
            <Sheet
              open={isSettingsSheetOpen}
              onOpenChange={setIsSettingsSheetOpen}
            >
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  aria-label="Account Settings"
                >
                  <User className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle>Account</SheetTitle>
                  <SheetDescription>
                    Manage your profile and app settings.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="mb-3 text-sm font-medium text-slate-900 dark:text-zinc-100">
                      Activity & Stats
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      <Link href="/heatmap" className="flex items-center gap-2">
                        <Activity className="mr-2 h-4 w-4" />
                        View Heatmap
                      </Link>
                    </Button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="mb-4 text-sm text-slate-600 dark:text-zinc-400">
                      You are currently signed in to your account.
                    </p>
                    <form action={logoutAction}>
                      <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                      >
                        Sign out
                      </Button>
                    </form>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet
              open={isAddTaskSheetOpen}
              onOpenChange={setIsAddTaskSheetOpen}
            >
              <SheetTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  aria-label="Add task"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-4 pr-8">
                  <SheetTitle>Add Task</SheetTitle>
                  <SheetDescription>
                    Create a daily recurring task or a one-time task for a
                    specific date.
                  </SheetDescription>
                </SheetHeader>

                <TaskForm
                  defaultDate={selectedDate}
                  onAddTask={addTask}
                  onTaskAdded={() => setIsAddTaskSheetOpen(false)}
                  className="border-0 bg-transparent p-0 dark:bg-transparent"
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-4 pb-4">
        <Tabs
          defaultValue="daily"
          className="rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <TabsList>
            <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
            <TabsTrigger value="one-time">One-Time Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <TaskList
              tasks={dailyTasks}
              hydrated={hydrated}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddTaskClick={() => setIsAddTaskSheetOpen(true)}
              emptyTitle="No daily tasks yet"
              emptyDescription="Add routines like Workout, Read, or Meditate."
            />
          </TabsContent>

          <TabsContent value="one-time">
            <TaskList
              tasks={oneTimeTasks}
              hydrated={hydrated}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddTaskClick={() => setIsAddTaskSheetOpen(true)}
              emptyTitle="No one-time tasks for this date"
              emptyDescription="Tap + to create date-specific tasks."
            />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="sticky bottom-0 mt-auto">
        <DateNav selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </footer>
    </div>
  );
};
