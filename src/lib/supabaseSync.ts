import { getSupabaseClient } from "./supabaseClient";
import type { StudySession, Flashcard, DrillQuestion } from "../types";

// Study Sessions
export async function syncSessionToSupabase(session: StudySession): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from("study_sessions")
        .upsert({
            id: session.id,
            user_id: user.id,
            subject_id: session.subjectId,
            started_at: session.startedAt,
            ended_at: session.endedAt,
            duration_minutes: session.durationMinutes
        });

    if (error) {
        console.error("Failed to sync session:", error);
    }
}

export async function fetchUserSessions(): Promise<StudySession[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch sessions:", error);
        return [];
    }

    return (data ?? []).map(row => ({
        id: row.id,
        subjectId: row.subject_id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationMinutes: row.duration_minutes
    }));
}

// Flashcards
export async function saveFlashcards(flashcards: Flashcard[]): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = flashcards.map(card => ({
        id: card.id,
        user_id: user.id,
        front: card.front,
        back: card.back,
        subject_id: card.subjectId,
        interval: card.interval,
        repetition: card.repetition,
        ef: card.ef,
        due_at: card.dueAt
    }));

    const { error } = await supabase
        .from("flashcards")
        .upsert(rows);

    if (error) {
        console.error("Failed to save flashcards:", error);
    }
}

export async function fetchFlashcards(): Promise<Flashcard[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("due_at", { ascending: true });

    if (error) {
        console.error("Failed to fetch flashcards:", error);
        return [];
    }

    return (data ?? []).map(row => ({
        id: row.id,
        front: row.front,
        back: row.back,
        subjectId: row.subject_id,
        interval: row.interval,
        repetition: row.repetition,
        ef: parseFloat(row.ef),
        dueAt: row.due_at
    }));
}

// Drill Questions
export async function saveDrillQuestions(questions: DrillQuestion[]): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = questions.map(q => ({
        id: q.id,
        user_id: user.id,
        question: q.question,
        options: q.options,
        correct_option_id: q.correctOptionId,
        explanation: q.explanation,
        subject_id: q.subjectId,
        difficulty: q.difficulty
    }));

    const { error } = await supabase
        .from("drill_questions")
        .upsert(rows);

    if (error) {
        console.error("Failed to save drill questions:", error);
    }
}

export async function fetchDrillQuestions(): Promise<DrillQuestion[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("drill_questions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch drill questions:", error);
        return [];
    }

    return (data ?? []).map(row => ({
        id: row.id,
        question: row.question,
        options: row.options,
        correctOptionId: row.correct_option_id,
        explanation: row.explanation,
        subjectId: row.subject_id,
        difficulty: row.difficulty
    }));
}
