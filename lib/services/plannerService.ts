import type { Task } from "@/hooks/useTasks";

export type PlannerTask = Pick<
  Task,
  "title" | "status" | "category" | "priority" | "importance" | "estimated_time"
>;
export type PlannerSlot = {
  time?: string;
  task: string;
  reason?: string;
};

export type PlannerResponse = {
  plan: PlannerSlot[];
};

type AddTaskHandler = (title: string) => Promise<void>;

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

export async function generatePlan(
  input: PlannerTask[] | string,
  tasks: Task[] = [],
  addTask?: AddTaskHandler
): Promise<PlannerResponse> {
  try {
    const requestBody =
      typeof input === "string"
        ? { prompt: input }
        : { tasks: input };

    const res = await fetch("/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("API ERROR:", text);
      return { plan: [] };
    }

    const rawData = (await res.json()) as PlannerResponse;
    const data = {
      plan: Array.isArray(rawData.plan) ? rawData.plan : [],
    };

    if (addTask) {
      const existingTitles = new Set(tasks.map((task) => normalizeTitle(task.title)));

      for (const item of data.plan) {
        const title = item.task.trim();

        if (!title || existingTitles.has(normalizeTitle(title))) {
          continue;
        }

        await addTask(title);
        existingTitles.add(normalizeTitle(title));
      }
    }

    return data;
  } catch (err) {
    console.error("Fetch failed:", err);
    return { plan: [] };
  }
}
