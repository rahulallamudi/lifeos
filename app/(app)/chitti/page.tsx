"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Card from "@/components/Card";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { useTasks } from "@/hooks/useTasks";
import { generatePlan, PlannerSlot } from "@/lib/services/plannerService";

type ChittiMode = "replan" | "optimize" | "reduce-overload";

const modeConfig: Record<
  ChittiMode,
  {
    label: string;
    description: string;
    instruction: string;
  }
> = {
  replan: {
    label: "Replan my day",
    description: "Reshuffle the day around what is still left.",
    instruction:
      "Replan the remaining day around unfinished work and create a realistic sequence.",
  },
  optimize: {
    label: "Optimize my schedule",
    description: "Find the smartest ordering for time and energy.",
    instruction:
      "Optimize the schedule for momentum, urgency, and energy matching.",
  },
  "reduce-overload": {
    label: "Reduce overload",
    description: "Cut the plan down so it feels manageable again.",
    instruction:
      "Reduce overload, trim the plan, and keep only the highest-impact work.",
  },
};

export default function ChittiPage() {
  const [input, setInput] = useState("");
  const [availableTime, setAvailableTime] = useState("90");
  const [energyLevel, setEnergyLevel] = useState("medium");
  const [urgency, setUrgency] = useState("balanced");
  const [mode, setMode] = useState<ChittiMode>("replan");
  const [plan, setPlan] = useState<PlannerSlot[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { tasks, addTask } = useTasks();

  useEffect(() => {
    if (!successMsg) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMsg("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [successMsg]);

  const planGuidance = useMemo(() => {
    if (plan.length === 0) {
      return null;
    }

    const quickCount = Math.min(2, plan.length);
    const quickTasks = plan.slice(0, quickCount).map((item) => item.task);
    const laterTask = plan[quickCount]?.task ?? plan[plan.length - 1]?.task;

    if (!laterTask) {
      return `Start with ${quickTasks.join(" and ")}.`;
    }

    return `Do ${quickTasks.length} quick task${
      quickTasks.length === 1 ? "" : "s"
    } now: ${quickTasks.join(", ")}. Then move into ${laterTask} later.`;
  }, [plan]);

  async function handlePlan() {
    if (!input.trim()) {
      return;
    }

    setLoading(true);

    try {
      const prompt = `
Mode: ${modeConfig[mode].label}
Mode goal: ${modeConfig[mode].instruction}

Goals and constraints:
${input.trim()}

Available time: ${availableTime} minutes
Energy level: ${energyLevel}
Urgency: ${urgency}

Current task titles:
${tasks.map((task) => `- ${task.title}`).join("\n")}

Instructions:
- Return a JSON array only.
- Each item must match: { "time": "HH:MM", "task": "..." }.
- If energy is low, schedule 2-3 quick wins first before deep work.
- If urgency is high, front-load the most urgent work.
- If mode is reduce overload, keep the plan lighter and more realistic.
- Keep the plan realistic for the available time.
`;

      const data = await generatePlan(prompt, tasks, addTask);
      console.log(data);
      setPlan(data.plan || []);
      setSuccessMsg("Chitti generated a smarter plan and synced new tasks.");
      toast.success("Chitti generated a smarter plan and synced new tasks.");
    } catch (err) {
      console.error(err);
      toast.error("Chitti couldn't generate a plan right now.");
    } finally {
      setLoading(false);
    }
  }

  const addStatus =
    plan.length > 0
      ? "Generated items were also added into your task system."
      : "Plans you generate here can flow straight into tasks.";

  return (
    <Container>
      <div className="space-y-8">
        <PageHeader
          title="Chitti"
          subtitle="Use AI to replan, optimize, or reduce overload so the output feels like a real superpower"
        />

        <Card>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(Object.keys(modeConfig) as ChittiMode[]).map((modeKey) => {
              const item = modeConfig[modeKey];

              return (
                <motion.button
                  key={modeKey}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(modeKey)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    mode === modeKey
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <p className="font-semibold text-black">{item.label}</p>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Time left
              </label>
              <input
                value={availableTime}
                onChange={(event) => setAvailableTime(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="90"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Energy level
              </label>
              <select
                value={energyLevel}
                onChange={(event) => setEnergyLevel(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="balanced">Balanced</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe your day, what feels heavy, and what absolutely must get done..."
            className="mt-4 h-32 w-full rounded-lg border border-gray-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              onClick={() => void handlePlan()}
              className="rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
            >
              {loading ? "Generating..." : modeConfig[mode].label}
            </button>

            <p className="text-sm text-gray-600">{addStatus}</p>
          </div>

          {successMsg && (
            <div className="mt-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
              {successMsg}
            </div>
          )}

          {plan.length > 0 && (
            <div className="mt-4 rounded bg-white p-4 shadow">
              <h3 className="mb-2 font-semibold">Generated Plan</h3>

              {plan.map((item, index) => (
                <div
                  key={`${item.task}-${index}`}
                  className="flex items-center justify-between border-b py-2"
                >
                  <span>{item.task}</span>
                  <span className="text-sm text-gray-500">
                    {item.reason || "Generated by Chitti"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {planGuidance && (
          <Card>
            <p className="text-sm font-semibold text-red-600">Chitti strategy</p>
            <p className="mt-3 text-lg font-semibold text-black">{planGuidance}</p>
          </Card>
        )}
      </div>
    </Container>
  );
}
