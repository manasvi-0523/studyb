import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubjectKey, StudySession, PowerLevelSummary } from "../types";
import { saveStudySession } from "../lib/dataService";
import { getCurrentUser } from "../lib/firebaseClient";

interface SessionState {
  activeSubject: SubjectKey | null;
  isGrinding: boolean;
  currentSessionStart: string | null;
  sessions: StudySession[];
  powerLevel: PowerLevelSummary;
  setActiveSubject: (subject: SubjectKey | null) => void;
  startGrind: (subject: SubjectKey) => void;
  stopGrind: () => void;
  loadSessions: (sessions: StudySession[]) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
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
      async stopGrind() {
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

        // Save to Firebase if user is authenticated
        const user = getCurrentUser();
        if (user) {
          try {
            await saveStudySession(user.uid, session);
          } catch (error) {
            console.error("Failed to save session to Firebase:", error);
          }
        }

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
      },
      loadSessions(sessions) {
        const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
        const SCORE_MULTIPLIER = 10;
        const MAX_SCORE = 100;

        set({
          sessions,
          powerLevel: {
            score: Math.min(MAX_SCORE, Math.round(totalMinutes / SCORE_MULTIPLIER)),
            totalStudyMinutesLast30Days: totalMinutes,
            averageDrillAccuracy: 0
          }
        });
      },
      clearSessions() {
        set({
          sessions: [],
          powerLevel: {
            score: 0,
            totalStudyMinutesLast30Days: 0,
            averageDrillAccuracy: 0
          }
        });
      }
    }),
    {
      name: "elite-session-store",
      partialize: (state) => ({
        sessions: state.sessions,
        powerLevel: state.powerLevel
      })
    }
  )
);
