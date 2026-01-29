import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubjectKey, StudySession, PowerLevelSummary } from "../types";
import { saveStudySession, saveActiveSession, getActiveSession } from "../lib/dataService";
import { getCurrentUser } from "../lib/firebaseClient";

const MAX_SESSION_HOURS = 24; // Auto-stop sessions older than this

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
  syncActiveSession: () => Promise<void>;
  getElapsedMinutes: () => number;
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

        // Sync to Firebase for cross-device support
        const user = getCurrentUser();
        if (user) {
          saveActiveSession(user.uid, {
            subjectId: subject,
            startedAt: now,
            isActive: true
          }).catch(console.error);
        }
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
            // Clear active session in Firebase
            await saveActiveSession(user.uid, null);
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
      },
      async syncActiveSession() {
        const user = getCurrentUser();
        if (!user) return;

        try {
          const activeSession = await getActiveSession(user.uid);
          if (activeSession && activeSession.isActive) {
            const startTime = new Date(activeSession.startedAt);
            const now = new Date();
            const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            // Check if session is stale (older than MAX_SESSION_HOURS)
            if (hoursElapsed > MAX_SESSION_HOURS) {
              // Auto-stop stale session
              const state = get();
              const durationMinutes = Math.round(MAX_SESSION_HOURS * 60);
              const session: StudySession = {
                id: crypto.randomUUID(),
                subjectId: activeSession.subjectId,
                startedAt: activeSession.startedAt,
                endedAt: new Date(startTime.getTime() + MAX_SESSION_HOURS * 60 * 60 * 1000).toISOString(),
                durationMinutes
              };

              await saveStudySession(user.uid, session);
              await saveActiveSession(user.uid, null);

              set({
                isGrinding: false,
                activeSubject: null,
                currentSessionStart: null,
                sessions: [...state.sessions, session]
              });
            } else {
              // Resume session
              set({
                isGrinding: true,
                activeSubject: activeSession.subjectId,
                currentSessionStart: activeSession.startedAt
              });
            }
          }
        } catch (error) {
          console.error("Failed to sync active session:", error);
        }
      },
      getElapsedMinutes() {
        const state = get();
        if (!state.isGrinding || !state.currentSessionStart) return 0;

        const start = new Date(state.currentSessionStart);
        const now = new Date();
        return Math.floor((now.getTime() - start.getTime()) / 60000);
      }
    }),
    {
      name: "elite-session-store",
      partialize: (state) => ({
        sessions: state.sessions,
        powerLevel: state.powerLevel,
        isGrinding: state.isGrinding,
        activeSubject: state.activeSubject,
        currentSessionStart: state.currentSessionStart
      })
    }
  )
);
