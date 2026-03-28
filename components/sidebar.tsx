"use client";

import { memo } from "react";
import { usePathname } from "next/navigation";
import { appLinks } from "@/lib/navigation";

function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const links = appLinks;

  return (
    <div className="min-h-full p-5 flex flex-col gap-4">
      <h1 className="text-white text-xl font-bold mb-4">LifeOS</h1>

      {links.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={
            pathname === item.href
              ? "bg-white text-black px-4 py-2 rounded-md font-medium border-l-4 border-black"
              : "bg-white/80 text-black px-4 py-2 rounded-md font-medium hover:bg-white transition"
          }
        >
          {item.name}
        </a>
      ))}

      <a
        href="/landing"
        onClick={onNavigate}
        className="mt-auto rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
      >
        View Landing Page
      </a>
    </div>
  );
}

export default memo(Sidebar);
