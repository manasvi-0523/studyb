export interface Sm2ReviewState {
  interval: number;
  repetition: number;
  ef: number;
  dueAt: string;
}

export function scheduleNextReview(
  current: Sm2ReviewState,
  quality: 0 | 1 | 2 | 3 | 4 | 5,
  now: Date
): Sm2ReviewState {
  let ef = current.ef;
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) {
    ef = 1.3;
  }

  let repetition = current.repetition;
  let interval = current.interval;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) {
      repetition = 1;
      interval = 1;
    } else if (repetition === 1) {
      repetition = 2;
      interval = 6;
    } else {
      repetition += 1;
      interval = Math.round(interval * ef);
    }
  }

  const due = new Date(now);
  due.setDate(due.getDate() + interval);

  return {
    interval,
    repetition,
    ef,
    dueAt: due.toISOString()
  };
}

