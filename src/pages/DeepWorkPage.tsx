import { DeepWorkTimer } from "../components/timer/DeepWorkTimer";
import type { Subject } from "../types";

const SUBJECTS: Subject[] = [
  { id: "biology", name: "Biology" },
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "maths", name: "Maths" }
];

export function DeepWorkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Deep Work Grinder
          </div>
          <div className="text-lg text-white/90">
            Track focused blocks. Tag every minute to a subject.
          </div>
        </div>
      </div>
      <DeepWorkTimer subjects={SUBJECTS} />
    </div>
  );
}

