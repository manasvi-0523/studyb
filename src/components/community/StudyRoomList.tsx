import { useState, useEffect } from "react";
import { Video, Mic, MicOff, Users as UsersIcon, X, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    type StudyRoom,
    subscribeToStudyRooms,
    saveStudyRoom,
    updateStudyRoomUsers,
    saveUserRoomJoin,
    deleteUserRoomJoin,
    getUserJoinedRooms
} from "../../lib/dataService";

interface StudyRoomWithUserState extends StudyRoom {
    isJoined: boolean;
}

// Default rooms to show if none exist
const DEFAULT_ROOMS: Omit<StudyRoom, "createdAt">[] = [
    { id: "1", name: "Silent Study Group 4", hostId: "system", hostName: "Manasvi", users: 12, mode: "Silent", isActive: true },
    { id: "2", name: "Finals Prep - Physics", hostId: "system", hostName: "Rohit", users: 8, mode: "Discussion", isActive: true },
    { id: "3", name: "UI/UX Feedback", hostId: "system", hostName: "Ananya", users: 5, mode: "Video", isActive: true }
];

export function StudyRoomList() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<StudyRoomWithUserState[]>([]);
    const [userJoinedRooms, setUserJoinedRooms] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoom, setNewRoom] = useState<{ name: string; mode: StudyRoom["mode"] }>({ name: "", mode: "Silent" });
    const [isCreating, setIsCreating] = useState(false);

    // Load rooms
    useEffect(() => {
        const unsubscribe = subscribeToStudyRooms((data) => {
            if (data.length === 0) {
                // Use default rooms if none in DB
                setRooms(DEFAULT_ROOMS.map(r => ({ ...r, isJoined: false })));
            } else {
                setRooms(data.map(r => ({ ...r, isJoined: false })));
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load user's joined rooms
    useEffect(() => {
        if (!user) return;

        getUserJoinedRooms(user.uid).then(joined => {
            setUserJoinedRooms(joined);
        });
    }, [user]);

    // Merge user joined state with rooms
    useEffect(() => {
        setRooms(prev => prev.map(r => ({
            ...r,
            isJoined: userJoinedRooms.includes(r.id)
        })));
    }, [userJoinedRooms]);

    const getModeIcon = (mode: StudyRoom["mode"]) => {
        switch (mode) {
            case "Silent": return <MicOff size={14} className="text-charcoal/20 dark:text-white/20" />;
            case "Discussion": return <Mic size={14} className="text-gold" />;
            case "Video": return <Video size={14} className="text-sage" />;
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        if (!user) return;

        const hasJoined = userJoinedRooms.includes(roomId);

        // Optimistic update
        if (hasJoined) {
            setUserJoinedRooms(prev => prev.filter(id => id !== roomId));
            setRooms(prev => prev.map(r =>
                r.id === roomId ? { ...r, isJoined: false, users: Math.max(0, r.users - 1) } : r
            ));
        } else {
            setUserJoinedRooms(prev => [...prev, roomId]);
            setRooms(prev => prev.map(r =>
                r.id === roomId ? { ...r, isJoined: true, users: r.users + 1 } : r
            ));
        }

        // Update in Firebase
        try {
            await updateStudyRoomUsers(roomId, hasJoined ? -1 : 1);
            if (hasJoined) {
                await deleteUserRoomJoin(user.uid, roomId);
            } else {
                await saveUserRoomJoin(user.uid, roomId);
            }
        } catch (error) {
            console.error("Failed to update room join status:", error);
            // Revert on error
            if (hasJoined) {
                setUserJoinedRooms(prev => [...prev, roomId]);
            } else {
                setUserJoinedRooms(prev => prev.filter(id => id !== roomId));
            }
        }
    };

    const handleCreateRoom = async () => {
        if (!newRoom.name || !user) return;

        setIsCreating(true);
        try {
            const room: StudyRoom = {
                id: crypto.randomUUID(),
                name: newRoom.name,
                hostId: user.uid,
                hostName: user.displayName || user.email?.split("@")[0] || "You",
                users: 1,
                mode: newRoom.mode,
                isActive: true
            };

            await saveStudyRoom(room);
            await saveUserRoomJoin(user.uid, room.id);

            setShowCreateModal(false);
            setNewRoom({ name: "", mode: "Silent" });
        } catch (error) {
            console.error("Failed to create room:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <div className="glass-card p-6 bg-white/40 h-full flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-playfair text-xl text-charcoal dark:text-white">Study Rooms</h3>
                        <p className="text-xs text-charcoal/40 dark:text-white/40 mt-1">Real-time collaborative nodes</p>
                    </div>
                    <div className="p-2 bg-charcoal/5 dark:bg-white/5 rounded-full">
                        <UsersIcon size={18} className="text-charcoal/60 dark:text-white/60" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 flex-1">
                        <Loader2 size={24} className="animate-spin text-gold" />
                    </div>
                ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        {rooms.map((room) => (
                            <div key={room.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-charcoal/5 dark:border-white/5 group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-background dark:bg-white/5 flex items-center justify-center text-charcoal/30">
                                        {getModeIcon(room.mode)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-charcoal dark:text-white">{room.name}</h4>
                                        <p className="text-[10px] text-charcoal/40 dark:text-white/40 font-medium">
                                            Host: <span className="text-gold">{room.hostName}</span> • {room.users} active
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
                )}

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
                    <div className="bg-white dark:bg-charcoal rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 dark:border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-playfair text-xl text-charcoal dark:text-white">Create Study Room</h3>
                                <p className="text-xs text-charcoal/40 dark:text-white/40 mt-1">Start a collaborative session</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-charcoal/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-charcoal dark:text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Room Name</label>
                                <input
                                    type="text"
                                    value={newRoom.name}
                                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                    placeholder="e.g. Math Study Group"
                                    className="w-full mt-2 p-3 bg-background/50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">Room Mode</label>
                                <div className="flex gap-2 mt-2">
                                    {(["Silent", "Discussion", "Video"] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setNewRoom({ ...newRoom, mode })}
                                            className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${newRoom.mode === mode
                                                    ? "bg-sage/20 border-2 border-sage"
                                                    : "bg-charcoal/5 dark:bg-white/5 border-2 border-transparent hover:bg-charcoal/10 dark:hover:bg-white/10"
                                                }`}
                                        >
                                            {getModeIcon(mode)}
                                            <span className="text-[10px] font-bold uppercase text-charcoal dark:text-white">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-charcoal/10 dark:border-white/10 flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 dark:text-white/60 hover:bg-charcoal/5 dark:hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                disabled={!newRoom.name || isCreating}
                                className="flex-1 gold-button bg-sage hover:bg-sage/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating && <Loader2 size={16} className="animate-spin" />}
                                Create Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
