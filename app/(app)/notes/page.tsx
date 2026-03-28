"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Card from "@/components/Card";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useTasks } from "@/hooks/useTasks";

export default function NotesPage() {
  const [notes, setNotes] = useLocalStorageState("notes", "");
  const [convertingNote, setConvertingNote] = useState<string | null>(null);
  const { addTask } = useTasks();
  const noteItems = useMemo(() => {
    return notes
      .split("\n")
      .map((note) => note.trim())
      .filter(Boolean);
  }, [notes]);

  const convertToGoal = async (note: string) => {
    setConvertingNote(note);

    try {
      await addTask(note);
      toast.success("Note converted into a goal.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn’t convert that note right now.");
    } finally {
      setConvertingNote(null);
    }
  };

  return (
    <Container>
      <div className="space-y-8">
        <PageHeader
          title="Notes"
          subtitle="Capture ideas fast, then turn the strongest ones into goals without switching systems"
        />

        <Card>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Write one note per line..."
            className="min-h-[360px] w-full rounded-xl border border-gray-200 p-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="mt-3 text-sm text-gray-500">
            Notes are stored locally in your browser for quick capture.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Convert Notes Into Goals</h2>
          <div className="mt-4 space-y-3">
            {noteItems.length === 0 ? (
              <EmptyState
                title="No notes yet — start writing"
                description="Add one note per line, then turn the best idea into a structured goal in one tap."
                icon="📝"
              />
            ) : (
              noteItems.map((note, index) => (
                <motion.div
                  key={`${note}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <p className="text-sm text-black">{note}</p>
                  <button
                    onClick={() => void convertToGoal(note)}
                    disabled={convertingNote === note}
                    className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {convertingNote === note ? "Converting..." : "Convert -> Goal"}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
}
