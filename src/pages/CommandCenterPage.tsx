import { StudyVelocityHeatmap } from "../components/dashboard/StudyVelocityHeatmap";
import { SubjectMasteryBars } from "../components/dashboard/SubjectMasteryBars";
import { GlobalPowerLevel } from "../components/dashboard/GlobalPowerLevel";
import { DeepWorkTimer } from "../components/timer/DeepWorkTimer";
import { StrategistPanel } from "../components/ai/StrategistPanel";
import { useSessionStore } from "../state/sessionStore";
import type { Subject } from "../types";
import { useMemo, useState } from "react";

const SUBJECTS: Subject[] = [
  { id: "biology", name: "Biology" },
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "maths", name: "Maths" }
];

export function CommandCenterPage() {
  const { sessions, powerLevel } = useSessionStore();
  const [mastery, setMastery] = useState<Record<string, number>>(
    SUBJECTS.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {})
  );

  const studyMinutesByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const session of sessions) {
      const dayKey = session.startedAt.slice(0, 10);
      map[dayKey] = (map[dayKey] ?? 0) + session.durationMinutes;
    }
    return map;
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Command Center
          </div>
          <div className="text-lg text-white/90">
            Calibrate your grind. Track your power level.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr,1.5fr] gap-4">
        <StudyVelocityHeatmap studyMinutesByDay={studyMinutesByDay} />
        <GlobalPowerLevel summary={powerLevel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SubjectMasteryBars subjects={SUBJECTS} mastery={mastery} />
          <DeepWorkTimer subjects={SUBJECTS} />
        </div>
        <div className="space-y-4">
          <StrategistPanel
            onGenerated={() => {
              setMastery((prev) => ({
                ...prev,
                biology: Math.min(100, (prev.biology ?? 0) + 3)
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
}

