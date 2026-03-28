"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { useStreak } from "@/hooks/useStreak";
import { useTasks } from "@/hooks/useTasks";
import { parseDate } from "@/lib/date";
import { appLinks } from "@/lib/navigation";

const chartColors = ["#22c55e", "#ef4444"];

function isThisWeek(dateStr?: string) {
  const date = parseDate(dateStr);

  if (!date) {
    return false;
  }

  const today = new Date();
  const firstDay = new Date(today);
  firstDay.setHours(0, 0, 0, 0);
  firstDay.setDate(today.getDate() - today.getDay());

  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);

  return date >= firstDay && date <= lastDay;
}

export default function DashboardPage() {
  const { tasks, focusTask } = useTasks();
  const { streak } = useStreak(tasks);
  const pages = appLinks.filter((page) => page.href !== "/dashboard");
  const thisWeekTasks = tasks.filter((task) => isThisWeek(task.due_date));
  const completed = thisWeekTasks.filter((task) => task.status === "done").length;
  const pending = thisWeekTasks.length - completed;
  const chartData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  return (
    <Container>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Emotion first, then focus, then weekly execution, then navigation"
        />

        <div className="text-lg font-semibold text-black">🐦‍🔥 {streak}</div>

        {focusTask && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-md"
          >
            <h2 className="mb-2 text-sm text-red-500">Focus now</h2>
            <h1 className="text-2xl font-bold text-black">{focusTask.title}</h1>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white p-8 shadow-md"
        >
          <h2 className="mb-4 text-lg font-semibold text-black">
            Weekly Performance
          </h2>

          {thisWeekTasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tasks scheduled for this week yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex min-w-[400px] justify-center">
                <PieChart
                  width={400}
                  height={400}
                >
                  <Pie
                    data={chartData}
                    dataKey="value"
                    outerRadius={140}
                    label
                  >
                    {chartColors.map((color) => (
                      <Cell
                        key={color}
                        fill={color}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <motion.a
              key={page.href}
              href={page.href}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-lg font-semibold text-black">{page.name}</p>
              <p className="mt-2 text-sm text-gray-600">
                Open {page.name.toLowerCase()}.
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </Container>
  );
}
