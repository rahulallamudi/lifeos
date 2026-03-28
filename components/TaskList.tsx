"use client";

import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { Task } from "@/hooks/useTasks";
import EmptyState from "./EmptyState";
import TaskItem from "./TaskItem";
import { groupTasksByPriority } from "@/lib/taskPresentation";

type TaskListProps = {
  tasks: Task[];
  onDeleteTask: (id: string) => Promise<void>;
  onStartTask: (id: string) => Promise<void>;
  onMarkComplete: (id: string) => Promise<void>;
  onToggleFocus?: (id: string) => void;
  renderExtraAction?: (task: Task) => ReactNode;
  emptyState?: {
    title: string;
    description: string;
    icon?: string;
  };
};

export default function TaskList({
  tasks,
  onDeleteTask,
  onStartTask,
  onMarkComplete,
  onToggleFocus,
  renderExtraAction,
  emptyState,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title ?? "No tasks yet — start from Notes"}
        description={
          emptyState?.description ??
          "Capture an idea in Notes, convert it into a goal, and it will show up here ready for action."
        }
        icon={emptyState?.icon}
      />
    );
  }

  const groupedTasks = groupTasksByPriority(tasks);

  return (
    <div className="space-y-6">
      {groupedTasks.map((group) => (
        <div
          key={group.key}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${group.meta.sectionClassName}`}>
              {group.meta.title}
            </span>
            <span className="text-xs text-gray-400">
              {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {group.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDeleteTask={onDeleteTask}
                onStartTask={onStartTask}
                onMarkComplete={onMarkComplete}
                onToggleFocus={onToggleFocus}
                extraAction={renderExtraAction?.(task)}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
