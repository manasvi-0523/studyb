import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
    requestNotificationPermission,
    getNotificationPermission,
    getNotificationPreference,
    checkDueDateReminders,
    checkEventReminders
} from "../lib/notificationService";
import { getAssessments, getCalendarEvents, getUserProfile } from "../lib/dataService";

const REMINDER_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useNotifications() {
    const { user, isAuthenticated } = useAuth();

    const checkReminders = useCallback(async () => {
        if (!user || !isAuthenticated) return;

        // Check if notifications are enabled
        const permission = getNotificationPermission();
        const preference = getNotificationPreference();

        if (permission !== "granted" || !preference) return;

        try {
            // Get user profile to check reminder settings
            const profile = await getUserProfile(user.uid);
            const reminderHours = profile?.preferences?.reminderTime || 24;

            // Fetch assessments and events
            const [assessments, events] = await Promise.all([
                getAssessments(user.uid),
                getCalendarEvents(user.uid)
            ]);

            // Check for assessment due dates
            checkDueDateReminders(
                assessments.map(a => ({
                    id: a.id,
                    title: a.title,
                    dueDate: a.dueDate,
                    status: a.status
                })),
                reminderHours
            );

            // Check for upcoming events with reminders enabled
            const eventsWithReminders = events.filter(e => e.reminder);
            checkEventReminders(
                eventsWithReminders.map(e => ({
                    id: e.id,
                    title: e.title,
                    date: e.date,
                    time: e.time
                })),
                1 // 1 hour before events
            );
        } catch (err) {
            console.error("Failed to check reminders:", err);
        }
    }, [user, isAuthenticated]);

    // Check reminders on mount and periodically
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Initial check after a short delay
        const initialTimeout = setTimeout(checkReminders, 5000);

        // Periodic checks
        const intervalId = setInterval(checkReminders, REMINDER_CHECK_INTERVAL);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(intervalId);
        };
    }, [isAuthenticated, user, checkReminders]);

    // Request permission on first visit if not already granted
    const requestPermission = useCallback(async () => {
        return await requestNotificationPermission();
    }, []);

    return {
        checkReminders,
        requestPermission,
        isSupported: "Notification" in window,
        permission: getNotificationPermission(),
        isEnabled: getNotificationPreference()
    };
}
