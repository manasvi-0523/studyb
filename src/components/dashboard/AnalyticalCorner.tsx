import { useState } from "react";
import { Lightbulb, TrendingUp, AlertCircle, X, FileText, Loader2 } from "lucide-react";

interface Insight {
    id: string;
    type: "action" | "insight" | "alert";
    text: string;
    icon: JSX.Element;
}

export function AnalyticalCorner() {
    const [showReport, setShowReport] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const insights: Insight[] = [
        {
            id: "1",
            type: "action",
            text: "Your marks in Math are dipping; schedule a study session this Friday.",
            icon: <TrendingUp size={16} className="text-sage" />
        },
        {
            id: "2",
            type: "insight",
            text: "Productivity peaks at 10 AM. Move your Lab Prep to that slot.",
            icon: <Lightbulb size={16} className="text-gold" />
        },
        {
            id: "3",
            type: "alert",
            text: "Submission deadline for Physics in 48h. Matrix updated.",
            icon: <AlertCircle size={16} className="text-charcoal/40" />
        }
    ];

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsGenerating(false);
        setShowReport(true);
    };

    return (
        <>
            <div className="glass-card p-8 bg-white/60 h-full border-charcoal/5 flex flex-col gap-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />

                <div>
                    <h3 className="font-playfair text-xl text-charcoal">Analytical Corner</h3>
                    <p className="text-xs text-charcoal/40 mt-1">AI-generated performance insights</p>
                </div>

                <div className="space-y-4 relative z-10">
                    {insights.map((insight) => (
                        <InsightItem
                            key={insight.id}
                            icon={insight.icon}
                            text={insight.text}
                            type={insight.type}
                        />
                    ))}
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="gold-button mt-auto w-full text-xs flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileText size={14} />
                            Generate Full Report
                        </>
                    )}
                </button>
            </div>

            {/* Report Modal */}
            {showReport && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-playfair text-2xl text-charcoal">Performance Report</h3>
                                <p className="text-xs text-charcoal/40 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => setShowReport(false)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Overall Score */}
                            <div className="text-center p-6 bg-gradient-to-br from-sage/10 to-gold/10 rounded-2xl">
                                <div className="text-5xl font-playfair text-charcoal mb-2">87.5</div>
                                <div className="text-xs text-charcoal/60 uppercase tracking-widest">Overall Performance Score</div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <MetricCard label="Attendance" value="92%" trend="+2%" positive />
                                <MetricCard label="Assignments" value="8/10" trend="2 pending" positive={false} />
                                <MetricCard label="Study Hours" value="24h" trend="+5h this week" positive />
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h4 className="font-playfair text-lg text-charcoal mb-4">AI Recommendations</h4>
                                <div className="space-y-3">
                                    <RecommendationItem priority="high" text="Complete Physics lab report before deadline (48h remaining)" />
                                    <RecommendationItem priority="medium" text="Schedule Math revision session for Friday morning" />
                                    <RecommendationItem priority="low" text="Consider joining the Designathon 2026 event" />
                                </div>
                            </div>

                            {/* Subject Breakdown */}
                            <div>
                                <h4 className="font-playfair text-lg text-charcoal mb-4">Subject Performance</h4>
                                <div className="space-y-3">
                                    <SubjectBar subject="Physics" score={85} />
                                    <SubjectBar subject="Mathematics" score={72} />
                                    <SubjectBar subject="Chemistry" score={88} />
                                    <SubjectBar subject="Biology" score={91} />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-charcoal/10">
                            <button
                                onClick={() => setShowReport(false)}
                                className="gold-button w-full"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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

function MetricCard({ label, value, trend, positive }: { label: string; value: string; trend: string; positive: boolean }) {
    return (
        <div className="p-4 bg-white/60 rounded-2xl border border-charcoal/5">
            <div className="text-2xl font-playfair text-charcoal">{value}</div>
            <div className="text-[10px] text-charcoal/40 uppercase tracking-wider mt-1">{label}</div>
            <div className={`text-[10px] mt-2 ${positive ? "text-sage" : "text-gold"}`}>{trend}</div>
        </div>
    );
}

function RecommendationItem({ priority, text }: { priority: "high" | "medium" | "low"; text: string }) {
    const colors = {
        high: "bg-red-50 border-red-200 text-red-600",
        medium: "bg-amber-50 border-amber-200 text-amber-600",
        low: "bg-green-50 border-green-200 text-green-600"
    };

    return (
        <div className={`p-3 rounded-xl border ${colors[priority]} text-xs`}>
            <span className="font-bold uppercase text-[9px] tracking-wider">{priority}</span>
            <p className="mt-1 text-charcoal/80">{text}</p>
        </div>
    );
}

function SubjectBar({ subject, score }: { subject: string; score: number }) {
    const getColor = (score: number) => {
        if (score >= 85) return "bg-sage";
        if (score >= 70) return "bg-gold";
        return "bg-red-400";
    };

    return (
        <div className="flex items-center gap-4">
            <div className="w-24 text-xs text-charcoal/60">{subject}</div>
            <div className="flex-1 h-2 bg-charcoal/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor(score)} rounded-full transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <div className="w-10 text-xs font-medium text-charcoal">{score}%</div>
        </div>
    );
}
