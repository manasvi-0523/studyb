import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { OpportunityFeed } from "../components/community/OpportunityFeed";
import { StudyRoomList } from "../components/community/StudyRoomList";
import { Share2, Rocket, Heart, MessageCircle, Send, X } from "lucide-react";

interface Achievement {
    id: string;
    user: string;
    achievement: string;
    time: string;
    reactions: { fire: number; heart: number; rocket: number; clap: number };
    userReactions: string[];
}

export function CommunityPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([
        {
            id: "1",
            user: "Ananya",
            achievement: "Cracked the Google Step Internship 2026! 🎉",
            time: "2h ago",
            reactions: { fire: 42, heart: 15, rocket: 8, clap: 12 },
            userReactions: []
        },
        {
            id: "2",
            user: "Rahul",
            achievement: "Top 1% in the National Design Open. Grateful.",
            time: "5h ago",
            reactions: { fire: 28, heart: 9, rocket: 5, clap: 10 },
            userReactions: []
        }
    ]);

    const [showStartupModal, setShowStartupModal] = useState(false);
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);
    const [newPost, setNewPost] = useState("");
    const [showNewPostInput, setShowNewPostInput] = useState(false);

    const handleReaction = (achievementId: string, reaction: string) => {
        setAchievements(achievements.map(a => {
            if (a.id === achievementId) {
                const hasReacted = a.userReactions.includes(reaction);
                return {
                    ...a,
                    reactions: {
                        ...a.reactions,
                        [reaction]: a.reactions[reaction as keyof typeof a.reactions] + (hasReacted ? -1 : 1)
                    },
                    userReactions: hasReacted
                        ? a.userReactions.filter(r => r !== reaction)
                        : [...a.userReactions, reaction]
                };
            }
            return a;
        }));
    };

    const handlePostAchievement = () => {
        if (!newPost.trim()) return;

        const newAchievement: Achievement = {
            id: crypto.randomUUID(),
            user: "You",
            achievement: newPost,
            time: "Just now",
            reactions: { fire: 0, heart: 0, rocket: 0, clap: 0 },
            userReactions: []
        };

        setAchievements([newAchievement, ...achievements]);
        setNewPost("");
        setShowNewPostInput(false);
    };

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 bg-white/60">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-playfair text-2xl text-charcoal">Achievement Posts</h3>
                            <button
                                onClick={() => setShowNewPostInput(!showNewPostInput)}
                                className="text-xs font-bold text-gold hover:text-charcoal transition-colors uppercase tracking-wider"
                            >
                                + Share Achievement
                            </button>
                        </div>

                        {showNewPostInput && (
                            <div className="mb-6 p-4 bg-gold/5 rounded-2xl border border-gold/20">
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="Share your achievement..."
                                    className="w-full bg-transparent text-sm resize-none focus:outline-none"
                                    rows={3}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => setShowNewPostInput(false)}
                                        className="px-4 py-2 text-xs text-charcoal/60 hover:text-charcoal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePostAchievement}
                                        disabled={!newPost.trim()}
                                        className="gold-button text-xs flex items-center gap-2"
                                    >
                                        <Send size={12} /> Post
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {achievements.map((achievement) => (
                                <AchievementPost
                                    key={achievement.id}
                                    {...achievement}
                                    onReaction={(reaction) => handleReaction(achievement.id, reaction)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-white/60 border-t-4 border-gold">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-playfair text-2xl text-charcoal flex items-center gap-3">
                                <Rocket className="text-gold" /> Startup Hub
                            </h3>
                            <span className="text-[10px] uppercase font-bold text-charcoal/40 tracking-widest bg-charcoal/5 px-3 py-1 rounded-full">Alumni Collab</span>
                        </div>
                        <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10">
                            <h4 className="font-semibold text-charcoal">VC-V3 Engine Development</h4>
                            <p className="text-xs text-charcoal/60 mt-2 leading-relaxed">
                                Looking for 2 Backend Engineers for a student-led ed-tech startup.
                                Mentorship from Alumni at NVIDIA.
                            </p>
                            <div className="mt-4 flex gap-2 flex-wrap">
                                <span className="text-[9px] px-2 py-1 bg-charcoal/5 rounded-full text-charcoal/60">Node.js</span>
                                <span className="text-[9px] px-2 py-1 bg-charcoal/5 rounded-full text-charcoal/60">PostgreSQL</span>
                                <span className="text-[9px] px-2 py-1 bg-charcoal/5 rounded-full text-charcoal/60">GraphQL</span>
                            </div>
                            <button
                                onClick={() => setShowStartupModal(true)}
                                className="gold-button w-full mt-6 text-xs font-bold uppercase tracking-wider"
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
                    onSubmit={() => {
                        setApplicationSubmitted(true);
                        setShowStartupModal(false);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

function AchievementPost({
    user,
    achievement,
    time,
    reactions,
    userReactions,
    onReaction
}: Achievement & { onReaction: (reaction: string) => void }) {
    const [showComments, setShowComments] = useState(false);

    const reactionButtons = [
        { key: "fire", emoji: "🔥", count: reactions.fire },
        { key: "heart", emoji: "❤️", count: reactions.heart },
        { key: "rocket", emoji: "🚀", count: reactions.rocket },
        { key: "clap", emoji: "👏", count: reactions.clap }
    ];

    return (
        <div className="p-5 rounded-3xl bg-white/40 border border-charcoal/5 hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center text-xs font-bold text-sage">
                    {user[0]}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-charcoal">{user}</h4>
                    <p className="text-[10px] text-charcoal/40">{time}</p>
                </div>
            </div>
            <p className="text-xs text-charcoal/80 leading-relaxed font-medium">{achievement}</p>

            <div className="mt-4 pt-4 border-t border-charcoal/5 flex justify-between items-center">
                <div className="flex gap-2">
                    {reactionButtons.map(({ key, emoji, count }) => (
                        <button
                            key={key}
                            onClick={() => onReaction(key)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all ${userReactions.includes(key)
                                    ? "bg-gold/20 text-charcoal"
                                    : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10"
                                }`}
                        >
                            {emoji} {count}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="p-2 rounded-full hover:bg-charcoal/5 text-charcoal/40 group"
                    >
                        <MessageCircle size={14} className="group-hover:text-gold transition-colors" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-charcoal/5 text-charcoal/40 group">
                        <Share2 size={14} className="group-hover:text-gold transition-colors" />
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="mt-4 p-3 bg-charcoal/5 rounded-xl">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold/40"
                    />
                </div>
            )}
        </div>
    );
}

function StartupApplicationModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        skills: "",
        motivation: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                    <div>
                        <h3 className="font-playfair text-xl text-charcoal">Apply to Startup</h3>
                        <p className="text-xs text-charcoal/40 mt-1">VC-V3 Engine Development</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Key Skills</label>
                        <input
                            type="text"
                            required
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="e.g. Node.js, PostgreSQL, React"
                            className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Why do you want to join?</label>
                        <textarea
                            required
                            value={formData.motivation}
                            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                            rows={3}
                            className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 hover:bg-charcoal/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 gold-button"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
