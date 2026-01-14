import { motion } from "framer-motion";
import type { PowerLevelSummary } from "../../types";

interface Props {
  summary: PowerLevelSummary;
}

export function GlobalPowerLevel({ summary }: Props) {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">
            Global Power Level
          </div>
          <div className="text-[11px] text-white/40">
            Hours vs accuracy across all drills
          </div>
        </div>
        <div className="relative">
          <motion.div
            className="h-16 w-16 rounded-full border border-accent/40 flex items-center justify-center shadow-neon"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.span
              className="text-2xl font-semibold text-accent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {summary.score}
            </motion.span>
          </motion.div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px] text-white/60">
        <div>
          <div className="text-white/40 mb-0.5">Study last 30 days</div>
          <div className="text-sm text-white">
            {(summary.totalStudyMinutesLast30Days / 60).toFixed(1)} h
          </div>
        </div>
        <div>
          <div className="text-white/40 mb-0.5">Drill accuracy</div>
          <div className="text-sm text-white">
            {Math.round(summary.averageDrillAccuracy * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}

