import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useUserData } from "../hooks/useUserData";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    MapPin,
    Calendar as CalendarIcon,
    Clock,
    Loader2,
    Trash2,
    Edit2,
    Bell
} from "lucide-react";
import { format, parseISO, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import type { CalendarEvent } from "../lib/dataService";
import type { SubjectKey } from "../types";

const EVENT_COLORS = {
    exam: { bg: "bg-gold", text: "text-white", border: "border-gold" },
    assignment: { bg: "bg-sage/20", text: "text-sage", border: "border-sage" },
    event: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-500" },
    reminder: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-500" }
};

const SUBJECT_LABELS: Record<SubjectKey, string> = {
    biology: "Biology",
    physics: "Physics",
    chemistry: "Chemistry",
    maths: "Mathematics",
    other: "Other"
};

export function TimelinePage() {
    const { events, isLoading, addEvent, editEvent, removeEvent } = useUserData();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

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
        const newDate = new Date(currentYear, currentMonth + direction, 1);
        setCurrentDate(newDate);
    };

    const getEventsForDay = (day: number) => {
        const targetDate = new Date(currentYear, currentMonth, day);
        return events.filter(e => {
            const eventDate = parseISO(e.date);
            return isSameDay(eventDate, targetDate);
        });
    };

    const handleAddEvent = async (data: Omit<CalendarEvent, "id" | "createdAt">) => {
        setIsSubmitting(true);
        try {
            await addEvent(data);
            setShowAddModal(false);
            setSelectedDate(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditEvent = async (data: Omit<CalendarEvent, "id" | "createdAt">) => {
        if (!editingEvent) return;
        setIsSubmitting(true);
        try {
            await editEvent(editingEvent.id, data);
            setEditingEvent(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        await removeEvent(eventId);
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = isSameMonth(today, currentDate);

    // Get upcoming events (events from today onwards)
    const upcomingEvents = useMemo(() => {
        const todayStart = startOfDay(today);
        return events
            .filter(e => {
                const eventDate = parseISO(e.date);
                return !isBefore(eventDate, todayStart);
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [events, today]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 lg:gap-8 h-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-playfair text-2xl lg:text-3xl text-charcoal dark:text-white tracking-tight">Academic Timeline</h3>
                        <p className="text-sm text-charcoal/40 dark:text-white/40 mt-1">Manage your schedule</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/60 dark:bg-white/5 p-1.5 rounded-2xl border border-charcoal/5 dark:border-white/10">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 hover:bg-charcoal/5 dark:hover:bg-white/10 rounded-xl transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold px-3">{months[currentMonth]} {currentYear}</span>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 hover:bg-charcoal/5 dark:hover:bg-white/10 rounded-xl transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedDate(today);
                                setShowAddModal(true);
                            }}
                            className="gold-button flex items-center gap-2 text-xs"
                        >
                            <Plus size={14} /> Add Event
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-gold" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 flex-1 overflow-hidden">
                        {/* Calendar Grid */}
                        <div className="lg:col-span-3 glass-card p-4 bg-white/40 dark:bg-white/5 h-full overflow-hidden flex flex-col">
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 dark:text-white/30 text-center py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="flex-1 grid grid-cols-7 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                                {/* Empty cells for days before the 1st */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[80px] lg:min-h-[100px] p-2 rounded-xl bg-charcoal/2 dark:bg-white/2" />
                                ))}

                                {/* Actual days */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const dayDate = new Date(currentYear, currentMonth, day);
                                    const isDayToday = isToday(dayDate);
                                    const isPastDay = isBefore(dayDate, startOfDay(today));
                                    const hasEvents = dayEvents.length > 0;

                                    return (
                                        <div
                                            key={day}
                                            onClick={() => {
                                                setSelectedDate(dayDate);
                                                if (dayEvents.length === 0) {
                                                    setShowAddModal(true);
                                                }
                                            }}
                                            className={`
                                                min-h-[80px] lg:min-h-[100px] p-2 lg:p-3 rounded-xl border transition-all duration-200 group cursor-pointer
                                                ${isDayToday
                                                    ? "bg-gold/10 border-gold/30 shadow-sm"
                                                    : hasEvents
                                                        ? "bg-white/60 dark:bg-white/5 border-charcoal/10 dark:border-white/10 hover:border-gold/30"
                                                        : isPastDay
                                                            ? "bg-charcoal/5 dark:bg-white/2 border-charcoal/5 dark:border-white/5 opacity-60"
                                                            : "bg-white/40 dark:bg-white/3 border-charcoal/5 dark:border-white/5 hover:border-gold/20"
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className={`text-xs font-bold ${isDayToday ? "text-gold" : "text-charcoal/40 dark:text-white/40"}`}>
                                                    {day}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDate(dayDate);
                                                        setShowAddModal(true);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            <div className="mt-1 space-y-1">
                                                {dayEvents.slice(0, 2).map(event => {
                                                    const colors = EVENT_COLORS[event.type];
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingEvent(event);
                                                            }}
                                                            className={`text-[9px] ${colors.bg} ${colors.text} px-2 py-0.5 rounded-full font-bold truncate hover:scale-105 transition-transform cursor-pointer`}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-[8px] text-charcoal/40 dark:text-white/40">+{dayEvents.length - 2} more</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
                            {/* Upcoming Events */}
                            <div className="glass-card p-4 lg:p-6 bg-white/60 dark:bg-white/5">
                                <h4 className="font-playfair text-lg text-charcoal dark:text-white mb-4">Upcoming</h4>
                                <div className="space-y-3">
                                    {upcomingEvents.length > 0 ? (
                                        upcomingEvents.map(event => (
                                            <AgendaItem
                                                key={event.id}
                                                event={event}
                                                onEdit={() => setEditingEvent(event)}
                                                onDelete={() => handleDeleteEvent(event.id)}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-xs text-charcoal/40 dark:text-white/40 italic text-center py-4">
                                            No upcoming events
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="glass-card p-4 bg-white/40 dark:bg-white/5">
                                <h4 className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-widest mb-3">Legend</h4>
                                <div className="space-y-2">
                                    {Object.entries(EVENT_COLORS).map(([type, colors]) => (
                                        <div key={type} className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                                            <span className="text-[10px] text-charcoal/60 dark:text-white/60 capitalize">{type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="glass-card p-4 lg:p-6 bg-sage text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CalendarIcon size={60} />
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Quick Add</h4>
                                <p className="text-[11px] leading-relaxed opacity-80 mb-3">
                                    Click any day on the calendar to quickly add an event.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedDate(today);
                                        setShowAddModal(true);
                                    }}
                                    className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
                                >
                                    Add Today's Event
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Event Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setSelectedDate(null);
                }}
                title="Add Event"
                size="md"
            >
                <EventForm
                    initialDate={selectedDate}
                    onSubmit={handleAddEvent}
                    onCancel={() => {
                        setShowAddModal(false);
                        setSelectedDate(null);
                    }}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Event Modal */}
            <Modal
                isOpen={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                title="Edit Event"
                size="md"
            >
                {editingEvent && (
                    <EventForm
                        initialData={editingEvent}
                        onSubmit={handleEditEvent}
                        onCancel={() => setEditingEvent(null)}
                        isLoading={isSubmitting}
                        onDelete={() => {
                            handleDeleteEvent(editingEvent.id);
                            setEditingEvent(null);
                        }}
                    />
                )}
            </Modal>
        </DashboardLayout>
    );
}

function AgendaItem({
    event,
    onEdit,
    onDelete
}: {
    event: CalendarEvent;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const colors = EVENT_COLORS[event.type];
    const eventDate = parseISO(event.date);

    return (
        <div className={`p-3 rounded-xl bg-white dark:bg-white/5 border-l-4 ${colors.border} shadow-sm group hover:scale-[1.02] transition-all`}>
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-charcoal/40 dark:text-white/40 mb-1">
                        {format(eventDate, "MMM d")} {event.time && `• ${event.time}`}
                    </p>
                    <h5 className="text-sm font-semibold text-charcoal dark:text-white truncate">{event.title}</h5>
                    {event.description && (
                        <p className="text-[10px] text-charcoal/50 dark:text-white/50 mt-1 truncate">{event.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-charcoal/5 dark:hover:bg-white/10 rounded-lg text-charcoal/40 dark:text-white/40 hover:text-charcoal dark:hover:text-white transition-colors"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-charcoal/40 dark:text-white/40 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface EventFormProps {
    initialData?: CalendarEvent;
    initialDate?: Date | null;
    onSubmit: (data: Omit<CalendarEvent, "id" | "createdAt">) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
    isLoading?: boolean;
}

function EventForm({ initialData, initialDate, onSubmit, onCancel, onDelete, isLoading }: EventFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [date, setDate] = useState(
        initialData?.date ||
        (initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"))
    );
    const [time, setTime] = useState(initialData?.time || "");
    const [type, setType] = useState<CalendarEvent["type"]>(initialData?.type || "event");
    const [subjectId, setSubjectId] = useState<SubjectKey | undefined>(initialData?.subjectId);
    const [reminder, setReminder] = useState(initialData?.reminder || false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;

        await onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            date,
            time: time || undefined,
            type,
            subjectId,
            color: EVENT_COLORS[type].bg,
            reminder
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                    Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title..."
                    required
                    className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                    rows={2}
                    className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 resize-none"
                />
            </div>

            {/* Type */}
            <div>
                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                    Type
                </label>
                <div className="flex gap-2 mt-2 flex-wrap">
                    {(["event", "exam", "assignment", "reminder"] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${
                                type === t
                                    ? `${EVENT_COLORS[t].bg} ${EVENT_COLORS[t].text}`
                                    : "bg-charcoal/5 dark:bg-white/10 text-charcoal/60 dark:text-white/60 hover:bg-charcoal/10 dark:hover:bg-white/20"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider flex items-center gap-1">
                        <CalendarIcon size={12} /> Date *
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12} /> Time
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    />
                </div>
            </div>

            {/* Subject (for exams/assignments) */}
            {(type === "exam" || type === "assignment") && (
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                        Subject
                    </label>
                    <select
                        value={subjectId || ""}
                        onChange={(e) => setSubjectId(e.target.value as SubjectKey || undefined)}
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    >
                        <option value="">Select subject...</option>
                        {Object.entries(SUBJECT_LABELS).map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Reminder Toggle */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setReminder(!reminder)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                        reminder ? "bg-gold" : "bg-charcoal/20 dark:bg-white/20"
                    }`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        reminder ? "translate-x-5" : "translate-x-1"
                    }`} />
                </button>
                <label className="text-sm text-charcoal/70 dark:text-white/70 flex items-center gap-2">
                    <Bell size={14} />
                    Send reminder notification
                </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-charcoal/10 dark:border-white/10">
                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="px-4 py-3 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        Delete
                    </button>
                )}
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 dark:text-white/60 hover:bg-charcoal/5 dark:hover:bg-white/10 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !date}
                    className="flex-1 gold-button flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        initialData ? "Update" : "Add Event"
                    )}
                </button>
            </div>
        </form>
    );
}
