import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
    User,
    Bell,
    Shield,
    Palette,
    Moon,
    Sun,
    Loader2,
    Check,
    LogOut,
    Mail,
    Key,
    Trash2,
    Globe,
    VolumeX,
    ChevronRight,
    AlertTriangle,
    Clock,
    Save
} from "lucide-react";
import {
    requestNotificationPermission,
    isNotificationSupported,
    getNotificationPermission,
    setNotificationPreference,
    getNotificationPreference
} from "../lib/notificationService";
import { saveUserProfile, getUserProfile, type UserProfile } from "../lib/dataService";

type SettingsSection = "profile" | "notifications" | "appearance" | "security";

export function SettingsPage() {
    const { user, signOut, isFirebaseEnabled, isEmailVerified, sendVerification } = useAuth();
    const { theme, setTheme } = useTheme();

    const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

    // Settings State
    const [settings, setSettings] = useState({
        // Profile
        displayName: user?.displayName || "Student",
        email: user?.email || "",

        // Notifications
        pushNotifications: getNotificationPreference(),
        emailNotifications: true,
        assignmentReminders: true,
        attendanceAlerts: true,
        communityUpdates: false,
        reminderTime: 24, // hours before due

        // Appearance
        reducedMotion: false,

        // Security
        twoFactorEnabled: false
    });

    // Load user profile on mount
    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setSettings(prev => ({
                        ...prev,
                        displayName: profile.displayName || prev.displayName,
                        pushNotifications: profile.preferences?.notifications ?? prev.pushNotifications,
                        emailNotifications: profile.preferences?.emailNotifications ?? prev.emailNotifications,
                        reminderTime: profile.preferences?.reminderTime ?? prev.reminderTime
                    }));
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            }
        }

        loadProfile();
        setNotificationPermission(getNotificationPermission());
    }, [user]);

    const handleEnablePush = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setSettings({ ...settings, pushNotifications: true });
            setNotificationPreference(true);
            setNotificationPermission("granted");
            setSuccess("Push notifications enabled!");
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setSuccess("Notifications permission denied. Please enable in browser settings.");
            setTimeout(() => setSuccess(null), 5000);
        }
    };

    const handleTogglePush = async () => {
        if (!settings.pushNotifications) {
            await handleEnablePush();
        } else {
            setSettings({ ...settings, pushNotifications: false });
            setNotificationPreference(false);
        }
    };

    const handleSendVerificationEmail = async () => {
        setIsLoading(true);
        try {
            await sendVerification();
            setSuccess("Verification email sent!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const profile: Partial<UserProfile> = {
                displayName: settings.displayName,
                email: settings.email,
                preferences: {
                    notifications: settings.pushNotifications,
                    emailNotifications: settings.emailNotifications,
                    theme: theme,
                    reminderTime: settings.reminderTime
                }
            };

            await saveUserProfile(user.uid, profile);
            setNotificationPreference(settings.pushNotifications);
            setSuccess("Settings saved successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            setSuccess("Failed to save settings. Please try again.");
            setTimeout(() => setSuccess(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const sections = [
        { id: "profile" as const, label: "Profile", icon: User },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "appearance" as const, label: "Appearance", icon: Palette },
        { id: "security" as const, label: "Security", icon: Shield }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 lg:mb-8">
                    <h1 className="font-playfair text-2xl lg:text-3xl text-charcoal dark:text-white">Settings</h1>
                    <p className="text-sm text-charcoal/40 dark:text-white/40 mt-1">Manage your account and preferences</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Check size={18} />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Mobile Section Tabs */}
                    <div className="lg:hidden overflow-x-auto -mx-4 px-4">
                        <div className="flex gap-2 min-w-max">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                        activeSection === section.id
                                            ? "bg-gold text-white"
                                            : "bg-charcoal/5 dark:bg-white/10 text-charcoal/60 dark:text-white/60"
                                    }`}
                                >
                                    <section.icon size={16} />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="glass-card p-4 bg-white/60 dark:bg-white/5">
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            activeSection === section.id
                                                ? "bg-gold/20 text-gold"
                                                : "text-charcoal/60 dark:text-white/60 hover:bg-charcoal/5 dark:hover:bg-white/10 hover:text-charcoal dark:hover:text-white"
                                        }`}
                                    >
                                        <section.icon size={18} />
                                        {section.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-6 pt-6 border-t border-charcoal/10 dark:border-white/10">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-6 lg:p-8 bg-white/60 dark:bg-white/5">
                            {/* Profile Section */}
                            {activeSection === "profile" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal dark:text-white mb-1">Profile Settings</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-white/40">Manage your personal information</p>
                                    </div>

                                    {/* User Avatar */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-charcoal/5 dark:bg-white/5 rounded-2xl">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold/20 flex items-center justify-center text-xl sm:text-2xl font-bold text-gold">
                                            {settings.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h3 className="text-lg font-medium text-charcoal dark:text-white">{settings.displayName}</h3>
                                            <p className="text-sm text-charcoal/60 dark:text-white/60">{settings.email}</p>
                                            {!isEmailVerified && isFirebaseEnabled && (
                                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                                        <AlertTriangle size={12} />
                                                        Email not verified
                                                    </span>
                                                    <button
                                                        onClick={handleSendVerificationEmail}
                                                        disabled={isLoading}
                                                        className="text-xs text-gold hover:underline"
                                                    >
                                                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : "Verify now"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Display Name */}
                                    <div>
                                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Display Name</label>
                                        <input
                                            type="text"
                                            value={settings.displayName}
                                            onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                                            className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider flex items-center gap-2">
                                            <Mail size={12} /> Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            disabled
                                            className="w-full mt-2 p-3 bg-charcoal/10 dark:bg-white/10 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm text-charcoal/60 dark:text-white/60"
                                        />
                                        <p className="text-[10px] text-charcoal/40 dark:text-white/40 mt-1">Email cannot be changed</p>
                                    </div>

                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={isSaving}
                                        className="gold-button flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeSection === "notifications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal dark:text-white mb-1">Notification Preferences</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-white/40">Control how you receive updates</p>
                                    </div>

                                    {/* Browser notification status */}
                                    {isNotificationSupported() && (
                                        <div className={`p-4 rounded-2xl ${
                                            notificationPermission === "granted"
                                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                                : notificationPermission === "denied"
                                                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                    : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <Bell size={20} className={
                                                    notificationPermission === "granted"
                                                        ? "text-green-600 dark:text-green-400"
                                                        : notificationPermission === "denied"
                                                            ? "text-red-600 dark:text-red-400"
                                                            : "text-amber-600 dark:text-amber-400"
                                                } />
                                                <div>
                                                    <p className="text-sm font-medium text-charcoal dark:text-white">
                                                        {notificationPermission === "granted"
                                                            ? "Notifications enabled"
                                                            : notificationPermission === "denied"
                                                                ? "Notifications blocked"
                                                                : "Notifications not enabled"}
                                                    </p>
                                                    <p className="text-xs text-charcoal/60 dark:text-white/60">
                                                        {notificationPermission === "denied"
                                                            ? "Enable in browser settings"
                                                            : "Get reminders for due dates"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <ToggleSetting
                                            icon={Bell}
                                            label="Push Notifications"
                                            description="Receive browser notifications for updates"
                                            enabled={settings.pushNotifications}
                                            onChange={handleTogglePush}
                                            disabled={notificationPermission === "denied"}
                                        />
                                        <ToggleSetting
                                            icon={Mail}
                                            label="Email Notifications"
                                            description="Receive updates via email"
                                            enabled={settings.emailNotifications}
                                            onChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                        />
                                        <ToggleSetting
                                            icon={AlertTriangle}
                                            label="Assignment Reminders"
                                            description="Get reminded about upcoming deadlines"
                                            enabled={settings.assignmentReminders}
                                            onChange={() => setSettings({ ...settings, assignmentReminders: !settings.assignmentReminders })}
                                        />
                                        <ToggleSetting
                                            icon={User}
                                            label="Attendance Alerts"
                                            description="Get notified when attendance drops below threshold"
                                            enabled={settings.attendanceAlerts}
                                            onChange={() => setSettings({ ...settings, attendanceAlerts: !settings.attendanceAlerts })}
                                        />
                                        <ToggleSetting
                                            icon={Globe}
                                            label="Community Updates"
                                            description="Notifications for community posts and events"
                                            enabled={settings.communityUpdates}
                                            onChange={() => setSettings({ ...settings, communityUpdates: !settings.communityUpdates })}
                                        />
                                    </div>

                                    {/* Reminder Time */}
                                    <div>
                                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider flex items-center gap-2">
                                            <Clock size={12} /> Reminder Time
                                        </label>
                                        <select
                                            value={settings.reminderTime}
                                            onChange={(e) => setSettings({ ...settings, reminderTime: parseInt(e.target.value) })}
                                            className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                        >
                                            <option value="1">1 hour before</option>
                                            <option value="3">3 hours before</option>
                                            <option value="6">6 hours before</option>
                                            <option value="12">12 hours before</option>
                                            <option value="24">1 day before</option>
                                            <option value="48">2 days before</option>
                                            <option value="72">3 days before</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={isSaving}
                                        className="gold-button flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Preferences
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Appearance Section */}
                            {activeSection === "appearance" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal dark:text-white mb-1">Appearance</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-white/40">Customize the look and feel</p>
                                    </div>

                                    {/* Theme Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider mb-3 block">Theme</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: "light", label: "Light", icon: Sun },
                                                { id: "dark", label: "Dark", icon: Moon },
                                                { id: "system", label: "System", icon: Globe }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id as "light" | "dark" | "system")}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                                        theme === t.id
                                                            ? "border-gold bg-gold/10"
                                                            : "border-charcoal/10 dark:border-white/10 hover:border-charcoal/20 dark:hover:border-white/20"
                                                    }`}
                                                >
                                                    <t.icon size={24} className={theme === t.id ? "text-gold" : "text-charcoal/40 dark:text-white/40"} />
                                                    <span className="text-xs font-medium text-charcoal dark:text-white">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <ToggleSetting
                                        icon={VolumeX}
                                        label="Reduced Motion"
                                        description="Minimize animations throughout the app"
                                        enabled={settings.reducedMotion}
                                        onChange={() => setSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
                                    />
                                </div>
                            )}

                            {/* Security Section */}
                            {activeSection === "security" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal dark:text-white mb-1">Security</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-white/40">Protect your account</p>
                                    </div>

                                    {/* Email Verification Status */}
                                    <div className={`p-4 rounded-2xl border ${
                                        isEmailVerified
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Mail size={20} className={isEmailVerified ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"} />
                                                <div>
                                                    <h4 className="text-sm font-medium text-charcoal dark:text-white">Email Verification</h4>
                                                    <p className="text-xs text-charcoal/60 dark:text-white/60">
                                                        {isEmailVerified ? "Your email is verified" : "Please verify your email address"}
                                                    </p>
                                                </div>
                                            </div>
                                            {isEmailVerified ? (
                                                <Check size={20} className="text-green-600 dark:text-green-400" />
                                            ) : (
                                                <button
                                                    onClick={handleSendVerificationEmail}
                                                    disabled={isLoading}
                                                    className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                                                >
                                                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <SettingsLink
                                        icon={Key}
                                        label="Change Password"
                                        description="Update your password"
                                        onClick={() => { }}
                                    />

                                    <ToggleSetting
                                        icon={Shield}
                                        label="Two-Factor Authentication"
                                        description="Add an extra layer of security (coming soon)"
                                        enabled={settings.twoFactorEnabled}
                                        onChange={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                                        disabled={true}
                                    />

                                    {/* Danger Zone */}
                                    <div className="pt-6 mt-6 border-t border-charcoal/10 dark:border-white/10">
                                        <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">Danger Zone</h3>
                                        <SettingsLink
                                            icon={Trash2}
                                            label="Delete Account"
                                            description="Permanently delete your account and data"
                                            onClick={() => { }}
                                            danger
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Sign Out */}
                        <div className="lg:hidden mt-6">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 transition-all"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Toggle Setting Component
function ToggleSetting({
    icon: Icon,
    label,
    description,
    enabled,
    onChange,
    disabled = false
}: {
    icon: React.ElementType;
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-charcoal/5 dark:border-white/10 ${disabled ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-charcoal/5 dark:bg-white/10 flex items-center justify-center">
                    <Icon size={18} className="text-charcoal/40 dark:text-white/40" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-charcoal dark:text-white">{label}</h4>
                    <p className="text-xs text-charcoal/40 dark:text-white/40">{description}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                disabled={disabled}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${enabled ? "bg-sage" : "bg-charcoal/20 dark:bg-white/20"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${enabled ? "left-7" : "left-1"}`} />
            </button>
        </div>
    );
}

// Settings Link Component
function SettingsLink({
    icon: Icon,
    label,
    description,
    onClick,
    danger = false
}: {
    icon: React.ElementType;
    label: string;
    description: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                danger
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                    : "bg-white/60 dark:bg-white/5 border-charcoal/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? "bg-red-100 dark:bg-red-900/30" : "bg-charcoal/5 dark:bg-white/10"}`}>
                    <Icon size={18} className={danger ? "text-red-500" : "text-charcoal/40 dark:text-white/40"} />
                </div>
                <div className="text-left">
                    <h4 className={`text-sm font-medium ${danger ? "text-red-600 dark:text-red-400" : "text-charcoal dark:text-white"}`}>{label}</h4>
                    <p className="text-xs text-charcoal/40 dark:text-white/40">{description}</p>
                </div>
            </div>
            <ChevronRight size={18} className={danger ? "text-red-400" : "text-charcoal/20 dark:text-white/20"} />
        </button>
    );
}
