import { useState } from "react";

export function AttendancePulse() {
    const [isPresentNext, setIsPresentNext] = useState(true);
    const baseAttendance = 85;
    const projectedAttendance = isPresentNext ? 87.5 : 82.3;

    return (
        <div className="glass-card p-8 flex flex-col items-center justify-between h-full bg-white/60">
            <div className="w-full flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-playfair text-xl text-charcoal">AI Attendance Pulse</h3>
                    <p className="text-xs text-charcoal/40 mt-1">Real-time status tracking</p>
                </div>
                <div className="bg-sage/10 text-sage text-[10px] uppercase tracking-widest px-2 py-1 rounded-md font-bold">
                    Active
                </div>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Simple Radial Chart SVG */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="45"
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent"
                        className="text-beige/30"
                    />
                    <circle
                        cx="50" cy="50" r="45"
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * (isPresentNext ? projectedAttendance : baseAttendance)) / 100}
                        strokeLinecap="round"
                        className="text-sage transition-all duration-1000 ease-in-out"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-playfair text-charcoal">{isPresentNext ? projectedAttendance : baseAttendance}%</span>
                    <span className="text-[10px] text-charcoal/40 uppercase tracking-widest mt-1">Efficiency</span>
                </div>
            </div>

            <div className="w-full mt-8 p-4 bg-background/50 rounded-2xl border border-charcoal/5">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Predictive Toggle</span>
                        <span className="text-xs text-charcoal/80 font-medium mt-0.5">Attend next 3 classes?</span>
                    </div>

                    <button
                        onClick={() => setIsPresentNext(!isPresentNext)}
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isPresentNext ? "bg-sage" : "bg-charcoal/20"}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isPresentNext ? "left-7" : "left-1"}`} />
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-charcoal/5">
                    <p className="text-[10px] text-charcoal/60 leading-relaxed italic">
                        {isPresentNext
                            ? "✓ Projected to increase above 85% threshold. Safe zone confirmed."
                            : "⚠ Skipping will drop you to 82.3%. Critical attendance warning."}
                    </p>
                </div>
            </div>
        </div>
    );
}
