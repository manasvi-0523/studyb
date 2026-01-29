import { useState } from "react";
import { Calendar, Briefcase, GraduationCap, X, ExternalLink, Check } from "lucide-react";

interface Opportunity {
    id: string;
    title: string;
    type: "Hackathon" | "Career" | "Seminar" | "Workshop";
    date: string;
    description?: string;
    link?: string;
    color: string;
    interested: number;
    isInterested: boolean;
}

export function OpportunityFeed() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([
        {
            id: "1",
            title: "Designathon 2026",
            type: "Hackathon",
            date: "Feb 15",
            color: "text-sage bg-sage/10",
            description: "48-hour design marathon with industry mentors. Build innovative solutions for real-world problems.",
            link: "https://designathon2026.com",
            interested: 42,
            isInterested: false
        },
        {
            id: "2",
            title: "MNC Internship - UI/UX",
            type: "Career",
            date: "Apply by Mar 1",
            color: "text-gold bg-gold/10",
            description: "3-month summer internship at a leading tech company. Remote-friendly with mentorship program.",
            interested: 89,
            isInterested: false
        },
        {
            id: "3",
            title: "National Debate Open",
            type: "Seminar",
            date: "Feb 10",
            color: "text-charcoal/60 bg-charcoal/5",
            description: "Annual debate competition with participants from 50+ colleges. Cash prizes worth ₹1L+",
            interested: 28,
            isInterested: false
        },
    ]);

    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

    const getIcon = (type: Opportunity["type"]) => {
        switch (type) {
            case "Hackathon": return <Briefcase size={14} />;
            case "Career": return <GraduationCap size={14} />;
            case "Seminar": return <Calendar size={14} />;
            default: return <Calendar size={14} />;
        }
    };

    const handleInterested = (oppId: string) => {
        setOpportunities(opportunities.map(opp => {
            if (opp.id === oppId) {
                return {
                    ...opp,
                    isInterested: !opp.isInterested,
                    interested: opp.isInterested ? opp.interested - 1 : opp.interested + 1
                };
            }
            return opp;
        }));
    };

    return (
        <>
            <div className="glass-card p-6 bg-white/40 h-full flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-playfair text-xl text-charcoal">Opportunities Feed</h3>
                        <p className="text-xs text-charcoal/40 mt-1">Refined career & event picks</p>
                    </div>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {opportunities.map((opp) => (
                        <div
                            key={opp.id}
                            onClick={() => setSelectedOpportunity(opp)}
                            className="flex flex-col gap-3 p-4 rounded-2xl bg-white/60 border border-charcoal/5 hover:border-gold/20 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${opp.color} flex items-center gap-1.5`}>
                                    {getIcon(opp.type)}
                                    {opp.type}
                                </div>
                                <span className="text-[10px] text-charcoal/40 font-medium">{opp.date}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-charcoal group-hover:text-gold transition-colors">{opp.title}</h4>
                            <div className="flex justify-between items-center">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="w-5 h-5 rounded-full border-2 border-white bg-beige/40" />
                                    ))}
                                    <span className="text-[9px] text-charcoal/40 ml-3 flex items-center">+{opp.interested} interested</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleInterested(opp.id);
                                    }}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${opp.isInterested
                                            ? "bg-gold/20 text-gold"
                                            : "text-charcoal/40 hover:bg-charcoal/5"
                                        }`}
                                >
                                    {opp.isInterested ? "✓ Interested" : "+ Interest"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setSelectedOpportunity(opportunities[0])}
                    className="gold-button mt-6 w-full text-xs py-3"
                >
                    View All Opportunities
                </button>
            </div>

            {/* Opportunity Detail Modal */}
            {selectedOpportunity && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-start">
                            <div>
                                <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${selectedOpportunity.color} items-center gap-1.5 mb-2`}>
                                    {getIcon(selectedOpportunity.type)}
                                    {selectedOpportunity.type}
                                </div>
                                <h3 className="font-playfair text-xl text-charcoal">{selectedOpportunity.title}</h3>
                                <p className="text-xs text-charcoal/40 mt-1">{selectedOpportunity.date}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOpportunity(null)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-charcoal/70 leading-relaxed">
                                {selectedOpportunity.description || "No description available."}
                            </p>

                            <div className="flex items-center gap-4 p-4 bg-charcoal/5 rounded-xl">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4, 5].map(j => (
                                        <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-sage/30" />
                                    ))}
                                </div>
                                <span className="text-xs text-charcoal/60">
                                    <strong>{selectedOpportunity.interested}</strong> students interested
                                </span>
                            </div>
                        </div>

                        <div className="p-6 border-t border-charcoal/10 flex gap-3">
                            <button
                                onClick={() => {
                                    handleInterested(selectedOpportunity.id);
                                    setSelectedOpportunity({
                                        ...selectedOpportunity,
                                        isInterested: !selectedOpportunity.isInterested,
                                        interested: selectedOpportunity.isInterested
                                            ? selectedOpportunity.interested - 1
                                            : selectedOpportunity.interested + 1
                                    });
                                }}
                                className={`flex-1 py-3 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${selectedOpportunity.isInterested
                                        ? "bg-gold/20 text-gold"
                                        : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10"
                                    }`}
                            >
                                {selectedOpportunity.isInterested ? <Check size={16} /> : null}
                                {selectedOpportunity.isInterested ? "Interested" : "Mark as Interested"}
                            </button>
                            {selectedOpportunity.link && (
                                <a
                                    href={selectedOpportunity.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 gold-button flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    Visit Link
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
