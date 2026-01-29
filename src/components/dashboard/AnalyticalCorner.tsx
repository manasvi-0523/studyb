import { Lightbulb, TrendingUp, AlertCircle } from "lucide-react";

export function AnalyticalCorner() {
    return (
        <div className="glass-card p-8 bg-white/60 h-full border-charcoal/5 flex flex-col gap-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />

            <div>
                <h3 className="font-playfair text-xl text-charcoal">Analytical Corner</h3>
                <p className="text-xs text-charcoal/40 mt-1">AI-generated performance insights</p>
            </div>

            <div className="space-y-4 relative z-10">
                <InsightItem
                    icon={<TrendingUp size={16} className="text-sage" />}
                    text="Your marks in Math are dipping; schedule a study session this Friday."
                    type="Action"
                />
                <InsightItem
                    icon={<Lightbulb size={16} className="text-gold" />}
                    text="Productivity peaks at 10 AM. Move your Lab Prep to that slot."
                    type="Insight"
                />
                <InsightItem
                    icon={<AlertCircle size={16} className="text-charcoal/40" />}
                    text="Submission deadline for Physics in 48h. Matrix updated."
                    type="Alert"
                />
            </div>

            <button className="gold-button mt-auto w-full text-xs">
                Generate Full Report
            </button>
        </div>
    );
}

function InsightItem({ icon, text, type }: { icon: any, text: string, type: string }) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl bg-white/40 border border-charcoal/5 group hover:bg-white/80 transition-all duration-300">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/30">{type}</span>
                <p className="text-[11px] text-charcoal/80 mt-1 leading-relaxed capitalize">{text}</p>
            </div>
        </div>
    );
}
