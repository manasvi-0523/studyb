import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SubjectKey } from "../../types";
import { useSessionStore } from "../../state/sessionStore";

interface Props {
  subjects: { id: SubjectKey; name: string }[];
}

export function DeepWorkTimer({ subjects }: Props) {
  const { activeSubject, isGrinding, startGrind, stopGrind, setActiveSubject } =
    useSessionStore();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    if (isGrinding) {
      timer = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isGrinding]);

  useEffect(() => {
    if (!isGrinding) {
      setSeconds(0);
    }
  }, [isGrinding]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="glass-panel rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white/80">Deep Work Grinder</div>
          <div className="text-[11px] text-white/40">
            Tag each grind to a subject
          </div>
        </div>
        <div className="text-xs text-white/50">
          {isGrinding ? "Grinding..." : "Idle"}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className="h-20 w-20 rounded-2xl bg-black/60 flex items-center justify-center border border-accent/40 shadow-neon"
          animate={{
            boxShadow: isGrinding
              ? "0 0 24px rgba(46, 91, 255, 0.9)"
              : "0 0 8px rgba(46, 91, 255, 0.4)",
            scale: isGrinding ? 1.03 : 1
          }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-xl font-mono">
            {String(minutes).padStart(2, "0")}:
            {String(remainingSeconds).padStart(2, "0")}
          </div>
        </motion.div>

        <div className="flex-1 space-y-2">
          <select
            value={activeSubject ?? ""}
            onChange={(e) => setActiveSubject(e.target.value as SubjectKey)}
            className="w-full bg-surface/80 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent/70"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!activeSubject || isGrinding}
              onClick={() => {
                if (activeSubject) startGrind(activeSubject);
              }}
              className="neon-button px-3 py-2 rounded-lg bg-accent text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Start Grind
            </button>
            <button
              type="button"
              disabled={!isGrinding}
              onClick={() => stopGrind()}
              className="neon-button-urgent px-3 py-2 rounded-lg bg-urgent text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-white/40">
        Berserk Mode and distraction blocking can be wired to extensions or
        integrations.
      </div>
    </div>
  );
}

