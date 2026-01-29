import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { AttendancePulse } from "../components/dashboard/AttendancePulse";
import { PriorityMatrix } from "../components/dashboard/PriorityMatrix";
import { AnalyticalCorner } from "../components/dashboard/AnalyticalCorner";
import { X, ExternalLink, Calendar, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommunityEvent {
    id: string;
    title: string;
    type: string;
    date: string;
    color: string;
}

export function DashboardPage() {
    const navigate = useNavigate();
    const [showEventModal, setShowEventModal] = useState<CommunityEvent | null>(null);

    const communityEvents: CommunityEvent[] = [
        { id: "1", title: "Designathon 2026", type: "Hackathon", date: "Feb 15", color: "sage" },
        { id: "2", title: "AI Seminar - Alumni Help", type: "Seminar", date: "Feb 20", color: "gold" }
    ];

    const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

    const handleRegister = (eventId: string) => {
        if (registeredEvents.includes(eventId)) {
            setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
        } else {
            setRegisteredEvents([...registeredEvents, eventId]);
        }
    };

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Pulse - Highlighted Column */}
                <div className="lg:col-span-1">
                    <AttendancePulse />
                </div>

                {/* Analytical Corner */}
                <div className="lg:col-span-1">
                    <AnalyticalCorner />
                </div>

                {/* Priority Matrix */}
                <div className="lg:col-span-1">
                    <PriorityMatrix />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assessment Tracker */}
                <div className="glass-card p-8 bg-white/40 border-charcoal/5">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-playfair text-xl text-charcoal">Assessment Tracker</h3>
                        <button
                            onClick={() => navigate("/timeline")}
                            className="text-[10px] font-bold text-gold hover:text-charcoal transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="space-y-3">
                            <AssessmentItem
                                title="Physics Lab Report"
                                dueDate="Jan 30"
                                status="pending"
                                progress={65}
                            />
                            <AssessmentItem
                                title="Math Assignment 3"
                                dueDate="Feb 2"
                                status="in-progress"
                                progress={40}
                            />
                            <AssessmentItem
                                title="Chemistry Quiz Prep"
                                dueDate="Feb 5"
                                status="not-started"
                                progress={0}
                            />
                        </div>
                        <div className="pt-4 border-t border-charcoal/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-charcoal/40">Overall Progress</span>
                                <span className="font-bold text-charcoal">35%</span>
                            </div>
                            <div className="h-2 w-full bg-charcoal/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: "35%" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community Opportunities */}
                <div className="glass-card p-8 bg-white/40 border-charcoal/5">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-playfair text-xl text-charcoal">Community Opportunities</h3>
                        <button
                            onClick={() => navigate("/community")}
                            className="text-[10px] font-bold text-gold hover:text-charcoal transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                            Explore <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {communityEvents.map(event => {
                            const isRegistered = registeredEvents.includes(event.id);
                            return (
                                <div
                                    key={event.id}
                                    className={`flex justify-between items-center p-4 rounded-xl bg-${event.color}/5 border border-${event.color}/10 hover:bg-${event.color}/10 transition-all cursor-pointer group`}
                                    onClick={() => setShowEventModal(event)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-${event.color}/20 flex items-center justify-center`}>
                                            {event.type === "Hackathon" ? <Calendar size={18} className={`text-${event.color}`} /> : <Users size={18} className={`text-${event.color}`} />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-charcoal">{event.title}</span>
                                            <p className="text-[10px] text-charcoal/40">{event.date}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRegister(event.id);
                                        }}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${isRegistered
                                                ? `bg-${event.color}/20 text-${event.color}`
                                                : `text-${event.color} hover:bg-${event.color}/10`
                                            }`}
                                    >
                                        {isRegistered ? "Registered ✓" : event.type === "Hackathon" ? "Join Room" : "Register"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Detail Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                            <div>
                                <span className={`text-[10px] font-bold uppercase text-${showEventModal.color}`}>{showEventModal.type}</span>
                                <h3 className="font-playfair text-xl text-charcoal">{showEventModal.title}</h3>
                                <p className="text-xs text-charcoal/40 mt-1">{showEventModal.date}</p>
                            </div>
                            <button
                                onClick={() => setShowEventModal(null)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-charcoal/70 leading-relaxed">
                                {showEventModal.type === "Hackathon"
                                    ? "Join fellow students in a 48-hour design marathon. Work with industry mentors and build innovative solutions for real-world problems."
                                    : "Learn from our distinguished alumni about the latest developments in AI and get career guidance for breaking into the tech industry."
                                }
                            </p>

                            <div className="mt-4 p-4 bg-charcoal/5 rounded-xl">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-charcoal/60">Participants</span>
                                    <span className="font-bold text-charcoal">42 registered</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-charcoal/10 flex gap-3">
                            <button
                                onClick={() => setShowEventModal(null)}
                                className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 hover:bg-charcoal/5 transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleRegister(showEventModal.id);
                                    setShowEventModal(null);
                                }}
                                className="flex-1 gold-button"
                            >
                                {registeredEvents.includes(showEventModal.id) ? "Cancel Registration" : "Register Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function AssessmentItem({
    title,
    dueDate,
    status,
    progress
}: {
    title: string;
    dueDate: string;
    status: "pending" | "in-progress" | "not-started" | "completed";
    progress: number;
}) {
    const statusColors = {
        "pending": "bg-gold/10 text-gold",
        "in-progress": "bg-sage/10 text-sage",
        "not-started": "bg-charcoal/5 text-charcoal/40",
        "completed": "bg-green-50 text-green-600"
    };

    const statusLabels = {
        "pending": "Due Soon",
        "in-progress": "In Progress",
        "not-started": "Not Started",
        "completed": "Completed"
    };

    return (
        <div className="p-4 bg-white/60 rounded-xl border border-charcoal/5 hover:border-gold/20 transition-all">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-charcoal">{title}</h4>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                    {statusLabels[status]}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-sage rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-[10px] text-charcoal/40">{dueDate}</span>
            </div>
        </div>
    );
}
