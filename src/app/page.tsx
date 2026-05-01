import { TodoApp } from "@/components/todo-app";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <TodoApp />
    </div>
  );
}
