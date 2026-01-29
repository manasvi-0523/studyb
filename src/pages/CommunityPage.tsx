import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { OpportunityFeed } from "../components/community/OpportunityFeed";
import { StudyRoomList } from "../components/community/StudyRoomList";
import { Share2, Rocket, Heart, MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
    type Achievement,
    saveAchievement,
    subscribeToAchievements,
    updateAchievementReaction,
    saveUserReaction,
    deleteUserReaction,
    getUserReactions,
    type StartupApplication,
    saveStartupApplication,
    getUserStartupApplications
} from "../lib/dataService";
import { formatDistanceToNow } from "date-fns";

interface AchievementWithUserReactions extends Achievement {
    userReactions: string[];
}

export function CommunityPage() {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<AchievementWithUserReactions[]>([]);
    const [userReactions, setUserReactions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showStartupModal, setShowStartupModal] = useState(false);
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);
    const [newPost, setNewPost] = useState("");
    const [showNewPostInput, setShowNewPostInput] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // Load achievements and user reactions
    useEffect(() => {
        const unsubscribe = subscribeToAchievements((data) => {
            setAchievements(data.map(a => ({ ...a, userReactions: [] })));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load user's reactions
    useEffect(() => {
        if (!user) return;

        getUserReactions(user.uid).then(reactions => {
            setUserReactions(reactions);
        });

        // Check if user has submitted startup application
        getUserStartupApplications(user.uid).then(apps => {
            if (apps.length > 0) {
                setApplicationSubmitted(true);
            }
        });
    }, [user]);

    // Merge user reactions with achievements
    useEffect(() => {
        setAchievements(prev => prev.map(a => ({
            ...a,
            userReactions: userReactions
                .filter(r => r.startsWith(a.id))
                .map(r => r.split("_")[1])
        })));
    }, [userReactions]);

    const handleReaction = async (achievementId: string, reaction: string) => {
        if (!user) return;

        const reactionKey = `${achievementId}_${reaction}`;
        const hasReacted = userReactions.includes(reactionKey);

        // Optimistic update
        if (hasReacted) {
            setUserReactions(prev => prev.filter(r => r !== reactionKey));
        } else {
            setUserReactions(prev => [...prev, reactionKey]);
        }

        // Update in Firebase
        try {
            await updateAchievementReaction(
                achievementId,
                reaction as keyof Achievement["reactions"],
                hasReacted ? -1 : 1
            );

            if (hasReacted) {
                await deleteUserReaction(user.uid, achievementId, reaction);
            } else {
                await saveUserReaction(user.uid, achievementId, reaction);
            }
        } catch (error) {
            console.error("Failed to update reaction:", error);
            // Revert optimistic update
            if (hasReacted) {
                setUserReactions(prev => [...prev, reactionKey]);
            } else {
                setUserReactions(prev => prev.filter(r => r !== reactionKey));
            }
        }
    };

    const handlePostAchievement = async () => {
        if (!newPost.trim() || !user) return;

        setIsPosting(true);
        try {
            const achievement: Achievement = {
                id: crypto.randomUUID(),
                userId: user.uid,
                userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
                achievement: newPost,
                createdAt: new Date().toISOString(),
                reactions: { fire: 0, heart: 0, rocket: 0, clap: 0 }
            };

            await saveAchievement(achievement);
            setNewPost("");
            setShowNewPostInput(false);
        } catch (error) {
            console.error("Failed to post achievement:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleStartupSubmit = async (formData: { name: string; email: string; skills: string; motivation: string }) => {
        if (!user) return;

        const application: StartupApplication = {
            id: crypto.randomUUID(),
            userId: user.uid,
            startupId: "vc-v3-engine",
            ...formData,
            status: "pending"
        };

        await saveStartupApplication(application);
        setApplicationSubmitted(true);
        setShowStartupModal(false);
    };

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 bg-white/60">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-playfair text-2xl text-charcoal dark:text-white">Achievement Posts</h3>
                            {user && (
                                <button
                                    onClick={() => setShowNewPostInput(!showNewPostInput)}
                                    className="text-xs font-bold text-gold hover:text-charcoal dark:hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    + Share Achievement
                                </button>
                            )}
                        </div>

                        {showNewPostInput && (
                            <div className="mb-6 p-4 bg-gold/5 rounded-2xl border border-gold/20">
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="Share your achievement..."
                                    className="w-full bg-transparent text-sm resize-none focus:outline-none dark:text-white"
                                    rows={3}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => setShowNewPostInput(false)}
                                        className="px-4 py-2 text-xs text-charcoal/60 hover:text-charcoal dark:text-white/60 dark:hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePostAchievement}
                                        disabled={!newPost.trim() || isPosting}
                                        className="gold-button text-xs flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isPosting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                        Post
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 size={32} className="animate-spin text-gold" />
                            </div>
                        ) : achievements.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-charcoal/60 dark:text-white/60">
                                    No achievements yet. Be the first to share!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {achievements.map((achievement) => (
                                    <AchievementPost
                                        key={achievement.id}
                                        {...achievement}
                                        onReaction={(reaction) => handleReaction(achievement.id, reaction)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-8 bg-white/60 border-t-4 border-gold">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-playfair text-2xl text-charcoal dark:text-white flex items-center gap-3">
                                <Rocket className="text-gold" /> Startup Hub
                            </h3>
                            <span className="text-[10px] uppercase font-bold text-charcoal/40 dark:text-white/40 tracking-widest bg-charcoal/5 dark:bg-white/5 px-3 py-1 rounded-full">Alumni Collab</span>
                        </div>
                        <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10">
                            <h4 className="font-semibold text-charcoal dark:text-white">VC-V3 Engine Development</h4>
                            <p className="text-xs text-charcoal/60 dark:text-white/60 mt-2 leading-relaxed">
                                Looking for 2 Backend Engineers for a student-led ed-tech startup.
                                Mentorship from Alumni at NVIDIA.
                            </p>
                            <div className="mt-4 flex gap-2 flex-wrap">
                                <span className="text-[9px] px-2 py-1 bg-charcoal/5 dark:bg-white/10 rounded-full text-charcoal/60 dark:text-white/60">Node.js</span>
                                <span className="text-[9px] px-2 py-1 bg-charcoal/5 dark:bg-white/10 rounded-full text-charcoal/60 dark:text-white/60">PostgreSQL</span>
                                <span className="text-[9px] px-2 py-1 bg-charcoal/5 dark:bg-white/10 rounded-full text-charcoal/60 dark:text-white/60">GraphQL</span>
                            </div>
                            <button
                                onClick={() => setShowStartupModal(true)}
                                disabled={applicationSubmitted}
                                className="gold-button w-full mt-6 text-xs font-bold uppercase tracking-wider disabled:opacity-70"
                            >
                                {applicationSubmitted ? "Application Submitted ✓" : "Apply to Startup"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Columns */}
                <div className="lg:col-span-2 grid grid-cols-1 gap-8">
                    <OpportunityFeed />
                    <StudyRoomList />
                </div>
            </div>

            {/* Startup Application Modal */}
            {showStartupModal && (
                <StartupApplicationModal
                    onClose={() => setShowStartupModal(false)}
                    onSubmit={handleStartupSubmit}
                />
            )}
        </DashboardLayout>
    );
}

function AchievementPost({
    userName,
    achievement,
    createdAt,
    reactions,
    userReactions,
    onReaction
}: AchievementWithUserReactions & { onReaction: (reaction: string) => void }) {
    const [showComments, setShowComments] = useState(false);

    const timeAgo = createdAt?.toDate
        ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true })
        : createdAt
            ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
            : "Just now";

    const reactionButtons = [
        { key: "fire", emoji: "🔥", count: reactions.fire },
        { key: "heart", emoji: "❤️", count: reactions.heart },
        { key: "rocket", emoji: "🚀", count: reactions.rocket },
        { key: "clap", emoji: "👏", count: reactions.clap }
    ];

    return (
        <div className="p-5 rounded-3xl bg-white/40 dark:bg-white/5 border border-charcoal/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center text-xs font-bold text-sage">
                    {userName[0]?.toUpperCase()}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-charcoal dark:text-white">{userName}</h4>
                    <p className="text-[10px] text-charcoal/40 dark:text-white/40">{timeAgo}</p>
                </div>
            </div>
            <p className="text-xs text-charcoal/80 dark:text-white/80 leading-relaxed font-medium">{achievement}</p>

            <div className="mt-4 pt-4 border-t border-charcoal/5 dark:border-white/5 flex justify-between items-center">
                <div className="flex gap-2">
                    {reactionButtons.map(({ key, emoji, count }) => (
                        <button
                            key={key}
                            onClick={() => onReaction(key)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all ${userReactions.includes(key)
                                    ? "bg-gold/20 text-charcoal dark:text-white"
                                    : "bg-charcoal/5 dark:bg-white/5 text-charcoal/60 dark:text-white/60 hover:bg-charcoal/10 dark:hover:bg-white/10"
                                }`}
                        >
                            {emoji} {count}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="p-2 rounded-full hover:bg-charcoal/5 dark:hover:bg-white/5 text-charcoal/40 dark:text-white/40 group"
                    >
                        <MessageCircle size={14} className="group-hover:text-gold transition-colors" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-charcoal/5 dark:hover:bg-white/5 text-charcoal/40 dark:text-white/40 group">
                        <Share2 size={14} className="group-hover:text-gold transition-colors" />
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="mt-4 p-3 bg-charcoal/5 dark:bg-white/5 rounded-xl">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full bg-white dark:bg-charcoal rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold/40"
                    />
                </div>
            )}
        </div>
    );
}

function StartupApplicationModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: { name: string; email: string; skills: string; motivation: string }) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        skills: "",
        motivation: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-charcoal rounded-3xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-charcoal/10 dark:border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="font-playfair text-xl text-charcoal dark:text-white">Apply to Startup</h3>
                        <p className="text-xs text-charcoal/40 dark:text-white/40 mt-1">VC-V3 Engine Development</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-charcoal/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-charcoal dark:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full mt-2 p-3 bg-background/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full mt-2 p-3 bg-background/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Key Skills</label>
                        <input
                            type="text"
                            required
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="e.g. Node.js, PostgreSQL, React"
                            className="w-full mt-2 p-3 bg-background/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Why do you want to join?</label>
                        <textarea
                            required
                            value={formData.motivation}
                            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                            rows={3}
                            className="w-full mt-2 p-3 bg-background/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 resize-none dark:text-white"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 dark:text-white/60 hover:bg-charcoal/5 dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 gold-button flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
