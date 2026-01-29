import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    type Timestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient";
import type { StudySession, DrillQuestion, Flashcard, SubjectKey } from "../types";

// Check if Firestore is available
const isFirestoreAvailable = () => {
    return isFirebaseConfigured() && db !== null;
};

// Study Sessions
export async function saveStudySession(userId: string, session: StudySession): Promise<void> {
    if (!isFirestoreAvailable()) {
        console.warn("Firestore not available. Session not saved.");
        return;
    }

    const sessionRef = doc(db!, "users", userId, "sessions", session.id);
    await setDoc(sessionRef, {
        ...session,
        createdAt: serverTimestamp()
    });
}

export async function getStudySessions(userId: string, limitCount: number = 50): Promise<StudySession[]> {
    if (!isFirestoreAvailable()) {
        return [];
    }

    const sessionsRef = collection(db!, "users", userId, "sessions");
    const q = query(sessionsRef, orderBy("startedAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as StudySession);
}

// Flashcards
export async function saveFlashcard(userId: string, flashcard: Flashcard): Promise<void> {
    if (!isFirestoreAvailable()) {
        console.warn("Firestore not available. Flashcard not saved.");
        return;
    }

    const flashcardRef = doc(db!, "users", userId, "flashcards", flashcard.id);
    await setDoc(flashcardRef, {
        ...flashcard,
        updatedAt: serverTimestamp()
    });
}

export async function getFlashcards(userId: string, subjectId?: SubjectKey): Promise<Flashcard[]> {
    if (!isFirestoreAvailable()) {
        return [];
    }

    const flashcardsRef = collection(db!, "users", userId, "flashcards");
    let q = query(flashcardsRef, orderBy("dueAt", "asc"));

    if (subjectId) {
        q = query(flashcardsRef, where("subjectId", "==", subjectId), orderBy("dueAt", "asc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Flashcard);
}

export async function updateFlashcard(userId: string, flashcardId: string, updates: Partial<Flashcard>): Promise<void> {
    if (!isFirestoreAvailable()) {
        return;
    }

    const flashcardRef = doc(db!, "users", userId, "flashcards", flashcardId);
    await updateDoc(flashcardRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
}

export async function deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    if (!isFirestoreAvailable()) {
        return;
    }

    const flashcardRef = doc(db!, "users", userId, "flashcards", flashcardId);
    await deleteDoc(flashcardRef);
}

// Quiz Questions
export async function saveQuizQuestion(userId: string, question: DrillQuestion): Promise<void> {
    if (!isFirestoreAvailable()) {
        console.warn("Firestore not available. Question not saved.");
        return;
    }

    const questionRef = doc(db!, "users", userId, "questions", question.id);
    await setDoc(questionRef, {
        ...question,
        createdAt: serverTimestamp()
    });
}

export async function getQuizQuestions(userId: string, subjectId?: SubjectKey): Promise<DrillQuestion[]> {
    if (!isFirestoreAvailable()) {
        return [];
    }

    const questionsRef = collection(db!, "users", userId, "questions");
    let q = query(questionsRef, orderBy("createdAt", "desc"), limit(100));

    if (subjectId) {
        q = query(questionsRef, where("subjectId", "==", subjectId), orderBy("createdAt", "desc"), limit(100));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as DrillQuestion);
}

// User Profile
export interface UserProfile {
    displayName: string;
    email: string;
    createdAt: string;
    lastActive: string;
    preferences: {
        notifications: boolean;
        emailNotifications: boolean;
        theme: "light" | "dark" | "system";
    };
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    if (!isFirestoreAvailable()) {
        return;
    }

    const profileRef = doc(db!, "users", userId);
    await setDoc(profileRef, {
        ...profile,
        lastActive: serverTimestamp()
    }, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isFirestoreAvailable()) {
        return null;
    }

    const profileRef = doc(db!, "users", userId);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.data() as UserProfile;
}

// Batch save flashcards
export async function saveFlashcardsBatch(userId: string, flashcards: Flashcard[]): Promise<void> {
    if (!isFirestoreAvailable()) {
        console.warn("Firestore not available. Flashcards not saved.");
        return;
    }

    const promises = flashcards.map(flashcard => saveFlashcard(userId, flashcard));
    await Promise.all(promises);
}

// Batch save quiz questions
export async function saveQuizQuestionsBatch(userId: string, questions: DrillQuestion[]): Promise<void> {
    if (!isFirestoreAvailable()) {
        console.warn("Firestore not available. Questions not saved.");
        return;
    }

    const promises = questions.map(question => saveQuizQuestion(userId, question));
    await Promise.all(promises);
}

// Get statistics
export interface StudyStats {
    totalSessions: number;
    totalMinutes: number;
    totalFlashcards: number;
    totalQuestions: number;
    subjectBreakdown: Record<SubjectKey, number>;
}

export async function getStudyStats(userId: string): Promise<StudyStats> {
    if (!isFirestoreAvailable()) {
        return {
            totalSessions: 0,
            totalMinutes: 0,
            totalFlashcards: 0,
            totalQuestions: 0,
            subjectBreakdown: {} as Record<SubjectKey, number>
        };
    }

    const [sessions, flashcards, questions] = await Promise.all([
        getStudySessions(userId),
        getFlashcards(userId),
        getQuizQuestions(userId)
    ]);

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const subjectBreakdown: Record<SubjectKey, number> = {} as Record<SubjectKey, number>;

    sessions.forEach(session => {
        subjectBreakdown[session.subjectId] = (subjectBreakdown[session.subjectId] || 0) + session.durationMinutes;
    });

    return {
        totalSessions: sessions.length,
        totalMinutes,
        totalFlashcards: flashcards.length,
        totalQuestions: questions.length,
        subjectBreakdown
    };
}
