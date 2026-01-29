import { useState } from "react";
import { Video, Mic, MicOff, Users as UsersIcon, X, Check } from "lucide-react";

interface StudyRoom {
    id: string;
    name: string;
    host: string;
    users: number;
    mode: "Silent" | "Discussion" | "Video";
    isJoined: boolean;
}

export function StudyRoomList() {
    const [rooms, setRooms] = useState<StudyRoom[]>([
        { id: "1", name: "Silent Study Group 4", host: "Manasvi", users: 12, mode: "Silent", isJoined: false },
        { id: "2", name: "Finals Prep - Physics", host: "Rohit", users: 8, mode: "Discussion", isJoined: false },
        { id: "3", name: "UI/UX Feedback", host: "Ananya", users: 5, mode: "Video", isJoined: false },
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoom, setNewRoom] = useState<Partial<StudyRoom>>({ mode: "Silent" });

    const getModeIcon = (mode: StudyRoom["mode"]) => {
        switch (mode) {
            case "Silent": return <MicOff size={14} className="text-charcoal/20" />;
            case "Discussion": return <Mic size={14} className="text-gold" />;
            case "Video": return <Video size={14} className="text-sage" />;
        }
    };

    const handleJoinRoom = (roomId: string) => {
        setRooms(rooms.map(room => {
            if (room.id === roomId) {
                return {
                    ...room,
                    isJoined: !room.isJoined,
                    users: room.isJoined ? room.users - 1 : room.users + 1
                };
            }
            return room;
        }));
    };

    const handleCreateRoom = () => {
        if (!newRoom.name) return;

        const room: StudyRoom = {
            id: crypto.randomUUID(),
            name: newRoom.name,
            host: "You",
            users: 1,
            mode: newRoom.mode || "Silent",
            isJoined: true
        };

        setRooms([room, ...rooms]);
        setShowCreateModal(false);
        setNewRoom({ mode: "Silent" });
    };

    return (
        <>
            <div className="glass-card p-6 bg-white/40 h-full flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-playfair text-xl text-charcoal">Study Rooms</h3>
                        <p className="text-xs text-charcoal/40 mt-1">Real-time collaborative nodes</p>
                    </div>
                    <div className="p-2 bg-charcoal/5 rounded-full">
                        <UsersIcon size={18} className="text-charcoal/60" />
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    {rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-charcoal/5 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-charcoal/30">
                                    {getModeIcon(room.mode)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-charcoal">{room.name}</h4>
                                    <p className="text-[10px] text-charcoal/40 font-medium">
                                        Host: <span className="text-gold">{room.host}</span> • {room.users} active
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleJoinRoom(room.id)}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all ${room.isJoined
                                            ? "bg-sage/20 text-sage"
                                            : "text-sage hover:bg-sage/10"
                                        }`}
                                >
                                    {room.isJoined ? "Joined ✓" : "Join"}
                                </button>
                                <div className="w-6 h-6 rounded-lg bg-beige/40 border border-beige/60 flex items-center justify-center text-[10px]">
                                    👋
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="gold-button mt-4 w-full text-xs py-3 bg-sage hover:bg-sage/90"
                >
                    Create a Node
                </button>
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-playfair text-xl text-charcoal">Create Study Room</h3>
                                <p className="text-xs text-charcoal/40 mt-1">Start a collaborative session</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Room Name</label>
                                <input
                                    type="text"
                                    value={newRoom.name || ""}
                                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                    placeholder="e.g. Math Study Group"
                                    className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Room Mode</label>
                                <div className="flex gap-2 mt-2">
                                    {(["Silent", "Discussion", "Video"] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setNewRoom({ ...newRoom, mode })}
                                            className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${newRoom.mode === mode
                                                    ? "bg-sage/20 border-2 border-sage"
                                                    : "bg-charcoal/5 border-2 border-transparent hover:bg-charcoal/10"
                                                }`}
                                        >
                                            {getModeIcon(mode)}
                                            <span className="text-[10px] font-bold uppercase">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-charcoal/10 flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 hover:bg-charcoal/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                disabled={!newRoom.name}
                                className="flex-1 gold-button bg-sage hover:bg-sage/90 disabled:opacity-50"
                            >
                                Create Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
