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
    onSnapshot,
    type Unsubscribe
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient";
import type { StudySession, DrillQuestion, Flashcard, SubjectKey } from "../types";

// Check if Firestore is available
const isFirestoreAvailable = () => {
    return isFirebaseConfigured() && db !== null;
};

// ==================== ACTIVE SESSION (for resume functionality) ====================

export interface ActiveSession {
    subjectId: SubjectKey;
    startedAt: string;
    isActive: boolean;
}

export async function saveActiveSession(userId: string, session: ActiveSession | null): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const activeSessionRef = doc(db!, "users", userId, "state", "activeSession");
    if (session) {
        await setDoc(activeSessionRef, {
            ...session,
            updatedAt: serverTimestamp()
        });
    } else {
        await deleteDoc(activeSessionRef);
    }
}

export async function getActiveSession(userId: string): Promise<ActiveSession | null> {
    if (!isFirestoreAvailable()) return null;

    const activeSessionRef = doc(db!, "users", userId, "state", "activeSession");
    const snapshot = await getDoc(activeSessionRef);

    if (!snapshot.exists()) return null;
    return snapshot.data() as ActiveSession;
}

// ==================== STUDY SESSIONS ====================

export async function saveStudySession(userId: string, session: StudySession): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const sessionRef = doc(db!, "users", userId, "sessions", session.id);
    await setDoc(sessionRef, {
        ...session,
        createdAt: serverTimestamp()
    });
}

export async function getStudySessions(userId: string, limitCount: number = 50): Promise<StudySession[]> {
    if (!isFirestoreAvailable()) return [];

    const sessionsRef = collection(db!, "users", userId, "sessions");
    const q = query(sessionsRef, orderBy("startedAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as StudySession);
}

// ==================== FLASHCARDS ====================

export async function saveFlashcard(userId: string, flashcard: Flashcard): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const flashcardRef = doc(db!, "users", userId, "flashcards", flashcard.id);
    await setDoc(flashcardRef, {
        ...flashcard,
        updatedAt: serverTimestamp()
    });
}

export async function getFlashcards(userId: string, subjectId?: SubjectKey): Promise<Flashcard[]> {
    if (!isFirestoreAvailable()) return [];

    const flashcardsRef = collection(db!, "users", userId, "flashcards");
    let q = query(flashcardsRef, orderBy("dueAt", "asc"));

    if (subjectId) {
        q = query(flashcardsRef, where("subjectId", "==", subjectId), orderBy("dueAt", "asc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Flashcard);
}

export async function updateFlashcard(userId: string, flashcardId: string, updates: Partial<Flashcard>): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const flashcardRef = doc(db!, "users", userId, "flashcards", flashcardId);
    await updateDoc(flashcardRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
}

export async function deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const flashcardRef = doc(db!, "users", userId, "flashcards", flashcardId);
    await deleteDoc(flashcardRef);
}

export async function saveFlashcardsBatch(userId: string, flashcards: Flashcard[]): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const promises = flashcards.map(flashcard => saveFlashcard(userId, flashcard));
    await Promise.all(promises);
}

// ==================== QUIZ QUESTIONS ====================

export async function saveQuizQuestion(userId: string, question: DrillQuestion): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const questionRef = doc(db!, "users", userId, "questions", question.id);
    await setDoc(questionRef, {
        ...question,
        createdAt: serverTimestamp()
    });
}

export async function getQuizQuestions(userId: string, subjectId?: SubjectKey): Promise<DrillQuestion[]> {
    if (!isFirestoreAvailable()) return [];

    const questionsRef = collection(db!, "users", userId, "questions");
    let q = query(questionsRef, orderBy("createdAt", "desc"), limit(100));

    if (subjectId) {
        q = query(questionsRef, where("subjectId", "==", subjectId), orderBy("createdAt", "desc"), limit(100));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as DrillQuestion);
}

export async function saveQuizQuestionsBatch(userId: string, questions: DrillQuestion[]): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const promises = questions.map(question => saveQuizQuestion(userId, question));
    await Promise.all(promises);
}

// ==================== ASSESSMENTS / TASKS ====================

export interface Assessment {
    id: string;
    title: string;
    description?: string;
    subjectId: SubjectKey;
    dueDate: string;
    status: "not-started" | "in-progress" | "completed";
    progress: number;
    priority: "low" | "medium" | "high";
    createdAt?: any;
    updatedAt?: any;
}

export async function saveAssessment(userId: string, assessment: Assessment): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const assessmentRef = doc(db!, "users", userId, "assessments", assessment.id);
    await setDoc(assessmentRef, {
        ...assessment,
        updatedAt: serverTimestamp(),
        createdAt: assessment.createdAt || serverTimestamp()
    });
}

