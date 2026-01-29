import { initializeApp, type FirebaseApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    onAuthStateChanged,
    type User,
    type Auth
} from "firebase/auth";
import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    orderBy,
    limit,
    type Firestore
} from "firebase/firestore";

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        !firebaseConfig.apiKey.includes("your_")
    );
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
} else {
    console.warn("Firebase is not configured. Add your config to .env file.");
}

// Export Firebase instances
export { app, auth, db };
export { isFirebaseConfigured };

// Auth Functions
export async function signUpWithEmail(email: string, password: string): Promise<User> {
    if (!auth) throw new Error("Firebase Auth is not initialized");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
    if (!auth) throw new Error("Firebase Auth is not initialized");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function logOut(): Promise<void> {
    if (!auth) throw new Error("Firebase Auth is not initialized");

    await signOut(auth);
}

export async function sendVerificationEmail(user: User): Promise<void> {
    await sendEmailVerification(user);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
    if (!auth) {
        console.warn("Firebase Auth not initialized");
        return () => { };
    }

    return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
    return auth?.currentUser || null;
}

// Check if user's email is verified
export function isEmailVerified(): boolean {
    return auth?.currentUser?.emailVerified || false;
}

// Firestore Notification Listener
export interface NotificationData {
    id: string;
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
}

export function subscribeToNotifications(
    userId: string,
    onNotification: (notification: NotificationData) => void
): () => void {
    if (!db) {
        console.warn("Firestore not initialized");
        return () => { };
    }

    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(10));

    let isFirstLoad = true;

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && !isFirstLoad) {
                const data = change.doc.data();
                const notification: NotificationData = {
                    id: change.doc.id,
                    title: data.title || "New Notification",
                    message: data.message || "",
                    createdAt: data.createdAt?.toDate() || new Date(),
                    read: data.read || false
                };

                onNotification(notification);

                // Trigger browser notification
                triggerBrowserNotification(notification.title, notification.message);
            }
        });

        isFirstLoad = false;
    });
}

// Browser Notification Helper
export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function triggerBrowserNotification(title: string, body: string): void {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: "/favicon.ico",
            badge: "/favicon.ico"
        });
    }
}
