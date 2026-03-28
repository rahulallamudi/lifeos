import { memo } from "react";
import { getPriorityMeta } from "@/lib/taskPresentation";
import type { Task } from "@/hooks/useTasks";

type PriorityBadgeProps = {
  priority?: Task["priority"];
};

function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return null;
  }

  const meta = getPriorityMeta(priority);

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-semibold ${meta.badgeClassName}`}
    >
      {meta.shortLabel}
    </span>
  );
}

export default memo(PriorityBadge);