export async function getAssessments(userId: string): Promise<Assessment[]> {
    if (!isFirestoreAvailable()) return [];

    const assessmentsRef = collection(db!, "users", userId, "assessments");
    const q = query(assessmentsRef, orderBy("dueDate", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
}

export async function updateAssessment(userId: string, assessmentId: string, updates: Partial<Assessment>): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const assessmentRef = doc(db!, "users", userId, "assessments", assessmentId);
    await updateDoc(assessmentRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
}

export async function deleteAssessment(userId: string, assessmentId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const assessmentRef = doc(db!, "users", userId, "assessments", assessmentId);
    await deleteDoc(assessmentRef);
}

// ==================== ATTENDANCE ====================

export interface AttendanceRecord {
    id: string;
    date: string;
    subjectId: SubjectKey;
    status: "present" | "absent" | "late";
    notes?: string;
    createdAt?: any;
}

export async function saveAttendance(userId: string, record: AttendanceRecord): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const attendanceRef = doc(db!, "users", userId, "attendance", record.id);
    await setDoc(attendanceRef, {
        ...record,
        createdAt: serverTimestamp()
    });
}

export async function getAttendance(userId: string, days: number = 30): Promise<AttendanceRecord[]> {
    if (!isFirestoreAvailable()) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attendanceRef = collection(db!, "users", userId, "attendance");
    const q = query(attendanceRef, orderBy("date", "desc"), limit(100));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function deleteAttendance(userId: string, recordId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const attendanceRef = doc(db!, "users", userId, "attendance", recordId);
    await deleteDoc(attendanceRef);
}

// ==================== CALENDAR EVENTS ====================

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    type: "exam" | "assignment" | "event" | "reminder";
    subjectId?: SubjectKey;
    color: string;
    reminder?: boolean;
    createdAt?: any;
}

export async function saveCalendarEvent(userId: string, event: CalendarEvent): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const eventRef = doc(db!, "users", userId, "events", event.id);
    await setDoc(eventRef, {
        ...event,
        createdAt: serverTimestamp()
    });
}

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    if (!isFirestoreAvailable()) return [];

    const eventsRef = collection(db!, "users", userId, "events");
    const q = query(eventsRef, orderBy("date", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
}

export async function updateCalendarEvent(userId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const eventRef = doc(db!, "users", userId, "events", eventId);
    await updateDoc(eventRef, updates);
}

export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const eventRef = doc(db!, "users", userId, "events", eventId);
    await deleteDoc(eventRef);
}

// ==================== USER PROFILE ====================

export interface UserProfile {
    displayName: string;
    email: string;
    createdAt?: any;
    lastActive?: any;
    subjects: SubjectKey[];
    preferences: {
        notifications: boolean;
        emailNotifications: boolean;
        theme: "light" | "dark" | "system";
        reminderTime: number; // hours before due date
    };
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const profileRef = doc(db!, "users", userId);
    await setDoc(profileRef, {
        ...profile,
        lastActive: serverTimestamp()
    }, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isFirestoreAvailable()) return null;

    const profileRef = doc(db!, "users", userId);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) return null;
    return snapshot.data() as UserProfile;
}

// ==================== REAL-TIME LISTENERS ====================

export function subscribeToAssessments(userId: string, callback: (assessments: Assessment[]) => void): Unsubscribe {
    if (!isFirestoreAvailable()) return () => {};

    const assessmentsRef = collection(db!, "users", userId, "assessments");
    const q = query(assessmentsRef, orderBy("dueDate", "asc"));

    return onSnapshot(q, (snapshot) => {
        const assessments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
        callback(assessments);
    });
}

export function subscribeToCalendarEvents(userId: string, callback: (events: CalendarEvent[]) => void): Unsubscribe {
    if (!isFirestoreAvailable()) return () => {};

    const eventsRef = collection(db!, "users", userId, "events");
    const q = query(eventsRef, orderBy("date", "asc"));

    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
        callback(events);
    });
}

// ==================== COMMUNITY: ACHIEVEMENTS ====================

export interface Achievement {
    id: string;
    userId: string;
    userName: string;
    achievement: string;
    createdAt: any;
    reactions: { fire: number; heart: number; rocket: number; clap: number };
}

export interface UserReaction {
    odUserId: string;
    achievementId: string;
    reaction: string;
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const achievementRef = doc(db!, "community", "achievements", "posts", achievement.id);
    await setDoc(achievementRef, {
        ...achievement,
        createdAt: serverTimestamp()
    });
}

