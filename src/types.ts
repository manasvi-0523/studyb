export type SubjectKey = "biology" | "physics" | "chemistry" | "maths" | "other";

export interface Subject {
  id: SubjectKey;
  name: string;
}

export interface StudySession {
  id: string;
  subjectId: SubjectKey;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
}

export interface DrillOption {
  id: string;
  text: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface DrillQuestion {
  id: string;
  question: string;
  options: DrillOption[];
  correctOptionId: string;
  explanation: string;
  subjectId: SubjectKey;
  difficulty: Difficulty;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subjectId: SubjectKey;
  interval: number;
  repetition: number;
  ef: number;
  dueAt: string;
}

export interface PowerLevelSummary {
  score: number;
  totalStudyMinutesLast30Days: number;
  averageDrillAccuracy: number;
}

export interface StudyTask {
  id: string;
  label: string;
  subjectId: SubjectKey;
  examDate: string;
  urgencyScore: number;
  isUrgent: boolean;
}

export type MatrixQuadrant = "do" | "schedule" | "optimize" | "eliminate";

export interface MatrixTask {
  id: string;
  title: string;
  quadrant: MatrixQuadrant;
  completed: boolean;
  createdAt: number;
}

