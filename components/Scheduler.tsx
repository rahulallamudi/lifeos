"use client";

import type { PlannerSlot } from "@/lib/services/plannerService";

type SchedulerProps = {
  plan?: PlannerSlot[];
};

const DEFAULT_SLOTS: PlannerSlot[] = [
  { time: "08:00", task: "-" },
  { time: "10:00", task: "-" },
  { time: "12:00", task: "-" },
  { time: "14:00", task: "-" },
  { time: "16:00", task: "-" },
];

export default function Scheduler({ plan = DEFAULT_SLOTS }: SchedulerProps) {

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase">
        Schedule
      </h2>

      {plan.map((slot) => (
        <div
          key={slot.time}
          className="flex items-center justify-between px-3 py-2 rounded-lg border"
        >
          <span className="text-sm text-gray-500">{slot.time}</span>
          <span className="text-sm text-gray-900">{slot.task}</span>
        </div>
      ))}
    </div>
  );
}
