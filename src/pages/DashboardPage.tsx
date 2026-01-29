import { DashboardLayout } from "../components/layout/DashboardLayout";
import { AttendancePulse } from "../components/dashboard/AttendancePulse";
import { PriorityMatrix } from "../components/dashboard/PriorityMatrix";
import { AnalyticalCorner } from "../components/dashboard/AnalyticalCorner";

export function DashboardPage() {
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

                {/* Priority Matrix - Spans 1 column but could be larger in different layouts */}
                <div className="lg:col-span-1">
                    <PriorityMatrix />
                </div>
            </div>

            {/* Placeholder for Assignment Tracker / Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 bg-white/40 border-charcoal/5">
                    <h3 className="font-playfair text-xl text-charcoal mb-4">Assessment Tracker</h3>
                    <div className="flex flex-col gap-4">
                        <p className="text-xs text-charcoal/40 italic">Coming soon: Automated submission tracking.</p>
                        <div className="h-2 w-full bg-charcoal/5 rounded-full overflow-hidden">
                            <div className="h-full bg-sage w-1/3" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 bg-white/40 border-charcoal/5">
                    <h3 className="font-playfair text-xl text-charcoal mb-4">Community opportunities</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-sage/5 border border-sage/10">
                            <span className="text-xs font-medium text-charcoal">Designathon 2026</span>
                            <button className="text-[10px] font-bold text-sage">Join Room</button>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gold/5 border border-gold/10">
                            <span className="text-xs font-medium text-charcoal">AI Seminar - Alumni Help</span>
                            <button className="text-[10px] font-bold text-gold">Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
