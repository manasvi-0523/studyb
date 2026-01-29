import { DashboardLayout } from "../components/layout/DashboardLayout";
import { OpportunityFeed } from "../components/community/OpportunityFeed";
import { StudyRoomList } from "../components/community/StudyRoomList";
import { Share2, Rocket, Trophy } from "lucide-react";

export function CommunityPage() {
    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 bg-white/60">
                        <h3 className="font-playfair text-2xl text-charcoal mb-6">Achievement Posts</h3>
                        <div className="space-y-6">
                            <AchievementPost
                                user="Ananya"
                                achievement="Cracked the Google Step Internship 2026! 🎉"
                                time="2h ago"
                                reactions="🔥 42 • ❤️ 15"
                            />
                            <AchievementPost
                                user="Rahul"
                                achievement="Top 1% in the National Design Open. Grateful."
                                time="5h ago"
                                reactions="🚀 28 • 👏 9"
                            />
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
                            <button className="gold-button w-full mt-6 text-xs font-bold uppercase tracking-wider">Apply to Startup</button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Columns */}
                <div className="lg:col-span-2 grid grid-cols-1 gap-8">
                    <OpportunityFeed />
                    <StudyRoomList />
                </div>
            </div>
        </DashboardLayout>
    );
}

function AchievementPost({ user, achievement, time, reactions }: { user: string, achievement: string, time: string, reactions: string }) {
    return (
        <div className="p-5 rounded-3xl bg-white/40 border border-charcoal/5 hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center text-xs font-bold text-sage">{user[0]}</div>
                <div>
                    <h4 className="text-sm font-semibold text-charcoal">{user}</h4>
                    <p className="text-[10px] text-charcoal/40">{time}</p>
                </div>
            </div>
            <p className="text-xs text-charcoal/80 leading-relaxed font-medium">{achievement}</p>
            <div className="mt-4 pt-4 border-t border-charcoal/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-charcoal/40 tracking-wide uppercase">{reactions}</span>
                <button className="p-2 rounded-full hover:bg-charcoal/5 text-charcoal/40 group">
                    <Share2 size={14} className="group-hover:text-gold transition-colors" />
                </button>
            </div>
        </div>
    );
}
