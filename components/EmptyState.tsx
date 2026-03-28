"use client";

import { motion } from "framer-motion";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
};

export default function EmptyState({
  title,
  description,
  icon = "✍️",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-6 py-10 text-center shadow-sm"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
        {description}
      </p>
    </motion.div>
  );
}
