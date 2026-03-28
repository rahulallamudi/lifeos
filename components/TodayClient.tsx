"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { Task, useTasks } from "@/hooks/useTasks";
import { getTodayDate } from "@/lib/date";
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";

type TodayClientProps = {
  initialTasks?: Task[];
};

export default function TodayClient({
  initialTasks = [],
}: TodayClientProps) {
  const {
    tasks,
    addTask,
    deleteTask,
    startTask,
    markTaskComplete,
    toggleFocus,
  } = useTasks(initialTasks);
  const today = useMemo(() => getTodayDate(), []);
  const todayTasks = useMemo(() => {
    return tasks.filter((task) => task.due_date === today);
  }, [tasks, today]);
  const suggestions = useMemo(() => {
    return tasks
      .filter((task) => !task.completed)
      .slice(0, 3)
      .map((task) => ({
        id: task.id,
        title: task.title,
        reason: task.priority === "high" ? "High impact" : "Quick win",
      }));
  }, [tasks]);

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <PageHeader
          title="Today"
          subtitle="Focus on what actually matters"
        />

        <Card>
          <TaskInput addTask={addTask} />
        </Card>

        <Card>
          <div className="mt-4 rounded bg-white p-4 shadow">
            <h3 className="mb-3 font-semibold">🔥 Smart Picks</h3>

            {suggestions.map((task, i) => (
              <div
                key={`${task.id}-${i}`}
                className="flex items-center justify-between border-b py-2"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.reason}</p>
                </div>

                <button
                  onClick={() => void addTask(task.title)}
                  className="rounded bg-black px-3 py-1 text-sm text-white"
                >
                  + Add
                </button>
              </div>
            ))}

            {suggestions.length === 0 && (
              <p className="text-sm text-gray-500">No suggestions yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-medium">
            Today&apos;s Tasks
          </h2>

          {todayTasks.length === 0 ? (
            <p className="text-sm text-gray-400">
              No tasks for today
            </p>
          ) : (
            <TaskList
              tasks={todayTasks}
              onDeleteTask={deleteTask}
              onStartTask={startTask}
              onMarkComplete={markTaskComplete}
              onToggleFocus={toggleFocus}
              emptyState={{
                title: "No tasks yet - start from Notes",
                description:
                  "Capture one idea in Notes, convert it into a goal, and it will land here ready for execution.",
                icon: "*",
              }}
            />
          )}
        </Card>
      </motion.div>
    </Container>
  );
}
