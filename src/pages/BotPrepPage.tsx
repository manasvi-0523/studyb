import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Sparkles, Search, MessageSquare, Brain, FileText, ChevronRight, X, Check, RefreshCw, Loader2, Send, Bot } from "lucide-react";
import { useState } from "react";
import { generateQuiz, generateFlashcards, generateMindMap, type MindMapNode, type MindMapResponse } from "../lib/ai/groqClient";
import type { DrillQuestion, Flashcard, SubjectKey } from "../types";

type GenerationMode = "idle" | "quiz" | "flashcards" | "mindmap";
type ViewMode = "input" | "quiz-results" | "flashcard-results" | "mindmap-results";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function BotPrepPage() {
    const [prompt, setPrompt] = useState("");
    const [subject, setSubject] = useState<SubjectKey>("other");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("input");

    // Results state
    const [quizQuestions, setQuizQuestions] = useState<DrillQuestion[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [mindMap, setMindMap] = useState<MindMapResponse | null>(null);

    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [showExplanation, setShowExplanation] = useState(false);

    // Flashcard state
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // AI Intervention chat state
    const [showIntervention, setShowIntervention] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: "1", role: "assistant", content: "Hello! I'm your AI Mentor. I can help you with administrative queries, academic guidance, and study strategies. How can I assist you today?" }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    // FAQ state
    const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
    const [faqSearch, setFaqSearch] = useState("");

    const handleGenerate = async (mode: GenerationMode) => {
        if (!prompt.trim()) {
            setError("Please enter some study material first.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            switch (mode) {
                case "quiz":
                    const questions = await generateQuiz(prompt, subject, 5);
                    setQuizQuestions(questions);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    setShowExplanation(false);
                    setViewMode("quiz-results");
                    break;
                case "flashcards":
                    const cards = await generateFlashcards(prompt, subject, 10);
                    setFlashcards(cards);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setViewMode("flashcard-results");
                    break;
                case "mindmap":
                    const map = await generateMindMap(prompt, subject);
                    setMindMap(map);
                    setViewMode("mindmap-results");
                    break;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate content. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetToInput = () => {
        setViewMode("input");
        setError(null);
    };

    // AI Chat handler
    const handleSendChat = async () => {
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: chatInput.trim()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setChatInput("");
        setIsChatLoading(true);

        // Simulate AI response (in production, use Groq API)
        setTimeout(() => {
            const responses = [
                "I understand your concern. For late submissions, you can apply through the student portal under 'Academic Requests'. The deadline for appeals is typically 48 hours after the original due date.",
                "Great question! The VC-V3 lab is located in the Engineering Block, 3rd floor, Room 312. It's open from 9 AM to 6 PM on weekdays.",
                "Based on your current study patterns, I recommend focusing on Physics first as it has the highest weightage in your upcoming exams. Try the Pomodoro technique - 25 minutes of focused study followed by 5-minute breaks.",
                "I can see you're making good progress! To maintain your 92% attendance, make sure to attend the next 3 classes. Missing them would drop you to 82.3%.",
                "For the academic calendar 2026, you can download the PDF from the official college portal under 'Resources > Academic Documents'. Shall I explain any specific dates?"
            ];

            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: responses[Math.floor(Math.random() * responses.length)]
            };

            setChatMessages(prev => [...prev, assistantMessage]);
            setIsChatLoading(false);
        }, 1500);
    };

    // FAQ data with answers
    const faqItems = [
        {
            question: "How to apply for late submission?",
            answer: "To apply for late submission, log into the student portal, navigate to 'Academic Requests', and fill out the Late Submission Form. Include a valid reason and any supporting documents. The committee typically responds within 24-48 hours."
        },
        {
            question: "Where is the VC-V3 lab?",
            answer: "The VC-V3 Lab is located in the Engineering Block, 3rd floor, Room 312. Lab hours are 9 AM - 6 PM on weekdays. Note: The lab will be closed this Sunday for maintenance."
        },
        {
            question: "Academic calendar 2026 PDF",
            answer: "The Academic Calendar 2026 is available for download on the college portal under 'Resources > Academic Documents'. Key dates include: Semester Start - Jan 6, Mid-term Break - Mar 15-22, Final Exams - May 10-25."
        }
    ];

    const filteredFAQs = faqItems.filter(faq =>
        faq.question.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Study Bot Suite */}
                <div className="lg:col-span-2 space-y-8">
                    {viewMode === "input" && (
                        <InputView
                            prompt={prompt}
                            setPrompt={setPrompt}
                            subject={subject}
                            setSubject={setSubject}
                            isLoading={isLoading}
                            error={error}
                            onGenerate={handleGenerate}
                        />
                    )}

                    {viewMode === "quiz-results" && (
                        <QuizView
                            questions={quizQuestions}
                            currentIndex={currentQuestionIndex}
                            setCurrentIndex={setCurrentQuestionIndex}
                            selectedAnswers={selectedAnswers}
                            setSelectedAnswers={setSelectedAnswers}
                            showExplanation={showExplanation}
                            setShowExplanation={setShowExplanation}
                            onBack={resetToInput}
                        />
                    )}

                    {viewMode === "flashcard-results" && (
                        <FlashcardView
                            flashcards={flashcards}
                            currentIndex={currentCardIndex}
                            setCurrentIndex={setCurrentCardIndex}
                            isFlipped={isFlipped}
                            setIsFlipped={setIsFlipped}
                            onBack={resetToInput}
                        />
                    )}

                    {viewMode === "mindmap-results" && mindMap && (
                        <MindMapView
                            mindMap={mindMap}
                            onBack={resetToInput}
                        />
                    )}

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
                                value={faqSearch}
                                onChange={(e) => setFaqSearch(e.target.value)}
                                placeholder="Search FAQ / Student Issues..."
                                className="w-full h-12 bg-background/50 border border-charcoal/5 rounded-full pl-12 pr-4 text-xs focus:outline-none focus:border-gold/40 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            {filteredFAQs.map((faq) => (
                                <div
                                    key={faq.question}
                                    onClick={() => setSelectedFAQ(faq.question)}
                                    className="p-3 text-[11px] text-charcoal/60 hover:text-gold hover:bg-gold/5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <span>{faq.question}</span>
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-gold" />
                                </div>
                            ))}
                            {filteredFAQs.length === 0 && (
                                <p className="text-xs text-charcoal/40 text-center py-4">No matching FAQs found</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-charcoal text-white overflow-hidden relative">
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
                        <h4 className="font-playfair text-lg text-gold mb-2 italic">Need Urgent Help?</h4>
                        <p className="text-[10px] text-white/60 mb-6 leading-relaxed">Our AI Mentor is available 24/7 to resolve administrative queries.</p>
                        <button
                            onClick={() => setShowIntervention(true)}
                            className="gold-button w-full border border-gold/20 hover:bg-white hover:text-charcoal bg-transparent text-white"
                        >
                            Start Intervention
                        </button>
                    </div>
                </div>
            </div>

            {/* FAQ Answer Modal */}
            {selectedFAQ && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                            <h3 className="font-playfair text-lg text-charcoal">FAQ Answer</h3>
                            <button
                                onClick={() => setSelectedFAQ(null)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h4 className="text-sm font-bold text-charcoal mb-3">
                                {faqItems.find(f => f.question === selectedFAQ)?.question}
                            </h4>
                            <p className="text-sm text-charcoal/70 leading-relaxed">
                                {faqItems.find(f => f.question === selectedFAQ)?.answer}
                            </p>
                        </div>
                        <div className="p-6 border-t border-charcoal/10">
                            <button
                                onClick={() => {
                                    setShowIntervention(true);
                                    setSelectedFAQ(null);
                                }}
                                className="w-full text-center text-xs text-gold hover:underline"
                            >
                                Need more help? Start AI Intervention →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Intervention Modal */}
            {showIntervention && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-charcoal/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                    <Bot size={20} className="text-gold" />
                                </div>
                                <div>
                                    <h3 className="font-playfair text-xl text-charcoal">AI Mentor</h3>
                                    <p className="text-[10px] text-charcoal/40">24/7 Administrative Support</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIntervention(false)}
                                className="p-2 hover:bg-charcoal/5 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {chatMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl text-sm ${message.role === "user"
                                            ? "bg-gold text-white rounded-br-sm"
                                            : "bg-charcoal/5 text-charcoal rounded-bl-sm"
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-charcoal/5 text-charcoal p-4 rounded-2xl rounded-bl-sm">
                                        <Loader2 size={16} className="animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-charcoal/10">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendChat();
                                        }
                                    }}
                                    placeholder="Ask anything..."
                                    className="flex-1 px-4 py-3 bg-background/50 border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                                />
                                <button
                                    onClick={handleSendChat}
                                    disabled={!chatInput.trim() || isChatLoading}
                                    className="px-4 py-3 bg-gold text-white rounded-xl hover:bg-gold/90 disabled:opacity-50 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// Input View Component
