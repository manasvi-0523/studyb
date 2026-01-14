import { eachDayOfInterval, subDays, format } from "date-fns";

interface Props {
  studyMinutesByDay: Record<string, number>;
}

const buckets = [0, 15, 45, 90, 180];

function intensityForMinutes(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < buckets[1]) return 1;
  if (minutes < buckets[2]) return 2;
  if (minutes < buckets[3]) return 3;
  return 4;
}

export function StudyVelocityHeatmap({ studyMinutesByDay }: Props) {
  const end = new Date();
  const start = subDays(end, 29);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-white/80">Study Velocity</div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
          Last 30 days
        </div>
      </div>
      <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[3px]">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const minutes = studyMinutesByDay[key] ?? 0;
          const level = intensityForMinutes(minutes);
          const colors = [
            "bg-surface/40",
            "bg-accent/20",
            "bg-accent/40",
            "bg-accent/70",
            "bg-accent"
          ];
          return (
            <div
              key={key}
              className={`h-6 rounded-sm ${colors[level]} transition-colors`}
              title={`${key}: ${minutes} min`}
            />
          );
        })}
      </div>
    </div>
  );
}

