"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Task } from "@/hooks/useTasks";
import PriorityBadge from "./PriorityBadge";

type TaskItemProps = {
  task: Task;
  onDeleteTask: (id: string) => Promise<void>;
  onStartTask: (id: string) => Promise<void>;
  onMarkComplete: (id: string) => Promise<void>;
  onToggleFocus?: (id: string) => void;
  extraAction?: ReactNode;
};

export default function TaskItem({
  task,
  onDeleteTask,
  onStartTask,
  onMarkComplete,
  onToggleFocus,
  extraAction,
}: TaskItemProps) {
  const [steps, setSteps] = useState<Array<{ step: string }>>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const minutes =
    task.started_at && task.completed_at
      ? Math.round(
          (new Date(task.completed_at).getTime() -
            new Date(task.started_at).getTime()) /
            60000
        )
      : null;
  let label = "";

  if (minutes !== null) {
    if (minutes < 15) label = "\u26A1 Quick task";
    else if (minutes < 60) label = "\u23F1\uFE0F Normal";
    else label = "\u{1F422} Took longer";
  }

  async function breakIntoSteps() {
    setLoadingSteps(true);

    try {
      const res = await fetch("/api/ai-breakdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });
      let data = { steps: [] as { step: string }[] };

      try {
        const text = await res.text();
        if (text) {
          data = JSON.parse(text) as { steps: { step: string }[] };
        }
      } catch (err) {
        console.error("Invalid JSON response", err);
      }

      setSteps(data.steps || []);
      toast.success("Task broken into smaller steps.");
    } finally {
      setLoadingSteps(false);
    }
  }

  async function handleStartTask() {
    try {
      await onStartTask(task.id);
      toast.success("Task started.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t start the task.");
    }
  }

  async function handleMarkComplete() {
    setIsCompleting(true);

    try {
      await onMarkComplete(task.id);
      toast.success("Task completed.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t complete the task.");
    } finally {
      window.setTimeout(() => {
        setIsCompleting(false);
      }, 300);
    }
  }

  async function handleDeleteTask() {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    try {
      await onDeleteTask(task.id);
      toast.success("Task deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t delete the task.");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isCompleting ? [1, 1.03, 0.99, 1] : 1,
      }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="space-y-2"
    >
      <div
        className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
          task.status === "done"
            ? "border-emerald-200 bg-emerald-50"
            : "border-white bg-white"
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`font-medium ${
              task.status === "done"
                ? "line-through text-gray-400"
                : "text-black"
            }`}
          >
            {task.title}
          </span>

          <button
            onClick={() => void breakIntoSteps()}
            className="bg-purple-200 text-purple-700 px-2 py-1 rounded text-xs"
          >
            Break into steps
          </button>

          <PriorityBadge priority={task.priority} />

          {task.priority === "high" && onToggleFocus && (
            <button
              onClick={() => onToggleFocus(task.id)}
              className="rounded bg-black px-2 py-1 text-xs text-white"
            >
              {task.focus ? "Unfocus" : "Focus"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {extraAction}

          {task.status === "todo" && (
            <button
              onClick={() => void handleStartTask()}
              className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              Start Task
            </button>
          )}

          {task.status === "in-progress" && (
            <button
              onClick={() => void handleMarkComplete()}
              className="text-xs px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
            >
              Mark Complete
            </button>
          )}

          <button
            onClick={() => void handleDeleteTask()}
            className="text-gray-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {task.status === "done" && minutes !== null && (
        <p className="text-xs text-gray-700">
          Took {minutes} mins {"\u2022"} {label}
        </p>
      )}

      {loadingSteps && (
        <p className="text-xs text-gray-700">
          Breaking task down...
        </p>
      )}

      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 overflow-hidden"
          >
            {steps.map((item, i) => (
              <p
                key={`${task.id}-step-${i}`}
                className="text-xs text-gray-700"
              >
                {i + 1}. {item.step}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
