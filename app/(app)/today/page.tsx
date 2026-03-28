import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TodayClient from "@/components/TodayClient";
import { Task } from "@/hooks/useTasks";

export default async function TodayPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ✅ SERVER-SIDE DATA FETCH (IMPORTANT)
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("SSR TASK FETCH ERROR:", error.message);
  }

  return <TodayClient initialTasks={(tasks as Task[]) ?? []} />;
}