import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getStudySessions, getFlashcards, getQuizQuestions } from "../lib/dataService";
import { useSessionStore } from "../state/sessionStore";
import type { Flashcard, DrillQuestion } from "../types";

export function useUserData() {
    const { user, isAuthenticated, isFirebaseEnabled } = useAuth();
    const loadSessions = useSessionStore((state) => state.loadSessions);

    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [questions, setQuestions] = useState<DrillQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !isFirebaseEnabled || !user) {
            return;
        }

        const loadUserData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [sessions, cards, quizQuestions] = await Promise.all([
                    getStudySessions(user.uid),
                    getFlashcards(user.uid),
                    getQuizQuestions(user.uid)
                ]);

                // Load sessions into Zustand store
                loadSessions(sessions);

                // Set local state for flashcards and questions
                setFlashcards(cards);
                setQuestions(quizQuestions);
            } catch (err) {
                console.error("Failed to load user data:", err);
                setError("Failed to load your data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user, isAuthenticated, isFirebaseEnabled, loadSessions]);

    return {
        flashcards,
        questions,
        isLoading,
        error,
        refetch: async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const [sessions, cards, quizQuestions] = await Promise.all([
                    getStudySessions(user.uid),
                    getFlashcards(user.uid),
                    getQuizQuestions(user.uid)
                ]);
                loadSessions(sessions);
                setFlashcards(cards);
                setQuestions(quizQuestions);
            } catch (err) {
                console.error("Failed to refetch user data:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };
}
