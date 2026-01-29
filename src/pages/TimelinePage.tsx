import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon, X, Clock, Tag } from "lucide-react";

interface CalendarEvent {
    id: string;
    title: string;
    type: "exam" | "submission" | "class" | "event";
    date: number; // Day of month
    time?: string;
    location?: string;
}

const EVENT_COLORS = {
    exam: { bg: "bg-gold", text: "text-white" },
    submission: { bg: "bg-sage/20", text: "text-sage" },
    class: { bg: "bg-charcoal/10", text: "text-charcoal" },
    event: { bg: "bg-blue-100", text: "text-blue-600" }
};

export function TimelinePage() {
    const [currentMonth, setCurrentMonth] = useState(0); // January 2026
    const [currentYear, setCurrentYear] = useState(2026);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const [events, setEvents] = useState<CalendarEvent[]>([
        { id: "1", title: "Physics Final", type: "exam", date: 29, time: "10:00 AM", location: "Hall A" },
        { id: "2", title: "Lab Submission", type: "submission", date: 16 },
        { id: "3", title: "Math Quiz", type: "exam", date: 22, time: "2:00 PM" },
        { id: "4", title: "Design Ethics Seminar", type: "event", date: 10, time: "1:30 PM", location: "Hall of Alumni" }
    ]);

    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        type: "class"
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday-first format
    };

    const navigateMonth = (direction: number) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const getEventsForDay = (day: number) => {
        return events.filter(e => e.date === day);
    };

    const handleAddEvent = () => {
        if (!newEvent.title || !selectedDay) return;

        const event: CalendarEvent = {
            id: crypto.randomUUID(),
            title: newEvent.title,
            type: newEvent.type || "class",
            date: selectedDay,
            time: newEvent.time,
            location: newEvent.location
        };

        setEvents([...events, event]);
        setShowAddModal(false);
        setNewEvent({ type: "class" });
        setSelectedDay(null);
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(events.filter(e => e.id !== eventId));
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    // Get upcoming events
    const upcomingEvents = events
        .filter(e => e.date >= (isCurrentMonth ? today.getDate() : 1))
        .sort((a, b) => a.date - b.date)
        .slice(0, 3);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-playfair text-3xl text-charcoal tracking-tight">Academic Timeline</h3>
                        <p className="text-sm text-charcoal/40 mt-1">Refined schedule management</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-white/60 p-1.5 rounded-2xl border border-charcoal/5">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold px-4">{months[currentMonth]} {currentYear}</span>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedDay(today.getDate());
                                setShowAddModal(true);
                            }}
                            className="gold-button flex items-center gap-2 text-xs"
                        >
                            <Plus size={14} /> Add Event
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-3 glass-card p-4 bg-white/40 h-full overflow-hidden flex flex-col">
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 text-center py-2">{day}</div>
                            ))}
                        </div>
                        <div className="flex-1 grid grid-cols-7 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                            {/* Empty cells for days before the 1st */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[100px] p-3 rounded-2xl bg-charcoal/2" />
                            ))}

                            {/* Actual days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayEvents = getEventsForDay(day);
                                const isToday = isCurrentMonth && day === today.getDate();
                                const hasEvents = dayEvents.length > 0;

                                return (
                                    <div
                                        key={day}
                                        onClick={() => {
                                            setSelectedDay(day);
                                            if (dayEvents.length === 0) {
                                                setShowAddModal(true);
                                            }
                                        }}
                                        className={`
                                            min-h-[100px] p-3 rounded-2xl border transition-all duration-300 group cursor-pointer
                                            ${isToday
                                                ? "bg-gold/10 border-gold/30 shadow-sm"
                                                : hasEvents
                                                    ? "bg-white/60 border-charcoal/10 hover:border-gold/30"
                                                    : "bg-white/40 border-charcoal/5 hover:border-gold/20"
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-xs font-bold ${isToday ? "text-gold" : "text-charcoal/40"}`}>
                                                {day}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDay(day);
                                                    setShowAddModal(true);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            {dayEvents.slice(0, 2).map(event => {
                                                const colors = EVENT_COLORS[event.type];
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`text-[9px] ${colors.bg} ${colors.text} px-2 py-0.5 rounded-full font-bold truncate`}
                                                    >
                                                        {event.title}
                                                    </div>
                                                );
                                            })}
                                            {dayEvents.length > 2 && (
                                                <div className="text-[8px] text-charcoal/40">+{dayEvents.length - 2} more</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Up Next Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 bg-white/60">
                            <h4 className="font-playfair text-lg text-charcoal mb-4">Immediate Agenda</h4>
                            <div className="space-y-4">
                                {upcomingEvents.length > 0 ? (
                                    upcomingEvents.map(event => (
                                        <AgendaItem
                                            key={event.id}
                                            time={event.time || `Day ${event.date}`}
                                            title={event.title}
                                            room={event.location || "No location"}
                                            color={`border-${event.type === "exam" ? "gold" : event.type === "submission" ? "sage" : "charcoal/30"}`}
                                            onDelete={() => handleDeleteEvent(event.id)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-xs text-charcoal/40 italic">No upcoming events</p>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 bg-sage text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CalendarIcon size={80} />
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Notice</h4>
                            <p className="text-[11px] leading-relaxed opacity-80">
                                The VC-V3 Lab will be closed for maintenance this Sunday. Please plan accordingly.
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="glass-card p-4 bg-white/40">
                            <h4 className="text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-3">Legend</h4>
                            <div className="space-y-2">
                                {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                                        <span className="text-[10px] text-charcoal/60 capitalize">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-playfair text-xl text-charcoal">Add Event</h3>
                                <p className="text-xs text-charcoal/40 mt-1">
                                    {months[currentMonth]} {selectedDay}, {currentYear}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewEvent({ type: "class" });
                                }}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title || ""}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Event title..."
                                    className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Type</label>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {(["class", "exam", "submission", "event"] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewEvent({ ...newEvent, type })}
                                            className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${newEvent.type === type
                                                    ? `${EVENT_COLORS[type].bg} ${EVENT_COLORS[type].text}`
                                                    : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={12} /> Time
                                    </label>
                                    <input
                                        type="text"
                                        value={newEvent.time || ""}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        placeholder="e.g. 10:00 AM"
                                        className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider flex items-center gap-1">
                                        <MapPin size={12} /> Location
                                    </label>
                                    <input
                                        type="text"
                                        value={newEvent.location || ""}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        placeholder="e.g. Hall A"
                                        className="w-full mt-2 p-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-charcoal/10 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewEvent({ type: "class" });
                                }}
                                className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 hover:bg-charcoal/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEvent}
                                disabled={!newEvent.title}
                                className="flex-1 gold-button disabled:opacity-50"
                            >
                                Add Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function AgendaItem({
    time,
    title,
    room,
    color,
    onDelete
}: {
    time: string;
    title: string;
    room: string;
    color: string;
    onDelete: () => void;
}) {
    return (
        <div className={`p-4 rounded-2xl bg-white border-l-4 ${color} shadow-sm group hover:scale-[1.02] transition-all`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-charcoal/40 mb-1">{time}</p>
                    <h5 className="text-sm font-semibold text-charcoal mb-2">{title}</h5>
                    <div className="flex items-center gap-1.5 text-[9px] text-charcoal/60">
                        <MapPin size={10} />
                        {room}
                    </div>
                </div>
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg text-charcoal/30 hover:text-red-500 transition-all"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
