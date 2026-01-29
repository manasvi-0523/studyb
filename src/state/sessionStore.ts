import { create } from "zustand";
import type { SubjectKey, StudySession, PowerLevelSummary } from "../types";
import { syncSessionToSupabase, fetchUserSessions } from "../lib/supabaseSync";

interface SessionState {
  activeSubject: SubjectKey | null;
  isGrinding: boolean;
  currentSessionStart: string | null;
  sessions: StudySession[];
  powerLevel: PowerLevelSummary;
  setActiveSubject: (subject: SubjectKey | null) => void;
  startGrind: (subject: SubjectKey) => void;
  stopGrind: () => void;
  loadFromSupabase: () => Promise<void>;
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
    const MS_PER_MINUTE = 60000;
    const SCORE_MULTIPLIER = 10;
    const MAX_SCORE = 100;

    const durationMinutes = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / MS_PER_MINUTE)
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
        score: Math.min(MAX_SCORE, Math.round(totalMinutes / SCORE_MULTIPLIER))
      }
    });

    // Sync to Supabase in background
    syncSessionToSupabase(session).catch(err => {
      console.error("Failed to sync session to Supabase:", err);
    });
  },
  async loadFromSupabase() {
    const sessions = await fetchUserSessions();
    if (sessions.length === 0) return;

    const SCORE_MULTIPLIER = 10;
    const MAX_SCORE = 100;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = sessions.filter(
      s => new Date(s.startedAt) >= thirtyDaysAgo
    );
    const totalMinutes = recentSessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );

    set({
      sessions,
      powerLevel: {
        score: Math.min(MAX_SCORE, Math.round(totalMinutes / SCORE_MULTIPLIER)),
        totalStudyMinutesLast30Days: totalMinutes,
        averageDrillAccuracy: 0
      }
    });
  }
}));
