import { Calendar, Users, Briefcase, GraduationCap } from "lucide-react";

export function OpportunityFeed() {
    const opportunities = [
        { title: "Designathon 2026", type: "Hackathon", date: "Feb 15", color: "text-sage bg-sage/10", icon: <Briefcase size={14} /> },
        { title: "MNC Internship - UI/UX", type: "Career", date: "Apply by Mar 1", color: "text-gold bg-gold/10", icon: <GraduationCap size={14} /> },
        { title: "National Debate Open", type: "Seminar", date: "Feb 10", color: "text-charcoal/60 bg-charcoal/5", icon: <Calendar size={14} /> },
    ];

    return (
        <div className="glass-card p-6 bg-white/40 h-full flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="font-playfair text-xl text-charcoal">Opportunities Feed</h3>
                    <p className="text-xs text-charcoal/40 mt-1">Refined career & event picks</p>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {opportunities.map((opp, i) => (
                    <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl bg-white/60 border border-charcoal/5 hover:border-gold/20 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${opp.color} flex items-center gap-1.5`}>
                                {opp.icon}
                                {opp.type}
                            </div>
                            <span className="text-[10px] text-charcoal/40 font-medium">{opp.date}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-charcoal group-hover:text-gold transition-colors">{opp.title}</h4>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="w-5 h-5 rounded-full border-2 border-white bg-beige/40" />
                            ))}
                            <span className="text-[9px] text-charcoal/40 ml-3 flex items-center">+12 interested</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="gold-button mt-6 w-full text-xs py-3">
                View All Opportunities
            </button>
        </div>
    );
}