function InputView({
    prompt,
    setPrompt,
    subject,
    setSubject,
    isLoading,
    error,
    onGenerate
}: {
    prompt: string;
    setPrompt: (v: string) => void;
    subject: SubjectKey;
    setSubject: (v: SubjectKey) => void;
    isLoading: boolean;
    error: string | null;
    onGenerate: (mode: GenerationMode) => void;
}) {
    return (
        <div className="glass-card p-10 bg-white/60 border-gold/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-gold/10">
                <Sparkles size={120} />
            </div>

            <div className="relative z-10">
                <h3 className="font-playfair text-3xl text-charcoal mb-2">Study Bot Suite</h3>
                <p className="text-sm text-charcoal/40 mb-6">Refine your study material into cognitive assets.</p>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Subject Selector */}
                    <div className="flex gap-2 flex-wrap">
                        {(["biology", "physics", "chemistry", "maths", "other"] as SubjectKey[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSubject(s)}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all capitalize ${subject === s
                                    ? "bg-charcoal text-white"
                                    : "bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Paste your lecture notes or topic here..."
                            className="w-full h-48 bg-background/50 border border-charcoal/5 rounded-3xl p-6 text-sm focus:outline-none focus:border-gold/40 transition-all resize-none font-inter"
                            disabled={isLoading}
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] text-charcoal/30 font-bold uppercase tracking-widest">
                            AI Processor v2.0
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <BotAction
                            icon={isLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                            label="Gen Quiz"
                            color="bg-sage text-white"
                            onClick={() => onGenerate("quiz")}
                            disabled={isLoading}
                        />
                        <BotAction
                            icon={isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                            label="Flashcards"
                            color="bg-gold text-white"
                            onClick={() => onGenerate("flashcards")}
                            disabled={isLoading}
                        />
                        <BotAction
                            icon={isLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                            label="Mind Map"
                            color="bg-charcoal text-white"
                            onClick={() => onGenerate("mindmap")}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Quiz View Component
function QuizView({
    questions,
    currentIndex,
    setCurrentIndex,
    selectedAnswers,
    setSelectedAnswers,
    showExplanation,
    setShowExplanation,
    onBack
}: {
    questions: DrillQuestion[];
    currentIndex: number;
    setCurrentIndex: (v: number) => void;
    selectedAnswers: Record<string, string>;
    setSelectedAnswers: (v: Record<string, string>) => void;
    showExplanation: boolean;
    setShowExplanation: (v: boolean) => void;
    onBack: () => void;
}) {
    const currentQuestion = questions[currentIndex];
    const isAnswered = selectedAnswers[currentQuestion?.id] !== undefined;
    const isCorrect = selectedAnswers[currentQuestion?.id] === currentQuestion?.correctOptionId;

    const handleSelectAnswer = (optionId: string) => {
        if (isAnswered) return;
        setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: optionId });
        setShowExplanation(true);
    };

    const getScore = () => {
        let correct = 0;
        questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correctOptionId) correct++;
        });
        return correct;
    };

    if (!currentQuestion) {
        return (
            <div className="glass-card p-10 bg-white/60 text-center">
                <h3 className="font-playfair text-2xl text-charcoal mb-4">Quiz Complete!</h3>
                <p className="text-lg text-charcoal/60 mb-6">Your Score: {getScore()} / {questions.length}</p>
                <button onClick={onBack} className="gold-button">Generate New Content</button>
            </div>
        );
    }

    return (
        <div className="glass-card p-10 bg-white/60 border-gold/10 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors">
                    <X size={18} /> Back
                </button>
                <span className="text-sm font-medium text-charcoal/60">
                    Question {currentIndex + 1} of {questions.length}
                </span>
            </div>

            <div className="mb-8">
                <h3 className="font-playfair text-xl text-charcoal mb-6">{currentQuestion.question}</h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                        const isCorrectOption = option.id === currentQuestion.correctOptionId;

                        let optionClass = "border-charcoal/10 hover:border-gold/40 bg-white/60";
                        if (isAnswered) {
                            if (isCorrectOption) {
                                optionClass = "border-green-500 bg-green-50";
                            } else if (isSelected && !isCorrectOption) {
                                optionClass = "border-red-500 bg-red-50";
                            }
                        } else if (isSelected) {
                            optionClass = "border-gold bg-gold/10";
                        }

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelectAnswer(option.id)}
                                disabled={isAnswered}
                                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${optionClass}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-xs font-bold uppercase">
                                        {option.id}
                                    </span>
                                    <span className="text-sm text-charcoal">{option.text}</span>
                                    {isAnswered && isCorrectOption && (
                                        <Check size={18} className="ml-auto text-green-500" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showExplanation && (
                <div className={`p-4 rounded-2xl mb-6 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                    <p className="text-sm font-medium text-charcoal mb-2">
                        {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                    </p>
                    <p className="text-xs text-charcoal/70">{currentQuestion.explanation}</p>
                </div>
            )}

            <div className="flex justify-between">
                <button
                    onClick={() => {
                        setCurrentIndex(Math.max(0, currentIndex - 1));
                        setShowExplanation(false);
                    }}
                    disabled={currentIndex === 0}
                    className="px-6 py-2 rounded-full text-sm font-medium text-charcoal/60 hover:text-charcoal disabled:opacity-30 transition-all"
                >
                    Previous
                </button>
                <button
                    onClick={() => {
                        if (currentIndex < questions.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setShowExplanation(false);
                        } else {
                            setCurrentIndex(questions.length); // Show completion screen
                        }
                    }}
                    className="gold-button"
                >
                    {currentIndex === questions.length - 1 ? "Finish" : "Next"}
                </button>
            </div>
        </div>
    );
}

// Flashcard View Component
function FlashcardView({
    flashcards,
    currentIndex,
    setCurrentIndex,
    isFlipped,
    setIsFlipped,
    onBack
}: {
    flashcards: Flashcard[];
    currentIndex: number;
    setCurrentIndex: (v: number) => void;
    isFlipped: boolean;
    setIsFlipped: (v: boolean) => void;
    onBack: () => void;
}) {
    const currentCard = flashcards[currentIndex];

    if (!currentCard) {
        return (
            <div className="glass-card p-10 bg-white/60 text-center">
                <h3 className="font-playfair text-2xl text-charcoal mb-4">All Cards Reviewed!</h3>
                <button onClick={onBack} className="gold-button">Generate New Content</button>
            </div>
        );
    }

    return (
        <div className="glass-card p-10 bg-white/60 border-gold/10">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors">
                    <X size={18} /> Back
                </button>
                <span className="text-sm font-medium text-charcoal/60">
                    Card {currentIndex + 1} of {flashcards.length}
                </span>
            </div>

            {/* Flashcard */}
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[280px] bg-gradient-to-br from-gold/10 to-sage/10 rounded-3xl p-8 flex items-center justify-center cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group"
            >
                <div className="absolute top-4 right-4 text-[10px] text-charcoal/30 uppercase tracking-widest font-bold">
                    {isFlipped ? "Answer" : "Question"} • Click to flip
                </div>

                <div className="text-center">
                    <p className="text-lg font-medium text-charcoal leading-relaxed">
                        {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                </div>

                <RefreshCw size={20} className="absolute bottom-4 right-4 text-charcoal/20 group-hover:text-charcoal/40 transition-colors" />
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => {
                        setCurrentIndex(Math.max(0, currentIndex - 1));
                        setIsFlipped(false);
                    }}
                    disabled={currentIndex === 0}
                    className="px-6 py-2 rounded-full text-sm font-medium text-charcoal/60 hover:text-charcoal disabled:opacity-30 transition-all"
                >
                    Previous
                </button>
                <button
                    onClick={() => {
                        if (currentIndex < flashcards.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setIsFlipped(false);
                        } else {
                            setCurrentIndex(flashcards.length);
                        }
                    }}
                    className="gold-button"
                >
                    {currentIndex === flashcards.length - 1 ? "Finish" : "Next"}
                </button>
            </div>
        </div>
    );
}

// Mind Map View Component
function MindMapView({
    mindMap,
    onBack
}: {
    mindMap: MindMapResponse;
    onBack: () => void;
}) {
    return (
        <div className="glass-card p-10 bg-white/60 border-gold/10">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors">
                    <X size={18} /> Back
                </button>
            </div>

            <h3 className="font-playfair text-2xl text-charcoal mb-6 text-center">{mindMap.title}</h3>

            <div className="space-y-4">
                {mindMap.nodes.map((node) => (
                    <MindMapNodeComponent key={node.id} node={node} level={0} />
                ))}
            </div>
        </div>
    );
}

function MindMapNodeComponent({ node, level }: { node: MindMapNode; level: number }) {
    const colors = ["bg-sage/20 border-sage/40", "bg-gold/20 border-gold/40", "bg-charcoal/10 border-charcoal/20"];
    const colorClass = colors[level % colors.length];

    return (
        <div className={`ml-${level * 4}`} style={{ marginLeft: level * 24 }}>
            <div className={`p-4 rounded-2xl border ${colorClass} mb-2`}>
                <span className="text-sm font-medium text-charcoal">{node.label}</span>
            </div>
            {node.children && node.children.map((child) => (
                <MindMapNodeComponent key={child.id} node={child} level={level + 1} />
            ))}
        </div>
    );
}

function BotAction({ icon, label, color, onClick, disabled }: { icon: any, label: string, color: string, onClick?: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${color} p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/5 disabled:opacity-50 disabled:hover:scale-100`}
        >
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
