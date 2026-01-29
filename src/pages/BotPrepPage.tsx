import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Sparkles, Search, MessageSquare, Brain, FileText, ChevronRight } from "lucide-react";
import { useState } from "react";

export function BotPrepPage() {
    const [prompt, setPrompt] = useState("");

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Study Bot Suite */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-10 bg-white/60 border-gold/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-gold/10">
                            <Sparkles size={120} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-playfair text-3xl text-charcoal mb-2">Study Bot Suite</h3>
                            <p className="text-sm text-charcoal/40 mb-8">Refine your study material into cognitive assets.</p>

                            <div className="space-y-6">
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Paste your lecture notes or topic here..."
                                        className="w-full h-48 bg-background/50 border border-charcoal/5 rounded-3xl p-6 text-sm focus:outline-none focus:border-gold/40 transition-all resize-none font-inter"
                                    />
                                    <div className="absolute bottom-4 right-4 text-[10px] text-charcoal/30 font-bold uppercase tracking-widest">
                                        AI Processor v1.0
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <BotAction icon={<Brain size={18} />} label="Gen Quiz" color="bg-sage text-white" />
                                    <BotAction icon={<FileText size={18} />} label="Flashcards" color="bg-gold text-white" />
                                    <BotAction icon={<ChevronRight size={18} />} label="Mind Map" color="bg-charcoal text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-white/40 border-charcoal/5">
                        <h4 className="font-playfair text-xl text-charcoal mb-4">Past Sessions</h4>
                        <div className="space-y-3">
                            {['Quantum Mechanics Quiz', 'Bio Ethics Flashcards'].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-charcoal/5 hover:bg-white transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare size={14} className="text-charcoal/20 group-hover:text-gold transition-colors" />
                                        <span className="text-xs font-medium text-charcoal">{item}</span>
                                    </div>
                                    <span className="text-[10px] text-charcoal/40">Jan 28</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SOL Corner & Help */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-8 bg-white/60">
                        <h3 className="font-playfair text-xl text-charcoal mb-4">SOL Corner</h3>
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search FAQ / Student Issues..."
                                className="w-full h-12 bg-background/50 border border-charcoal/5 rounded-full pl-12 pr-4 text-xs focus:outline-none focus:border-gold/40 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <FAQItem question="How to apply for late submission?" />
                            <FAQItem question="Where is the VC-V3 lab?" />
                            <FAQItem question="Academic calendar 2026 PDF" />
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-charcoal text-white overflow-hidden relative">
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
                        <h4 className="font-playfair text-lg text-gold mb-2 italic">Need Urgent Help?</h4>
                        <p className="text-[10px] text-white/60 mb-6 leading-relaxed">Our AI Mentor is available 24/7 to resolve administrative queries.</p>
                        <button className="gold-button w-full border border-gold/20 hover:bg-white hover:text-charcoal bg-transparent text-white">Start Intervention</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function BotAction({ icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <button className={`${color} p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/5`}>
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
}

function FAQItem({ question }: { question: string }) {
    return (
        <div className="p-3 text-[11px] text-charcoal/60 hover:text-gold hover:bg-gold/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group">
            <span>{question}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-gold" />
        </div>
    );
}
