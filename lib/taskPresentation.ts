import type { Task } from "@/hooks/useTasks";

type PriorityKey = NonNullable<Task["priority"]> | "none";

type PriorityMeta = {
  shortLabel: string;
  title: string;
  badgeClassName: string;
  sectionClassName: string;
};

const priorityOrder: PriorityKey[] = ["high", "medium", "low", "none"];

const priorityMetaMap: Record<PriorityKey, PriorityMeta> = {
  high: {
    shortLabel: "High",
    title: "High Priority",
    badgeClassName: "border-red-200 bg-red-100 text-red-700",
    sectionClassName: "text-red-700",
  },
  medium: {
    shortLabel: "Medium",
    title: "Medium Priority",
    badgeClassName: "border-yellow-200 bg-yellow-100 text-yellow-700",
    sectionClassName: "text-yellow-700",
  },
  low: {
    shortLabel: "Low",
    title: "Low Priority",
    badgeClassName: "border-emerald-200 bg-emerald-100 text-emerald-700",
    sectionClassName: "text-emerald-700",
  },
  none: {
    shortLabel: "General",
    title: "General",
    badgeClassName: "border-gray-200 bg-gray-100 text-gray-600",
    sectionClassName: "text-gray-600",
  },
};

function getPriorityKey(priority?: Task["priority"]): PriorityKey {
  return priority ?? "none";
}

export function getPriorityMeta(priority?: Task["priority"]) {
  return priorityMetaMap[getPriorityKey(priority)];
}

export function sortTasksByPriority(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const leftPriority = priorityOrder.indexOf(getPriorityKey(left.priority));
    const rightPriority = priorityOrder.indexOf(getPriorityKey(right.priority));

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.title.localeCompare(right.title);
  });
}

export function groupTasksByPriority(tasks: Task[]) {
  const grouped = priorityOrder
    .map((priority) => {
      return {
        key: priority,
        meta: priorityMetaMap[priority],
        tasks: sortTasksByPriority(
          tasks.filter((task) => getPriorityKey(task.priority) === priority)
        ),
      };
    })
    .filter((group) => group.tasks.length > 0);

  return grouped;
}
