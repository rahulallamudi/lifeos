"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { Value as CalendarValue } from "react-calendar/dist/shared/types.js";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Card from "@/components/Card";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PriorityBadge from "@/components/PriorityBadge";
import { Task, useTasks } from "@/hooks/useTasks";
import {
  fromDateInputValue,
  getTodayDate,
  toDateInputValue,
} from "@/lib/date";
import {
  groupTasksByPriority,
  sortTasksByPriority,
} from "@/lib/taskPresentation";

type ProgressView = "day" | "week" | "month" | "year";

const progressViews: ProgressView[] = ["day", "week", "month", "year"];

const Calendar = dynamic(() => import("react-calendar"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
      Loading calendar...
    </div>
  ),
});

const ProgressHeatmap = dynamic(() => import("@/components/ProgressHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
      Loading heatmap...
    </div>
  ),
});

type ProgressTaskCardProps = {
  task: Task;
  dragHandle?: ReactNode;
  compact?: boolean;
  extraAction?: ReactNode;
  onStartTask: (taskId: string) => Promise<void>;
  onMarkComplete: (taskId: string) => Promise<void>;
  onDeleteTask: (task: Task) => Promise<void>;
};

function ProgressTaskCard({
  task,
  dragHandle,
  compact = false,
  extraAction,
  onStartTask,
  onMarkComplete,
  onDeleteTask,
}: ProgressTaskCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl border border-white bg-white p-4 shadow-sm ${
        compact ? "opacity-90" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`font-semibold ${
                task.status === "done"
                  ? "text-gray-400 line-through"
                  : "text-black"
              }`}
            >
              {task.title}
            </p>
            <PriorityBadge priority={task.priority} />
          </div>

          <p className="text-xs text-gray-500">
            {task.due_date
              ? `Scheduled for ${task.due_date}`
              : "No date assigned yet"}
          </p>
        </div>

        {dragHandle}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {extraAction}

        {task.status === "todo" && (
          <button
            onClick={() => void onStartTask(task.id)}
            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200"
          >
            Start
          </button>
        )}

        {task.status === "in-progress" && (
          <button
            onClick={() => void onMarkComplete(task.id)}
            className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-200"
          >
            Complete
          </button>
        )}

        <button
          onClick={() => void onDeleteTask(task)}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

type DraggableProgressTaskCardProps = {
  task: Task;
  extraAction?: ReactNode;
  onStartTask: (taskId: string) => Promise<void>;
  onMarkComplete: (taskId: string) => Promise<void>;
  onDeleteTask: (task: Task) => Promise<void>;
};

function DraggableProgressTaskCard({
  task,
  extraAction,
  onStartTask,
  onMarkComplete,
  onDeleteTask,
}: DraggableProgressTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.45 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <ProgressTaskCard
        task={task}
        extraAction={extraAction}
        onStartTask={onStartTask}
        onMarkComplete={onMarkComplete}
        onDeleteTask={onDeleteTask}
        dragHandle={
          <button
            {...listeners}
            {...attributes}
            className="touch-none rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
          >
            Drag
          </button>
        }
      />
    </div>
  );
}

type TaskLaneProps = {
  laneId: string;
  title: string;
  description: string;
  tasks: Task[];
  emptyDescription: string;
  renderExtraAction?: (task: Task) => ReactNode;
  onStartTask: (taskId: string) => Promise<void>;
  onMarkComplete: (taskId: string) => Promise<void>;
  onDeleteTask: (task: Task) => Promise<void>;
};

