import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getStudySessions,
    getFlashcards,
    getQuizQuestions,
    getAssessments,
    getAttendance,
    getCalendarEvents,
    getStudyStats,
    saveAssessment,
    updateAssessment,
    deleteAssessment,
    saveAttendance,
    deleteAttendance,
    saveCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    subscribeToAssessments,
    subscribeToCalendarEvents,
    type Assessment,
    type AttendanceRecord,
    type CalendarEvent,
    type StudyStats
} from "../lib/dataService";
import { useSessionStore } from "../state/sessionStore";
import type { Flashcard, DrillQuestion } from "../types";

export function useUserData() {
    const { user, isAuthenticated, isFirebaseEnabled } = useAuth();
    const loadSessions = useSessionStore((state) => state.loadSessions);

    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [questions, setQuestions] = useState<DrillQuestion[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [stats, setStats] = useState<StudyStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load all user data
    const loadUserData = useCallback(async () => {
        if (!isAuthenticated || !isFirebaseEnabled || !user) return;

        setIsLoading(true);
        setError(null);

        try {
            const [
                sessions,
                cards,
                quizQuestions,
                userAssessments,
                userAttendance,
                userEvents,
                userStats
            ] = await Promise.all([
                getStudySessions(user.uid),
                getFlashcards(user.uid),
                getQuizQuestions(user.uid),
                getAssessments(user.uid),
                getAttendance(user.uid),
                getCalendarEvents(user.uid),
                getStudyStats(user.uid)
            ]);

            loadSessions(sessions);
            setFlashcards(cards);
            setQuestions(quizQuestions);
            setAssessments(userAssessments);
            setAttendance(userAttendance);
            setEvents(userEvents);
            setStats(userStats);
        } catch (err) {
            console.error("Failed to load user data:", err);
            setError("Failed to load your data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthenticated, isFirebaseEnabled, loadSessions]);

    // Initial load
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Real-time subscriptions
    useEffect(() => {
        if (!isAuthenticated || !isFirebaseEnabled || !user) return;

        const unsubAssessments = subscribeToAssessments(user.uid, setAssessments);
        const unsubEvents = subscribeToCalendarEvents(user.uid, setEvents);

        return () => {
            unsubAssessments();
            unsubEvents();
        };
    }, [user, isAuthenticated, isFirebaseEnabled]);

    // Assessment actions
    const addAssessment = async (data: Omit<Assessment, "id" | "createdAt" | "updatedAt">) => {
        if (!user) return;
        const assessment: Assessment = {
            ...data,
            id: crypto.randomUUID()
        };
        await saveAssessment(user.uid, assessment);
    };

    const editAssessment = async (id: string, data: Partial<Assessment>) => {
        if (!user) return;
        await updateAssessment(user.uid, id, data);
    };

    const removeAssessment = async (id: string) => {
        if (!user) return;
        await deleteAssessment(user.uid, id);
    };

    // Attendance actions
    const addAttendance = async (data: Omit<AttendanceRecord, "id" | "createdAt">) => {
        if (!user) return;
        const record: AttendanceRecord = {
            ...data,
            id: crypto.randomUUID()
        };
        await saveAttendance(user.uid, record);
        // Refresh attendance
        const updated = await getAttendance(user.uid);
        setAttendance(updated);
    };

    const removeAttendance = async (id: string) => {
        if (!user) return;
        await deleteAttendance(user.uid, id);
        const updated = await getAttendance(user.uid);
        setAttendance(updated);
    };

    // Calendar event actions
    const addEvent = async (data: Omit<CalendarEvent, "id" | "createdAt">) => {
        if (!user) return;
        const event: CalendarEvent = {
            ...data,
            id: crypto.randomUUID()
        };
        await saveCalendarEvent(user.uid, event);
    };

    const editEvent = async (id: string, data: Partial<CalendarEvent>) => {
        if (!user) return;
        await updateCalendarEvent(user.uid, id, data);
    };

    const removeEvent = async (id: string) => {
        if (!user) return;
        await deleteCalendarEvent(user.uid, id);
    };

    // Refresh stats
    const refreshStats = async () => {
        if (!user) return;
        const newStats = await getStudyStats(user.uid);
        setStats(newStats);
    };

    return {
        // Data
        flashcards,
        questions,
        assessments,
        attendance,
        events,
        stats,

        // State
        isLoading,
        error,

        // Actions
        refetch: loadUserData,
        refreshStats,

        // Assessment
        addAssessment,
        editAssessment,
        removeAssessment,

        // Attendance
        addAttendance,
        removeAttendance,

        // Events
        addEvent,
        editEvent,
        removeEvent
    };
}
