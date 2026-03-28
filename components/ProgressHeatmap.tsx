"use client";

import { useMemo } from "react";
import { Task } from "@/hooks/useTasks";
import { getTodayDate, shiftDateKey, toDateKey } from "@/lib/date";

type ProgressHeatmapProps = {
  tasks: Task[];
};

type HeatmapCell = {
  date: string;
  completed: number;
  scheduled: number;
  level: "empty" | "low" | "medium" | "high";
};

function getHeatLevel(completed: number, scheduled: number) {
  if (completed === 0 && scheduled === 0) {
    return "empty" as const;
  }

  const score = scheduled === 0 ? completed : completed / scheduled;

  if (score >= 1 || completed >= 3) {
    return "high" as const;
  }

  if (score >= 0.5 || completed >= 1) {
    return "medium" as const;
  }

  return "low" as const;
}

const levelClassMap = {
  empty: "bg-gray-100 border-gray-200",
  low: "bg-red-200 border-red-300",
  medium: "bg-yellow-200 border-yellow-300",
  high: "bg-emerald-300 border-emerald-400",
};

export default function ProgressHeatmap({ tasks }: ProgressHeatmapProps) {
  const cells = useMemo(() => {
    const today = getTodayDate();
    const dates: HeatmapCell[] = [];

    for (let offset = 27; offset >= 0; offset -= 1) {
      const date = shiftDateKey(today, -offset) ?? today;
      const completed = tasks.filter((task) => {
        return task.status === "done" && toDateKey(task.completed_at) === date;
      }).length;
      const scheduled = tasks.filter((task) => task.due_date === date).length;

      dates.push({
        date,
        completed,
        scheduled,
        level: getHeatLevel(completed, scheduled),
      });
    }

    return dates;
  }, [tasks]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-black">Productivity Heatmap</h3>
          <p className="text-xs text-gray-500">
            Green means strong momentum. Red means low completion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-gray-200 bg-gray-100" />
            Empty
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-red-300 bg-red-200" />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-yellow-300 bg-yellow-200" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-emerald-400 bg-emerald-300" />
            High
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.date}
            title={`${cell.date}: ${cell.completed} completed / ${cell.scheduled} scheduled`}
            className={`aspect-square rounded-lg border ${levelClassMap[cell.level]}`}
          />
        ))}
      </div>
    </div>
  );
}