function TaskLane({
  laneId,
  title,
  description,
  tasks,
  emptyDescription,
  renderExtraAction,
  onStartTask,
  onMarkComplete,
  onDeleteTask,
}: TaskLaneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: laneId,
  });

  const groupedTasks = groupTasksByPriority(tasks);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl border p-5 shadow-sm transition ${
        isOver ? "border-red-300 bg-red-50/80" : "border-white bg-white/90"
      }`}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {groupedTasks.length === 0 ? (
        <EmptyState
          title="No tasks yet - start from Notes"
          description={emptyDescription}
          icon="*"
        />
      ) : (
        <div className="space-y-6">
          {groupedTasks.map((group) => (
            <div
              key={group.key}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${group.meta.sectionClassName}`}
                >
                  {group.meta.title}
                </span>
                <span className="text-xs text-gray-400">
                  {group.tasks.length} task{group.tasks.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {group.tasks.map((task) => (
                  <DraggableProgressTaskCard
                    key={task.id}
                    task={task}
                    extraAction={renderExtraAction?.(task)}
                    onStartTask={onStartTask}
                    onMarkComplete={onMarkComplete}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<ProgressView>("day");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const {
    tasks,
    deleteTask,
    startTask,
    markTaskComplete,
    updateTask,
  } = useTasks();

  const todayDate = getTodayDate();
  const selectedDateKey = toDateInputValue(selectedDate);

  const todayTasks = useMemo(() => {
    return sortTasksByPriority(
      tasks.filter((task) => task.due_date === todayDate)
    );
  }, [tasks, todayDate]);

  const selectedTasks = useMemo(() => {
    return sortTasksByPriority(
      tasks.filter((task) => task.due_date === selectedDateKey)
    );
  }, [selectedDateKey, tasks]);

  const activeTask = useMemo(() => {
    return tasks.find((task) => task.id === activeTaskId) ?? null;
  }, [activeTaskId, tasks]);

  const completedCount = selectedTasks.filter(
    (task) => task.status === "done"
  ).length;
  const pendingCount = selectedTasks.length - completedCount;

  async function moveTaskToDate(task: Task, dueDate: string, label: string) {
    try {
      await updateTask(task.id, { due_date: dueDate });
      toast.success(`Moved "${task.title}" to ${label}.`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't move the task right now.");
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    try {
      await deleteTask(task.id);
      toast.success("Task deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete the task.");
    }
  }

  async function handleStartTask(taskId: string) {
    try {
      await startTask(taskId);
      toast.success("Task started.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't start the task.");
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      await markTaskComplete(taskId);
      toast.success("Task completed.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't complete the task.");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) {
      return;
    }

    const movedTask = tasks.find((task) => task.id === String(active.id));

    if (!movedTask) {
      return;
    }

    if (String(over.id) === "today-zone") {
      await moveTaskToDate(movedTask, todayDate, "Today");
    }

    if (String(over.id) === "selected-zone") {
      await moveTaskToDate(movedTask, selectedDateKey, selectedDateKey);
    }
  }

  return (
    <Container>
      <div className="space-y-8">
        <PageHeader
          title="Progress"
          subtitle={`Plan visually, review ${view}-level progress, and drag work between Today and future dates`}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card>
            <div className="mb-4 flex flex-wrap gap-2">
              {progressViews.map((progressView) => (
                <button
                  key={progressView}
                  onClick={() => setView(progressView)}
                  className={`rounded-full px-3 py-1 text-sm shadow ${
                    view === progressView
                      ? "bg-red-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {progressView}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="selected-date"
                  className="block text-sm font-medium text-gray-600"
                >
                  Selected date
                </label>
                <input
                  id="selected-date"
                  type="date"
                  value={selectedDateKey}
                  onChange={(event) =>
                    setSelectedDate(fromDateInputValue(event.target.value))
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-3">
                <Calendar
                  onChange={(value: CalendarValue) => {
                    if (value instanceof Date) {
                      setSelectedDate(value);
                    } else if (Array.isArray(value) && value[0] instanceof Date) {
                      setSelectedDate(value[0]);
                    }
                  }}
                  value={selectedDate}
                  className="lifeos-calendar"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {completedCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="mt-2 text-2xl font-semibold">{pendingCount}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <ProgressHeatmap tasks={tasks} />
              </div>
            </div>
          </Card>

          <DndContext
            onDragStart={(event) => setActiveTaskId(String(event.active.id))}
            onDragEnd={(event) => void handleDragEnd(event)}
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TaskLane
                laneId="today-zone"
                title="Today"
                description="Drop tasks here to pull them into execution mode."
                tasks={todayTasks}
                emptyDescription="No tasks yet - start from Notes and pull a goal into Today."
                renderExtraAction={(task) =>
                  task.due_date === todayDate ? null : (
                    <button
                      onClick={() => void moveTaskToDate(task, todayDate, "Today")}
                      className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white"
                    >
                      Add to Today
                    </button>
                  )
                }
                onStartTask={handleStartTask}
                onMarkComplete={handleCompleteTask}
                onDeleteTask={handleDeleteTask}
              />

              <TaskLane
                laneId="selected-zone"
                title={`Selected Day: ${selectedDateKey}`}
                description="Plan work visually, then drag the important tasks into Today."
                tasks={selectedTasks}
                emptyDescription="No tasks on this date yet - create one from Notes or drag future work here."
                renderExtraAction={(task) =>
                  task.due_date === selectedDateKey ? null : (
                    <button
                      onClick={() =>
                        void moveTaskToDate(task, selectedDateKey, selectedDateKey)
                      }
                      className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white"
                    >
                      Move Here
                    </button>
                  )
                }
                onStartTask={handleStartTask}
                onMarkComplete={handleCompleteTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="w-[320px]">
                  <ProgressTaskCard
                    task={activeTask}
                    compact
                    onStartTask={handleStartTask}
                    onMarkComplete={handleCompleteTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </Container>
  );
}
