import { Video, Mic, MessageSquare } from "lucide-react";

export function StudyRoomList() {
    const rooms = [
        { name: "Silent Study Group 4", host: "Manasvi", users: 12, mode: "Silent", icon: <Mic size={14} className="text-charcoal/20" /> },
        { name: "Finals Prep - Physics", host: "Rohit", users: 8, mode: "Discussion", icon: <Mic size={14} className="text-gold" /> },
        { name: "UI/UX Feedback", host: "Ananya", users: 5, mode: "Video", icon: <Video size={14} className="text-sage" /> },
    ];

    return (
        <div className="glass-card p-6 bg-white/40 h-full flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="font-playfair text-xl text-charcoal">Study Rooms</h3>
                    <p className="text-xs text-charcoal/40 mt-1">Real-time collaborative nodes</p>
                </div>
                <div className="p-2 bg-charcoal/5 rounded-full">
                    <Users size={18} className="text-charcoal/60" />
                </div>
            </div>

            <div className="space-y-4">
                {rooms.map((room, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-charcoal/5 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-charcoal/30">
                                {room.icon}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-charcoal">{room.name}</h4>
                                <p className="text-[10px] text-charcoal/40 font-medium">Host: <span className="text-gold">{room.host}</span> • {room.users} active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="text-[11px] font-bold text-sage">Join</span>
                            </div>
                            {/* Reaction Placeholder */}
                            <div className="w-6 h-6 rounded-lg bg-beige/40 border border-beige/60 flex items-center justify-center text-[10px]">
                                👋
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="gold-button mt-auto w-full text-xs py-3 bg-sage hover:bg-sage/90">
                Create a Node
            </button>
        </div>
    );
}

function Users({ size, className }: { size: number, className: string }) {
    return <UsersIcon size={size} className={className} />;
}
import { Users as UsersIcon } from "lucide-react";
