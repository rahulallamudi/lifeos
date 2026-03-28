"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "AI Planning That Actually Helps",
    description:
      "Chitti replans your day around time left, energy level, urgency, and overload.",
  },
  {
    title: "Execution System, Not Just Notes",
    description:
      "Turn ideas into goals, drag them into Today, and keep moving through one command center.",
  },
  {
    title: "Visual Progress You Want To Check",
    description:
      "Calendar planning, heatmaps, streaks, and daily pushes make the system feel alive.",
  },
];

const mockCards = [
  {
    title: "Focus now",
    value: "Finish assignment",
    tone: "bg-red-50 border-red-200",
  },
  {
    title: "Streak",
    value: "3 days",
    tone: "bg-emerald-50 border-emerald-200",
  },
  {
    title: "Today",
    value: "2 quick wins, 1 deep task",
    tone: "bg-yellow-50 border-yellow-200",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fee2e2,_#f5f5f5_45%,_#ffffff_100%)] text-black">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            LifeOS
          </p>
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            Organize your life with AI and an execution system that keeps you coming back.
          </h1>
          <p className="text-lg text-gray-600">
            Capture thoughts, convert them into goals, replan your day with Chitti,
            and move work visually from planning into execution.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/signup"
              className="rounded-full bg-red-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Start free
            </a>
            <a
              href="/dashboard"
              className="rounded-full border border-black px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Open dashboard
            </a>
          </div>
        </div>

        <div className="grid flex-1 gap-4 md:grid-cols-3 lg:grid-cols-1">
          {mockCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-3xl border p-6 shadow-lg ${card.tone}`}
            >
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="rounded-3xl border border-white bg-white/90 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
