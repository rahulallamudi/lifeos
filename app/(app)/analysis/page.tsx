"use client";

import { useMemo, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import Card from "@/components/Card";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { useTasks } from "@/hooks/useTasks";
import { isToday, parseDate } from "@/lib/date";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AnalysisPage() {
  const [currentTime] = useState(() => Date.now());
  const { tasks } = useTasks();
  const completed = tasks.filter((task) => task.status === "done").length;
  const pending = tasks.filter((task) => task.status !== "done").length;
  const inProgress = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const overdue = tasks.filter((task) => {
    const dueDate = parseDate(task.due_date);

    return Boolean(
      dueDate && dueDate.getTime() < currentTime && task.status !== "done"
    );
  }).length;
  const dueToday = tasks.filter((task) => {
    return task.status !== "done" && isToday(task.due_date);
  }).length;
  const upcoming = tasks.filter((task) => {
    const dueDate = parseDate(task.due_date);

    return Boolean(
      dueDate && dueDate.getTime() >= currentTime && !isToday(dueDate)
    );
  }).length;
  const quickWins = tasks.filter((task) => {
    if (!task.started_at || !task.completed_at) {
      return false;
    }

    const duration =
      new Date(task.completed_at).getTime() -
      new Date(task.started_at).getTime();

    return duration / 60000 < 15;
  }).length;
  const slowMoves = tasks.filter((task) => {
    if (!task.started_at || !task.completed_at) {
      return false;
    }

    const duration =
      new Date(task.completed_at).getTime() -
      new Date(task.started_at).getTime();

    return duration / 60000 > 60;
  }).length;

  const completionData = useMemo(() => {
    return {
      labels: ["Completed", "In Progress", "Pending"],
      datasets: [
        {
          data: [completed, inProgress, pending - inProgress],
          backgroundColor: ["#16a34a", "#f59e0b", "#334155"],
          borderWidth: 0,
        },
      ],
    };
  }, [completed, inProgress, pending]);

  const dueDateData = useMemo(() => {
    return {
      labels: ["Overdue", "Due Today", "Upcoming"],
      datasets: [
        {
          label: "Tasks",
          data: [overdue, dueToday, upcoming],
          backgroundColor: ["#ef4444", "#3b82f6", "#14b8a6"],
        },
      ],
    };
  }, [dueToday, overdue, upcoming]);

  return (
    <Container>
      <div className="space-y-8">
        <PageHeader
          title="Analysis"
          subtitle="See how your workload is moving across completion and due dates"
        />

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <p className="text-sm text-gray-500">Completed</p>
            <h2 className="mt-2 text-2xl font-semibold">{completed}</h2>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Pending</p>
            <h2 className="mt-2 text-2xl font-semibold">{pending}</h2>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Quick Wins</p>
            <h2 className="mt-2 text-2xl font-semibold">{quickWins}</h2>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Slow Tasks</p>
            <h2 className="mt-2 text-2xl font-semibold">{slowMoves}</h2>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Completion Split</h2>
            <Pie data={completionData} />
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">Due Date Pressure</h2>
            <Bar data={dueDateData} />
          </Card>
        </div>
      </div>
    </Container>
  );
}
