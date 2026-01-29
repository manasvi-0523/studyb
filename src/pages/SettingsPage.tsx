import { useState } from "react";
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
    AlertTriangle
} from "lucide-react";
import { requestNotificationPermission } from "../lib/firebaseClient";

type SettingsSection = "profile" | "notifications" | "appearance" | "security";

export function SettingsPage() {
    const { user, signOut, isFirebaseEnabled, isEmailVerified, sendVerification } = useAuth();
    const { theme, setTheme } = useTheme();

    const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // Settings State
    const [settings, setSettings] = useState({
        // Profile
        displayName: user?.displayName || "Student",
        email: user?.email || "user@example.com",

        // Notifications
        pushNotifications: true,
        emailNotifications: true,
        assignmentReminders: true,
        attendanceAlerts: true,
        communityUpdates: false,

        // Appearance
        reducedMotion: false,

        // Security
        twoFactorEnabled: false
    });

    const handleEnablePush = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setSettings({ ...settings, pushNotifications: true });
            setSuccess("Push notifications enabled!");
            setTimeout(() => setSuccess(null), 3000);
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
                <div className="mb-8">
                    <h1 className="font-playfair text-3xl text-charcoal">Settings</h1>
                    <p className="text-sm text-charcoal/40 mt-1">Manage your account and preferences</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-600 flex items-center gap-2">
                        <Check size={18} />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-card p-4 bg-white/60">
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                                                ? "bg-gold/20 text-gold"
                                                : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"
                                            }`}
                                    >
                                        <section.icon size={18} />
                                        {section.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-6 pt-6 border-t border-charcoal/10">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-8 bg-white/60">
                            {/* Profile Section */}
                            {activeSection === "profile" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal mb-1">Profile Settings</h2>
                                        <p className="text-xs text-charcoal/40">Manage your personal information</p>
                                    </div>

                                    {/* User Avatar */}
                                    <div className="flex items-center gap-6 p-6 bg-charcoal/5 rounded-2xl">
                                        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold">
                                            {settings.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-charcoal">{settings.displayName}</h3>
                                            <p className="text-sm text-charcoal/60">{settings.email}</p>
                                            {!isEmailVerified && isFirebaseEnabled && (
                                                <div className="flex items-center gap-2 mt-2">
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
                                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Display Name</label>
                                        <input
                                            type="text"
                                            value={settings.displayName}
                                            onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                                            className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider flex items-center gap-2">
                                            <Mail size={12} /> Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.email}
                                            disabled
                                            className="w-full mt-2 p-3 bg-charcoal/5 border border-charcoal/10 rounded-xl text-sm text-charcoal/60"
                                        />
                                        <p className="text-[10px] text-charcoal/40 mt-1">Email cannot be changed</p>
                                    </div>

                                    <button className="gold-button mt-4">
                                        Save Changes
                                    </button>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeSection === "notifications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal mb-1">Notification Preferences</h2>
                                        <p className="text-xs text-charcoal/40">Control how you receive updates</p>
                                    </div>

                                    <div className="space-y-4">
                                        <ToggleSetting
                                            icon={Bell}
                                            label="Push Notifications"
                                            description="Receive browser notifications for updates"
                                            enabled={settings.pushNotifications}
                                            onChange={() => handleEnablePush()}
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
                                </div>
                            )}

                            {/* Appearance Section */}
                            {activeSection === "appearance" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-xl text-charcoal mb-1">Appearance</h2>
                                        <p className="text-xs text-charcoal/40">Customize the look and feel</p>
                                    </div>

                                    {/* Theme Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-3 block">Theme</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: "light", label: "Light", icon: Sun },
                                                { id: "dark", label: "Dark", icon: Moon },
                                                { id: "system", label: "System", icon: Globe }
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id as any)}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === t.id
                                                            ? "border-gold bg-gold/10"
                                                            : "border-charcoal/10 hover:border-charcoal/20"
                                                        }`}
                                                >
                                                    <t.icon size={24} className={theme === t.id ? "text-gold" : "text-charcoal/40"} />
                                                    <span className="text-xs font-medium">{t.label}</span>
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
                                        <h2 className="font-playfair text-xl text-charcoal mb-1">Security</h2>
                                        <p className="text-xs text-charcoal/40">Protect your account</p>
                                    </div>

                                    {/* Email Verification Status */}
                                    <div className={`p-4 rounded-2xl border ${isEmailVerified ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Mail size={20} className={isEmailVerified ? "text-green-600" : "text-amber-600"} />
                                                <div>
                                                    <h4 className="text-sm font-medium text-charcoal">Email Verification</h4>
                                                    <p className="text-xs text-charcoal/60">
                                                        {isEmailVerified ? "Your email is verified" : "Please verify your email address"}
                                                    </p>
                                                </div>
                                            </div>
                                            {isEmailVerified ? (
                                                <Check size={20} className="text-green-600" />
                                            ) : (
                                                <button
                                                    onClick={handleSendVerificationEmail}
                                                    disabled={isLoading}
                                                    className="text-xs font-medium text-amber-600 hover:underline"
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
                                        description="Add an extra layer of security"
                                        enabled={settings.twoFactorEnabled}
                                        onChange={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                                    />

                                    {/* Danger Zone */}
                                    <div className="pt-6 mt-6 border-t border-charcoal/10">
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
    onChange
}: {
    icon: any;
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-charcoal/5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center">
                    <Icon size={18} className="text-charcoal/40" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-charcoal">{label}</h4>
                    <p className="text-xs text-charcoal/40">{description}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${enabled ? "bg-sage" : "bg-charcoal/20"}`}
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
    icon: any;
    label: string;
    description: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${danger
                    ? "bg-red-50 border-red-200 hover:bg-red-100"
                    : "bg-white/60 border-charcoal/5 hover:bg-white"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? "bg-red-100" : "bg-charcoal/5"}`}>
                    <Icon size={18} className={danger ? "text-red-500" : "text-charcoal/40"} />
                </div>
                <div className="text-left">
                    <h4 className={`text-sm font-medium ${danger ? "text-red-600" : "text-charcoal"}`}>{label}</h4>
                    <p className="text-xs text-charcoal/40">{description}</p>
                </div>
            </div>
            <ChevronRight size={18} className={danger ? "text-red-400" : "text-charcoal/20"} />
        </button>
    );
}
