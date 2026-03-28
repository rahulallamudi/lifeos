"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hideSidebar = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      {!hideSidebar && (
        <>
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-red-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
            <div>
              <p className="text-lg font-semibold text-black">LifeOS</p>
              <p className="text-xs text-gray-500">Command center for your day</p>
            </div>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white"
            >
              Menu
            </button>
          </div>

          <aside className="hidden w-64 shrink-0 border-r-4 border-white bg-red-500 md:block">
            <Sidebar />
          </aside>

          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", stiffness: 240, damping: 26 }}
                  className="h-full w-72 border-r-4 border-white bg-red-500 shadow-xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 pt-5">
                    <p className="text-lg font-semibold text-white">LifeOS</p>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white"
                    >
                      Close
                    </button>
                  </div>

                  <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