export async function getAchievements(limitCount: number = 20): Promise<Achievement[]> {
    if (!isFirestoreAvailable()) return [];

    const achievementsRef = collection(db!, "community", "achievements", "posts");
    const q = query(achievementsRef, orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
}

export function subscribeToAchievements(callback: (achievements: Achievement[]) => void): Unsubscribe {
    if (!isFirestoreAvailable()) return () => {};

    const achievementsRef = collection(db!, "community", "achievements", "posts");
    const q = query(achievementsRef, orderBy("createdAt", "desc"), limit(50));

    return onSnapshot(q, (snapshot) => {
        const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
        callback(achievements);
    });
}

export async function updateAchievementReaction(
    achievementId: string,
    reaction: keyof Achievement["reactions"],
    increment: number
): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const achievementRef = doc(db!, "community", "achievements", "posts", achievementId);
    const snapshot = await getDoc(achievementRef);
    if (!snapshot.exists()) return;

    const current = snapshot.data() as Achievement;
    await updateDoc(achievementRef, {
        [`reactions.${reaction}`]: (current.reactions[reaction] || 0) + increment
    });
}

export async function saveUserReaction(userId: string, achievementId: string, reaction: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const reactionRef = doc(db!, "users", userId, "reactions", `${achievementId}_${reaction}`);
    await setDoc(reactionRef, { achievementId, reaction, createdAt: serverTimestamp() });
}

export async function deleteUserReaction(userId: string, achievementId: string, reaction: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const reactionRef = doc(db!, "users", userId, "reactions", `${achievementId}_${reaction}`);
    await deleteDoc(reactionRef);
}

export async function getUserReactions(userId: string): Promise<string[]> {
    if (!isFirestoreAvailable()) return [];

    const reactionsRef = collection(db!, "users", userId, "reactions");
    const snapshot = await getDocs(reactionsRef);
    return snapshot.docs.map(doc => doc.id);
}

// ==================== COMMUNITY: OPPORTUNITIES ====================

export interface Opportunity {
    id: string;
    title: string;
    type: "Hackathon" | "Career" | "Seminar" | "Workshop";
    date: string;
    description?: string;
    link?: string;
    color: string;
    interested: number;
    createdAt?: any;
}

export async function saveOpportunity(opportunity: Opportunity): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const opportunityRef = doc(db!, "community", "opportunities", "items", opportunity.id);
    await setDoc(opportunityRef, {
        ...opportunity,
        createdAt: serverTimestamp()
    });
}

export async function getOpportunities(): Promise<Opportunity[]> {
    if (!isFirestoreAvailable()) return [];

    const opportunitiesRef = collection(db!, "community", "opportunities", "items");
    const q = query(opportunitiesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
}

export function subscribeToOpportunities(callback: (opportunities: Opportunity[]) => void): Unsubscribe {
    if (!isFirestoreAvailable()) return () => {};

    const opportunitiesRef = collection(db!, "community", "opportunities", "items");
    const q = query(opportunitiesRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const opportunities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        callback(opportunities);
    });
}

export async function updateOpportunityInterest(opportunityId: string, increment: number): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const opportunityRef = doc(db!, "community", "opportunities", "items", opportunityId);
    const snapshot = await getDoc(opportunityRef);
    if (!snapshot.exists()) return;

    const current = snapshot.data() as Opportunity;
    await updateDoc(opportunityRef, {
        interested: (current.interested || 0) + increment
    });
}

export async function saveUserInterest(userId: string, opportunityId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const interestRef = doc(db!, "users", userId, "interests", opportunityId);
    await setDoc(interestRef, { opportunityId, createdAt: serverTimestamp() });
}

export async function deleteUserInterest(userId: string, opportunityId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const interestRef = doc(db!, "users", userId, "interests", opportunityId);
    await deleteDoc(interestRef);
}

export async function getUserInterests(userId: string): Promise<string[]> {
    if (!isFirestoreAvailable()) return [];

    const interestsRef = collection(db!, "users", userId, "interests");
    const snapshot = await getDocs(interestsRef);
    return snapshot.docs.map(doc => doc.id);
}

// ==================== COMMUNITY: STUDY ROOMS ====================

export interface StudyRoom {
    id: string;
    name: string;
    hostId: string;
    hostName: string;
    users: number;
    mode: "Silent" | "Discussion" | "Video";
    createdAt?: any;
    isActive: boolean;
}

export async function saveStudyRoom(room: StudyRoom): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const roomRef = doc(db!, "community", "studyRooms", "rooms", room.id);
    await setDoc(roomRef, {
        ...room,
        createdAt: serverTimestamp()
    });
}

