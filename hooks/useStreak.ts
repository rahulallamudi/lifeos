"use client";

import { useEffect, useMemo } from "react";
import { Task } from "@/hooks/useTasks";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { getTodayDate, shiftDateKey, toDateKey } from "@/lib/date";

type StreakState = {
  lastCompletedDate: string | null;
  streak: number;
};

const initialStreakState: StreakState = {
  lastCompletedDate: null,
  streak: 0,
};

export function useStreak(tasks: Task[]) {
  const [streakState, setStreakState] = useLocalStorageState<StreakState>(
    "lifeos-streak",
    initialStreakState
  );

  const today = useMemo(() => getTodayDate(), []);
  const yesterday = useMemo(() => shiftDateKey(today, -1), [today]);
  const completedTasksToday = useMemo(() => {
    return tasks.filter((task) => {
      return task.status === "done" && toDateKey(task.completed_at) === today;
    }).length;
  }, [tasks, today]);

  useEffect(() => {
    if (completedTasksToday === 0) {
      return;
    }

    setStreakState((currentState) => {
      if (currentState.lastCompletedDate === today) {
        return currentState;
      }

      const nextStreak =
        currentState.lastCompletedDate === yesterday
          ? currentState.streak + 1
          : 1;

      return {
        lastCompletedDate: today,
        streak: nextStreak,
      };
    });
  }, [completedTasksToday, setStreakState, today, yesterday]);

  const streak =
    streakState.lastCompletedDate === today ||
    streakState.lastCompletedDate === yesterday
      ? streakState.streak
      : 0;

  const tasksLeftForDailyGoal = Math.max(0, 2 - completedTasksToday);
  const streakMessage =
    tasksLeftForDailyGoal === 0
      ? "Streak protected for today. Keep the momentum going."
      : `Finish ${tasksLeftForDailyGoal} task${
          tasksLeftForDailyGoal === 1 ? "" : "s"
        } to keep your streak alive.`;

  return {
    streak,
    completedTasksToday,
    streakMessage,
    hasCompletedSomethingToday: completedTasksToday > 0,
  };
}
