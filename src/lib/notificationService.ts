// Web Notification Service for Due Date Reminders

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: Record<string, unknown>;
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
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

export function isNotificationSupported(): boolean {
    return "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | null {
    if (!isNotificationSupported()) return null;
    return Notification.permission;
}

export function showNotification(options: NotificationOptions): Notification | null {
    if (!isNotificationSupported() || Notification.permission !== "granted") {
        return null;
    }

    const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/favicon.ico",
        tag: options.tag,
        data: options.data,
        badge: "/favicon.ico",
        requireInteraction: false
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };

    return notification;
}

// Schedule a notification for a specific time
export function scheduleNotification(
    options: NotificationOptions,
    scheduledTime: Date
): ReturnType<typeof setTimeout> | null {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
        // Time has already passed
        return null;
    }

    return setTimeout(() => {
        showNotification(options);
    }, delay);
}

// Check for assessments due soon and show notifications
export function checkDueDateReminders(
    assessments: Array<{
        id: string;
        title: string;
        dueDate: string;
        status: string;
    }>,
    reminderHours: number = 24
): void {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);

    assessments.forEach(assessment => {
        if (assessment.status === "completed") return;

        const dueDate = new Date(assessment.dueDate);

        // Check if due date is within reminder window
        if (dueDate > now && dueDate <= reminderTime) {
            const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

            showNotification({
                title: "Assessment Due Soon",
                body: `"${assessment.title}" is due in ${hoursUntilDue} hour${hoursUntilDue > 1 ? "s" : ""}`,
                tag: `assessment-reminder-${assessment.id}`,
                data: { assessmentId: assessment.id }
            });
        }
    });
}

// Check for events happening soon
export function checkEventReminders(
    events: Array<{
        id: string;
        title: string;
        date: string;
        time?: string;
    }>,
    reminderHours: number = 1
): void {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);

    events.forEach(event => {
        let eventDateTime = new Date(event.date);

        if (event.time) {
            const [hours, minutes] = event.time.split(":").map(Number);
            eventDateTime.setHours(hours || 0, minutes || 0);
        }

        // Check if event is within reminder window
        if (eventDateTime > now && eventDateTime <= reminderTime) {
            const minutesUntil = Math.ceil((eventDateTime.getTime() - now.getTime()) / (1000 * 60));

            showNotification({
                title: "Upcoming Event",
                body: `"${event.title}" starts in ${minutesUntil} minute${minutesUntil > 1 ? "s" : ""}`,
                tag: `event-reminder-${event.id}`,
                data: { eventId: event.id }
            });
        }
    });
}

// Store notification preferences in localStorage
export function setNotificationPreference(enabled: boolean): void {
    localStorage.setItem("elite-notifications-enabled", String(enabled));
}

export function getNotificationPreference(): boolean {
    return localStorage.getItem("elite-notifications-enabled") !== "false";
}
