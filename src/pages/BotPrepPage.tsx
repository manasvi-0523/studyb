import { DashboardLayout } from "../components/layout/DashboardLayout";
import { FileDropZone } from "../components/common/FileDropZone";
import { Sparkles, Search, MessageSquare, Brain, FileText, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { generateCombatDrills } from "../lib/ai/groqClient";
import { extractTextFromFile, fileToBase64, isImageFile } from "../lib/fileUtils";
import type { DrillQuestion, Flashcard, SubjectKey } from "../types";

const SUBJECTS: { id: SubjectKey; name: string }[] = [
    { id: "biology", name: "Biology" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "maths", name: "Mathematics" },
    { id: "other", name: "Other" }
];

export function BotPrepPage() {
    const [prompt, setPrompt] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<SubjectKey>("other");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<DrillQuestion[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [activeTab, setActiveTab] = useState<"quiz" | "flashcards">("quiz");

    const handleRemoveFile = (index: number) => {
        setUploadedFiles(files => files.filter((_, i) => i !== index));
    };

    const handleGenerate = async (type: "quiz" | "flashcards") => {
        if (!prompt.trim() && uploadedFiles.length === 0) {
            setError("Please enter some text or upload files first.");
            return;
        }

        setLoading(true);
        setError(null);
        setActiveTab(type);

        try {
            let materialText = prompt;
            const images: { inlineData: { data: string; mimeType: string } }[] = [];

            // Process uploaded files
            for (const file of uploadedFiles) {
                if (isImageFile(file)) {
                    const base64 = await fileToBase64(file);
                    images.push({
                        inlineData: {
                            data: base64,
                            mimeType: file.type
                        }
                    });
                } else {
                    const text = await extractTextFromFile(file);
                    materialText += "\n\n" + text;
                }
            }

            const result = await generateCombatDrills({
                materialText,
                subjectId: selectedSubject,
                images: images.length > 0 ? images : undefined
            });

            setQuestions(result.questions);
            setFlashcards(result.flashcards);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to generate content";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {/* Study Bot Suite */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-8">
                    <div className="glass-card p-5 lg:p-10 bg-white/60 border-gold/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 lg:p-8 text-gold/10">
                            <Sparkles size={80} className="lg:w-[120px] lg:h-[120px]" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-playfair text-2xl lg:text-3xl text-charcoal mb-2">Study Bot Suite</h3>
                            <p className="text-xs lg:text-sm text-charcoal/40 mb-6 lg:mb-8">Refine your study material into cognitive assets.</p>

                            <div className="space-y-6">
                                {/* Subject Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2">
                                        Subject
                                    </label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value as SubjectKey)}
                                        className="w-full h-12 bg-background/50 border border-charcoal/5 rounded-2xl px-4 text-sm focus:outline-none focus:border-gold/40 transition-all"
                                    >
                                        {SUBJECTS.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2">
                                        Upload Study Material
                                    </label>
                                    <FileDropZone
                                        files={uploadedFiles}
                                        onFilesSelected={setUploadedFiles}
                                        onRemoveFile={handleRemoveFile}
                                    />
                                </div>

                                {/* Text Input */}
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Or paste your lecture notes or topic here..."
                                        className="w-full h-36 lg:h-48 bg-background/50 border border-charcoal/5 rounded-2xl lg:rounded-3xl p-4 lg:p-6 text-sm focus:outline-none focus:border-gold/40 transition-all resize-none font-inter"
                                    />
                                    <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 text-[8px] lg:text-[10px] text-charcoal/30 font-bold uppercase tracking-widest">
                                        AI Processor v1.0
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                                    <BotAction
                                        icon={<Brain size={18} />}
                                        label="Gen Quiz"
                                        color="bg-sage text-white"
                                        onClick={() => handleGenerate("quiz")}
                                        disabled={loading}
                                        loading={loading && activeTab === "quiz"}
                                    />
                                    <BotAction
                                        icon={<FileText size={18} />}
                                        label="Flashcards"
                                        color="bg-gold text-white"
                                        onClick={() => handleGenerate("flashcards")}
                                        disabled={loading}
                                        loading={loading && activeTab === "flashcards"}
                                    />
                                    <BotAction
                                        icon={<ChevronRight size={18} />}
                                        label="Mind Map"
                                        color="bg-charcoal text-white"
                                        disabled={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generated Content Display */}
                    {(questions.length > 0 || flashcards.length > 0) && (
                        <div className="glass-card p-4 lg:p-8 bg-white/60 border-charcoal/5">
                            <div className="flex gap-2 lg:gap-4 mb-4 lg:mb-6 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab("quiz")}
                                    className={`px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                        activeTab === "quiz"
                                            ? "bg-sage text-white"
                                            : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10"
                                    }`}
                                >
                                    Quiz ({questions.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("flashcards")}
                                    className={`px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                        activeTab === "flashcards"
                                            ? "bg-gold text-white"
                                            : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10"
                                    }`}
                                >
                                    Flashcards ({flashcards.length})
                                </button>
                            </div>

                            {activeTab === "quiz" && questions.length > 0 && (
                                <div className="space-y-6">
                                    {questions.map((q, qIndex) => (
                                        <QuestionCard key={q.id} question={q} index={qIndex} />
                                    ))}
                                </div>
                            )}

                            {activeTab === "flashcards" && flashcards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {flashcards.map((card) => (
                                        <FlashcardDisplay key={card.id} card={card} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Past Sessions */}
                    <div className="glass-card p-4 lg:p-8 bg-white/40 border-charcoal/5">
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
                <div className="lg:col-span-1 space-y-4 lg:space-y-8">
                    <div className="glass-card p-4 lg:p-8 bg-white/60">
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

                    <div className="glass-card p-4 lg:p-8 bg-charcoal text-white overflow-hidden relative">
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

interface BotActionProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

function BotAction({ icon, label, color, onClick, disabled, loading }: BotActionProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${color} p-3 lg:p-4 rounded-2xl lg:rounded-3xl flex flex-col items-center justify-center gap-1 lg:gap-2 transition-all duration-300 shadow-lg shadow-black/5 ${
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95"
            }`}
        >
            {loading ? <Loader2 size={16} className="lg:w-[18px] lg:h-[18px] animate-spin" /> : icon}
            <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-wider">{label}</span>
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

function QuestionCard({ question, index }: { question: DrillQuestion; index: number }) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleOptionClick = (optionId: string) => {
        setSelectedOption(optionId);
        setShowExplanation(true);
    };

    return (
        <div className="p-4 lg:p-6 rounded-2xl bg-white/80 border border-charcoal/5">
            <div className="flex items-start gap-2 lg:gap-3 mb-3 lg:mb-4">
                <span className="w-5 lg:w-6 h-5 lg:h-6 rounded-lg bg-sage/20 text-sage text-[10px] lg:text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                </span>
                <p className="text-xs lg:text-sm text-charcoal font-medium">{question.question}</p>
            </div>

            <div className="space-y-2 ml-7 lg:ml-9">
                {question.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const isCorrect = option.id === question.correctOptionId;
                    const showResult = selectedOption !== null;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={selectedOption !== null}
                            className={`w-full p-3 rounded-xl text-left text-xs transition-all ${
                                showResult
                                    ? isCorrect
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : isSelected
                                            ? "bg-red-50 border-red-200 text-red-700"
                                            : "bg-charcoal/5 text-charcoal/40"
                                    : "bg-charcoal/5 hover:bg-charcoal/10 text-charcoal"
                            } border ${showResult && isCorrect ? "border-green-200" : showResult && isSelected ? "border-red-200" : "border-transparent"}`}
                        >
                            <div className="flex items-center gap-2">
                                {showResult && isCorrect && <CheckCircle size={14} className="text-green-500" />}
                                {option.text}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showExplanation && question.explanation && (
                <div className="mt-3 lg:mt-4 ml-7 lg:ml-9 p-3 rounded-xl bg-gold/10 border border-gold/20 text-[11px] lg:text-xs text-charcoal/80">
                    <span className="font-bold text-gold">Explanation: </span>
                    {question.explanation}
                </div>
            )}
        </div>
    );
}

function FlashcardDisplay({ card }: { card: Flashcard }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            onClick={() => setFlipped(!flipped)}
            className="p-4 lg:p-6 rounded-2xl bg-white/80 border border-charcoal/5 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all min-h-[120px] lg:min-h-[140px] flex flex-col"
        >
            <div className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-gold mb-2">
                {flipped ? "Answer" : "Question"}
            </div>
            <p className="text-xs lg:text-sm text-charcoal flex-1">
                {flipped ? card.back : card.front}
            </p>
            <p className="text-[9px] lg:text-[10px] text-charcoal/30 mt-2 lg:mt-3">
                Tap to {flipped ? "see question" : "reveal answer"}
            </p>
        </div>
    );
}
