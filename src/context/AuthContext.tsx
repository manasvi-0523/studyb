import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User } from "firebase/auth";
import {
    subscribeToAuthChanges,
    signUpWithEmail,
    signInWithEmail,
    logOut,
    sendVerificationEmail,
    isFirebaseConfigured,
    subscribeToNotifications,
    requestNotificationPermission,
    type NotificationData
} from "../lib/firebaseClient";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    isFirebaseEnabled: boolean;
    notifications: NotificationData[];
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendVerification: () => Promise<void>;
    clearNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const isFirebaseEnabled = isFirebaseConfigured();

    useEffect(() => {
        if (!isFirebaseEnabled) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = subscribeToAuthChanges((authUser) => {
            setUser(authUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isFirebaseEnabled]);

    // Subscribe to Firestore notifications when user is authenticated
    useEffect(() => {
        if (!user || !isFirebaseEnabled) return;

        // Request notification permission
        requestNotificationPermission();

        // Subscribe to notifications
        const unsubscribe = subscribeToNotifications(user.uid, (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 20));
        });

        return () => unsubscribe();
    }, [user, isFirebaseEnabled]);

    const signUp = async (email: string, password: string) => {
        const newUser = await signUpWithEmail(email, password);
        await sendVerificationEmail(newUser);
    };

    const signIn = async (email: string, password: string) => {
        await signInWithEmail(email, password);
    };

    const signOut = async () => {
        await logOut();
        setNotifications([]);
        // Clear localStorage on logout
        localStorage.removeItem("elite-session-store");
    };

    const sendVerification = async () => {
        if (user) {
            await sendVerificationEmail(user);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isEmailVerified: user?.emailVerified || false,
        isFirebaseEnabled,
        notifications,
        signUp,
        signIn,
        signOut,
        sendVerification,
        clearNotifications
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
