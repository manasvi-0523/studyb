import { create } from "zustand";
import type { SubjectKey, StudySession, PowerLevelSummary } from "../types";

interface SessionState {
  activeSubject: SubjectKey | null;
  isGrinding: boolean;
  currentSessionStart: string | null;
  sessions: StudySession[];
  powerLevel: PowerLevelSummary;
  setActiveSubject: (subject: SubjectKey | null) => void;
  startGrind: (subject: SubjectKey) => void;
  stopGrind: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSubject: null,
  isGrinding: false,
  currentSessionStart: null,
  sessions: [],
  powerLevel: {
    score: 0,
    totalStudyMinutesLast30Days: 0,
    averageDrillAccuracy: 0
  },
  setActiveSubject(subject) {
    set({ activeSubject: subject });
  },
  startGrind(subject) {
    const now = new Date().toISOString();
    set({
      activeSubject: subject,
      isGrinding: true,
      currentSessionStart: now
    });
  },
  stopGrind() {
    const state = get();
    if (!state.isGrinding || !state.currentSessionStart || !state.activeSubject) {
      return;
    }
    const start = new Date(state.currentSessionStart);
    const end = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 60000)
    );
    const session: StudySession = {
      id: crypto.randomUUID(),
      subjectId: state.activeSubject,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      durationMinutes
    };
    const sessions = [...state.sessions, session];
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    set({
      isGrinding: false,
      currentSessionStart: null,
      sessions,
      powerLevel: {
        ...state.powerLevel,
        totalStudyMinutesLast30Days: totalMinutes,
        score: Math.min(100, Math.round(totalMinutes / 10))
      }
    });
  }
}));

