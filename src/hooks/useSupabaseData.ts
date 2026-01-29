import { useState, useEffect, useCallback } from "react";
import {
    fetchUserSessions,
    fetchFlashcards,
    fetchDrillQuestions
} from "../lib/supabaseSync";
import type { StudySession, Flashcard, DrillQuestion } from "../types";

interface SupabaseData {
    sessions: StudySession[];
    flashcards: Flashcard[];
    questions: DrillQuestion[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useSupabaseData(): SupabaseData {
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [questions, setQuestions] = useState<DrillQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [sessionsData, flashcardsData, questionsData] = await Promise.all([
                fetchUserSessions(),
                fetchFlashcards(),
                fetchDrillQuestions()
            ]);

            setSessions(sessionsData);
            setFlashcards(flashcardsData);
            setQuestions(questionsData);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load data";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        sessions,
        flashcards,
        questions,
        loading,
        error,
        refresh: loadData
    };
}