export async function getStudyRooms(): Promise<StudyRoom[]> {
    if (!isFirestoreAvailable()) return [];

    const roomsRef = collection(db!, "community", "studyRooms", "rooms");
    const q = query(roomsRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyRoom));
}

export function subscribeToStudyRooms(callback: (rooms: StudyRoom[]) => void): Unsubscribe {
    if (!isFirestoreAvailable()) return () => {};

    const roomsRef = collection(db!, "community", "studyRooms", "rooms");
    const q = query(roomsRef, where("isActive", "==", true), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyRoom));
        callback(rooms);
    });
}

export async function updateStudyRoomUsers(roomId: string, increment: number): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const roomRef = doc(db!, "community", "studyRooms", "rooms", roomId);
    const snapshot = await getDoc(roomRef);
    if (!snapshot.exists()) return;

    const current = snapshot.data() as StudyRoom;
    await updateDoc(roomRef, {
        users: Math.max(0, (current.users || 0) + increment)
    });
}

export async function saveUserRoomJoin(userId: string, roomId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const joinRef = doc(db!, "users", userId, "joinedRooms", roomId);
    await setDoc(joinRef, { roomId, joinedAt: serverTimestamp() });
}

export async function deleteUserRoomJoin(userId: string, roomId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const joinRef = doc(db!, "users", userId, "joinedRooms", roomId);
    await deleteDoc(joinRef);
}

export async function getUserJoinedRooms(userId: string): Promise<string[]> {
    if (!isFirestoreAvailable()) return [];

    const joinedRef = collection(db!, "users", userId, "joinedRooms");
    const snapshot = await getDocs(joinedRef);
    return snapshot.docs.map(doc => doc.id);
}

export async function closeStudyRoom(roomId: string): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const roomRef = doc(db!, "community", "studyRooms", "rooms", roomId);
    await updateDoc(roomRef, { isActive: false });
}

// ==================== COMMUNITY: STARTUP APPLICATIONS ====================

export interface StartupApplication {
    id: string;
    userId: string;
    startupId: string;
    name: string;
    email: string;
    skills: string;
    motivation: string;
    status: "pending" | "reviewed" | "accepted" | "rejected";
    createdAt?: any;
}

export async function saveStartupApplication(application: StartupApplication): Promise<void> {
    if (!isFirestoreAvailable()) return;

    const applicationRef = doc(db!, "community", "startups", "applications", application.id);
    await setDoc(applicationRef, {
        ...application,
        createdAt: serverTimestamp()
    });
}

export async function getUserStartupApplications(userId: string): Promise<StartupApplication[]> {
    if (!isFirestoreAvailable()) return [];

    const applicationsRef = collection(db!, "community", "startups", "applications");
    const q = query(applicationsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StartupApplication));
}

// ==================== STATISTICS ====================

export interface StudyStats {
    totalSessions: number;
    totalMinutes: number;
    totalFlashcards: number;
    totalQuestions: number;
    completedAssessments: number;
    pendingAssessments: number;
    attendanceRate: number;
    subjectBreakdown: Record<SubjectKey, number>;
}

export async function getStudyStats(userId: string): Promise<StudyStats> {
    if (!isFirestoreAvailable()) {
        return {
            totalSessions: 0,
            totalMinutes: 0,
            totalFlashcards: 0,
            totalQuestions: 0,
            completedAssessments: 0,
            pendingAssessments: 0,
            attendanceRate: 0,
            subjectBreakdown: {} as Record<SubjectKey, number>
        };
    }

    const [sessions, flashcards, questions, assessments, attendance] = await Promise.all([
        getStudySessions(userId),
        getFlashcards(userId),
        getQuizQuestions(userId),
        getAssessments(userId),
        getAttendance(userId, 30)
    ]);

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const subjectBreakdown: Record<SubjectKey, number> = {} as Record<SubjectKey, number>;

    sessions.forEach(session => {
        subjectBreakdown[session.subjectId] = (subjectBreakdown[session.subjectId] || 0) + session.durationMinutes;
    });

    const completedAssessments = assessments.filter(a => a.status === "completed").length;
    const pendingAssessments = assessments.filter(a => a.status !== "completed").length;

    const presentDays = attendance.filter(a => a.status === "present").length;
    const attendanceRate = attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0;

    return {
        totalSessions: sessions.length,
        totalMinutes,
        totalFlashcards: flashcards.length,
        totalQuestions: questions.length,
        completedAssessments,
        pendingAssessments,
        attendanceRate,
        subjectBreakdown
    };
}
