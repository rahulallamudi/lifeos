"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type TaskInputProps = {
  addTask: (title: string) => Promise<void>;
};

export default function TaskInput({ addTask }: TaskInputProps) {
  const [newTask, setNewTask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd() {
    if (!newTask.trim()) return;

    setIsSubmitting(true);

    try {
      await addTask(newTask.trim());
      setNewTask("");
      toast.success("Task added to your system.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t add the task right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 rounded-xl bg-white p-4 shadow-md"
    >
      <input
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        placeholder="What needs to be done?"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void handleAdd();
        }}
      />

      <button
        onClick={() => void handleAdd()}
        disabled={isSubmitting || !newTask.trim()}
        className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </motion.div>
  );
}
