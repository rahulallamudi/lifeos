"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import TaskList from "@/components/TaskList";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useTasks } from "@/hooks/useTasks";
import { isToday } from "@/lib/date";

type DailyTask = {
  id: string;
  title: string;
  autoAdd: boolean;
};

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

export default function DailyTasksPage() {
  const [dailyTasks, setDailyTasks] = useLocalStorageState<DailyTask[]>(
    "daily-tasks",
    []
  );
  const [newTask, setNewTask] = useState("");
  const pendingSync = useRef(new Set<string>());
  const {
    isLoading,
    tasks,
    addTask,
    deleteTask,
    startTask,
    markTaskComplete,
    toggleFocus,
  } = useTasks();

  const todaysTaskTitles = useMemo(() => {
    return new Set(
      tasks
        .filter((task) => isToday(task.due_date))
        .map((task) => normalizeTitle(task.title))
    );
  }, [tasks]);

  const todaysRepeatingTasks = useMemo(() => {
    const repeatingTaskTitles = new Set(
      dailyTasks.map((task) => normalizeTitle(task.title))
    );

    return tasks.filter((task) => {
      return (
        isToday(task.due_date) &&
        repeatingTaskTitles.has(normalizeTitle(task.title))
      );
    });
  }, [dailyTasks, tasks]);

  useEffect(() => {
    if (isLoading || dailyTasks.length === 0) {
      return;
    }

    const missingTasks = dailyTasks.filter((task) => {
      if (!task.autoAdd) {
        return false;
      }

      const title = normalizeTitle(task.title);
      return !todaysTaskTitles.has(title) && !pendingSync.current.has(title);
    });

    if (missingTasks.length === 0) {
      return;
    }

    let cancelled = false;

    async function syncDailyTasks() {
      for (const task of missingTasks) {
        const title = normalizeTitle(task.title);
        pendingSync.current.add(title);

        try {
          if (cancelled) {
            return;
          }

          await addTask(task.title);
        } finally {
          pendingSync.current.delete(title);
        }
      }
    }

    void syncDailyTasks();

    return () => {
      cancelled = true;
    };
  }, [addTask, dailyTasks, isLoading, todaysTaskTitles]);

  function addDailyTask() {
    const title = newTask.trim();

    if (!title) {
      return;
    }

    setDailyTasks((currentTasks) => [
      ...currentTasks,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        autoAdd: true,
      },
    ]);
    setNewTask("");
  }

  function toggleAutoAdd(id: string) {
    setDailyTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, autoAdd: !task.autoAdd } : task
      )
    );
  }

  function removeDailyTask(id: string) {
    setDailyTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
  }

  return (
    <Container>
      <div className="space-y-8">
        <PageHeader
          title="Daily Tasks"
          subtitle="Manage repeating work that should automatically show up in Today"
        />

        <Card>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="Add a repeating daily task"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              onClick={addDailyTask}
              className="rounded-lg bg-red-500 px-5 py-3 text-white transition hover:bg-red-600"
            >
              Add Daily Task
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Repeating Tasks</h2>
          <div className="mt-4 space-y-3">
            {dailyTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No repeating tasks yet.</p>
            ) : (
              dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-black">{task.title}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {task.autoAdd
                        ? "Auto-adds to Today when missing."
                        : "Saved as a template only."}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleAutoAdd(task.id)}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-black transition hover:bg-gray-200"
                    >
                      {task.autoAdd ? "Disable Auto-Add" : "Enable Auto-Add"}
                    </button>

                    <button
                      onClick={() => removeDailyTask(task.id)}
                      className="rounded-lg bg-white px-4 py-2 text-sm text-red-600 shadow-sm transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">
            Today&apos;s Generated Daily Tasks
          </h2>
          <TaskList
            tasks={todaysRepeatingTasks}
            onDeleteTask={deleteTask}
            onStartTask={startTask}
            onMarkComplete={markTaskComplete}
            onToggleFocus={toggleFocus}
          />
        </Card>
      </div>
    </Container>
  );
}
