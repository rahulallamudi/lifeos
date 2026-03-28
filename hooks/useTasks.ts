"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { getCurrentTimestamp, getTodayDate, toDateKey } from "@/lib/date";

export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  completed?: boolean;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  category?: "day" | "week" | "month" | "year";
  priority?: "high" | "medium" | "low";
  focus?: boolean;
  importance?: number;
  estimated_time?: number;
  position?: number;
};

type AddTaskOptions = {
  dueDate?: string;
};

type NormalizableTask = Omit<Task, "status" | "completed"> & {
  completed?: boolean | null;
  status?: string | null;
};

function normalizeStatus(task: NormalizableTask): TaskStatus {
  if (task.completed) {
    return "done";
  }

  if (task.status === "done" || task.status === "completed") {
    return "done";
  }

  if (task.status === "in-progress" || task.status === "in_progress") {
    return "in-progress";
  }

  return "todo";
}

function normalizeTask(task: NormalizableTask): Task {
  const status = normalizeStatus(task);

  return {
    ...task,
    completed: task.completed ?? status === "done",
    status,
    started_at: task.started_at ?? undefined,
    completed_at: task.completed_at ?? undefined,
    due_date: task.due_date ?? undefined,
  };
}

function toDatabaseUpdates(updates: Partial<Task>) {
  const databaseUpdates: Record<string, unknown> = {};

  if ("title" in updates) {
    databaseUpdates.title = updates.title ?? null;
  }

  if ("due_date" in updates) {
    databaseUpdates.due_date = updates.due_date ?? null;
  }

  if ("category" in updates) {
    databaseUpdates.category = updates.category ?? null;
  }

  if ("priority" in updates) {
    databaseUpdates.priority = updates.priority ?? null;
  }

  if ("importance" in updates) {
    databaseUpdates.importance = updates.importance ?? null;
  }

  if ("estimated_time" in updates) {
    databaseUpdates.estimated_time = updates.estimated_time ?? null;
  }

  if ("position" in updates) {
    databaseUpdates.position = updates.position ?? null;
  }

  if ("status" in updates && updates.status) {
    databaseUpdates.status = updates.status;
    databaseUpdates.completed = updates.status === "done";
  }

  return databaseUpdates;
}

export function useTasks(initialTasks: Task[] = []) {
  const [rawTasks, setRawTasks] = useState<Task[]>(initialTasks.map(normalizeTask));
  const [focusedTaskIds, setFocusedTaskIds] = useLocalStorageState<string[]>(
    "lifeos-focused-task-ids",
    []
  );
  const [isLoading, setIsLoading] = useState(initialTasks.length === 0);
  const supabase = useMemo(() => createClient(), []);
  const todayDate = useMemo(() => getTodayDate(), []);
  const focusedTaskIdSet = useMemo(() => {
    return new Set(focusedTaskIds);
  }, [focusedTaskIds]);
  const tasks = useMemo(() => {
    return rawTasks.map((task) => ({
      ...task,
      focus: focusedTaskIdSet.has(task.id),
    }));
  }, [focusedTaskIdSet, rawTasks]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTasks() {
      setIsLoading(true);

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });

      if (isMounted) {
        setRawTasks((data || []).map(normalizeTask));
        setIsLoading(false);
      }
    }

    void fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const addTask = useCallback(
    async (title: string, options: AddTaskOptions = {}) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            status: "todo",
            completed: false,
            due_date: options.dueDate ?? getTodayDate(),
          },
        ])
        .select();

      if (error) {
        console.error(error);
        throw new Error("Failed to add task");
      }

      if (data) {
        setRawTasks((prev) => [...prev, ...data.map(normalizeTask)]);
      }
    },
    [supabase]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const databaseUpdates = toDatabaseUpdates(updates);

      if (Object.keys(databaseUpdates).length > 0) {
        const { error } = await supabase
          .from("tasks")
          .update(databaseUpdates)
          .eq("id", id);

        if (error) {
          console.error(error);
          throw new Error("Failed to update task");
        }
      }

      setRawTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? normalizeTask({
                ...task,
                ...updates,
                completed:
                  updates.status === "done"
                    ? true
                    : updates.status
                      ? false
                      : task.completed,
              })
            : task
        )
      );
    },
    [supabase]
  );

  const startTask = useCallback(
    async (id: string) => {
      await updateTask(id, {
        status: "in-progress",
        started_at: getCurrentTimestamp(),
      });
    },
    [updateTask]
  );

  const markTaskComplete = useCallback(
    async (id: string) => {
      await updateTask(id, {
        status: "done",
        completed_at: getCurrentTimestamp(),
      });
    },
    [updateTask]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) {
        console.error(error);
        throw new Error("Failed to delete task");
      }

      setRawTasks((prev) => prev.filter((task) => task.id !== id));
      setFocusedTaskIds((currentIds) =>
        currentIds.filter((taskId) => taskId !== id)
      );
    },
    [setFocusedTaskIds, supabase]
  );

  const toggleFocus = useCallback(
    (id: string) => {
      setFocusedTaskIds((currentIds) =>
        currentIds.includes(id)
          ? currentIds.filter((taskId) => taskId !== id)
          : [...currentIds, id]
      );
    },
    [setFocusedTaskIds]
  );

  const grouped = {
    day: tasks.filter((t) => t.category === "day"),
    week: tasks.filter((t) => t.category === "week"),
    month: tasks.filter((t) => t.category === "month"),
    year: tasks.filter((t) => t.category === "year"),
  };

  const scoredTasks = tasks
    .filter((t) => t.status !== "done")
    .map((task) => {
      let score = 0;

      if (task.priority === "high") score += 5;
      if (task.priority === "medium") score += 3;
      if (task.priority === "low") score += 1;

      if (task.due_date) {
        const dueDate = toDateKey(task.due_date);

        if (dueDate === todayDate) {
          score += 3;
        }
      }

      return { ...task, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const suggestedTasks = scoredTasks;
  const focusTask =
    tasks.find((task) => {
      return task.priority === "high" && task.focus && task.status !== "done";
    }) || null;

  return {
    isLoading,
    tasks,
    grouped,
    addTask,
    deleteTask,
    suggestedTasks,
    focusTask,
    updateTask,
    startTask,
    markTaskComplete,
    toggleFocus,
  };
}
