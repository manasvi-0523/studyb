import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { User, Bell, LogOut, ChevronRight, Moon, Globe } from "lucide-react";
import { getSupabaseClient } from "../lib/supabaseClient";

export function SettingsPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        studyReminders: true,
        deadlineAlerts: true,
        communityUpdates: false
    });

    useEffect(() => {
        const supabase = getSupabaseClient();
        if (supabase) {
            supabase.auth.getUser().then(({ data }) => {
                setEmail(data.user?.email ?? null);
            });
        }
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        navigate("/auth");
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="font-playfair text-3xl text-charcoal mb-2">Settings</h1>
                    <p className="text-sm text-charcoal/40">Manage your account and preferences</p>
                </div>

                {/* Profile Section */}
                <div className="glass-card p-6 bg-white/60">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sage/20 rounded-lg">
                            <User size={18} className="text-sage" />
                        </div>
                        <h2 className="font-playfair text-xl text-charcoal">Profile</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                            <div>
                                <p className="text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-sm text-charcoal">{email ?? "Not signed in"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="glass-card p-6 bg-white/60">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gold/20 rounded-lg">
                            <Bell size={18} className="text-gold" />
                        </div>
                        <h2 className="font-playfair text-xl text-charcoal">Notifications</h2>
                    </div>

                    <div className="space-y-3">
                        <ToggleSetting
                            label="Study Reminders"
                            description="Get reminded to study based on your schedule"
                            enabled={notifications.studyReminders}
                            onChange={(enabled) => setNotifications(n => ({ ...n, studyReminders: enabled }))}
                        />
                        <ToggleSetting
                            label="Deadline Alerts"
                            description="Receive alerts before assignment deadlines"
                            enabled={notifications.deadlineAlerts}
                            onChange={(enabled) => setNotifications(n => ({ ...n, deadlineAlerts: enabled }))}
                        />
                        <ToggleSetting
                            label="Community Updates"
                            description="Stay updated with study room activities"
                            enabled={notifications.communityUpdates}
                            onChange={(enabled) => setNotifications(n => ({ ...n, communityUpdates: enabled }))}
                        />
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="glass-card p-6 bg-white/60">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-charcoal/10 rounded-lg">
                            <Globe size={18} className="text-charcoal/60" />
                        </div>
                        <h2 className="font-playfair text-xl text-charcoal">Preferences</h2>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background transition-colors group">
                            <div className="flex items-center gap-3">
                                <Moon size={16} className="text-charcoal/40" />
                                <div className="text-left">
                                    <p className="text-sm font-medium text-charcoal">Dark Mode</p>
                                    <p className="text-[10px] text-charcoal/40">Coming soon</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-charcoal/20 group-hover:text-charcoal/40 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Logout Section */}
                <div className="glass-card p-6 bg-white/60 border-red-100">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {loading ? "Signing out..." : "Sign Out"}
                        </span>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

interface ToggleSettingProps {
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function ToggleSetting({ label, description, enabled, onChange }: ToggleSettingProps) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
            <div>
                <p className="text-sm font-medium text-charcoal">{label}</p>
                <p className="text-[10px] text-charcoal/40">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                    enabled ? "bg-sage" : "bg-charcoal/20"
                }`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        enabled ? "translate-x-7" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}
