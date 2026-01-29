import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon } from "lucide-react";

export function TimelinePage() {
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
                            <button className="p-2 hover:bg-charcoal/5 rounded-xl transition-all"><ChevronLeft size={16} /></button>
                            <span className="text-xs font-bold px-4">January 2026</span>
                            <button className="p-2 hover:bg-charcoal/5 rounded-xl transition-all"><ChevronRight size={16} /></button>
                        </div>
                        <button className="gold-button flex items-center gap-2 text-xs">
                            <Plus size={14} /> Add Event
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
                    {/* Calendar Grid Placeholder */}
                    <div className="lg:col-span-3 glass-card p-4 bg-white/40 h-full overflow-hidden flex flex-col">
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 text-center py-2">{day}</div>
                            ))}
                        </div>
                        <div className="flex-1 grid grid-cols-7 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                            {Array.from({ length: 31 }).map((_, i) => (
                                <div key={i} className={`
                                    min-h-[100px] p-3 rounded-2xl border transition-all duration-300 group cursor-pointer
                                    ${i === 28 ? "bg-gold/10 border-gold/30 shadow-sm" : "bg-white/40 border-charcoal/5 hover:border-gold/20"}
                               `}>
                                    <span className={`text-xs font-bold ${i === 28 ? "text-gold" : "text-charcoal/40"}`}>{i + 1}</span>
                                    {i === 28 && (
                                        <div className="mt-2 space-y-1">
                                            <div className="text-[9px] bg-gold text-white px-2 py-0.5 rounded-full font-bold">Exam Day</div>
                                            <div className="text-[8px] text-charcoal/60 truncate">Physics Final</div>
                                        </div>
                                    )}
                                    {i === 15 && (
                                        <div className="mt-2 text-[9px] bg-sage/20 text-sage px-2 py-0.5 rounded-full font-bold">Lab Submission</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Up Next Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 bg-white/60">
                            <h4 className="font-playfair text-lg text-charcoal mb-4">Immediate Agenda</h4>
                            <div className="space-y-4">
                                <AgendaItem
                                    time="10:00 AM"
                                    title="Advanced Quantum Mechanics"
                                    room="Lab v3-04"
                                    color="border-sage"
                                />
                                <AgendaItem
                                    time="01:30 PM"
                                    title="Design Ethics Seminar"
                                    room="Hall of Alumni"
                                    color="border-gold"
                                />
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
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AgendaItem({ time, title, room, color }: { time: string, title: string, room: string, color: string }) {
    return (
        <div className={`p-4 rounded-2xl bg-white border-l-4 ${color} shadow-sm group hover:scale-[1.02] transition-all cursor-pointer`}>
            <p className="text-[10px] font-bold text-charcoal/40 mb-1">{time}</p>
            <h5 className="text-sm font-semibold text-charcoal mb-2">{title}</h5>
            <div className="flex items-center gap-1.5 text-[9px] text-charcoal/60">
                <MapPin size={10} />
                {room}
            </div>
        </div>
    );
}
