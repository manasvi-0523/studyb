import { motion } from "framer-motion";
import type { Subject } from "../../types";

interface Props {
  subjects: Subject[];
  mastery: Record<string, number>;
}

export function SubjectMasteryBars({ subjects, mastery }: Props) {
  return (
    <div className="glass-panel rounded-xl p-4 space-y-3">
      <div className="text-sm font-medium text-white/80">Subject Mastery</div>
      <div className="space-y-3">
        {subjects.map((subject) => {
          const value = mastery[subject.id] ?? 0;
          return (
            <div key={subject.id} className="space-y-1">
              <div className="flex justify-between text-xs text-white/50">
                <span>{subject.name}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-accent to-urgent"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

