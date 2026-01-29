import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useUserData } from "../hooks/useUserData";
import { useSessionStore } from "../state/sessionStore";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { AssessmentForm } from "../components/forms/AssessmentForm";
import {
    Plus,
    Clock,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Trash2,
    Edit2,
    Play,
    Square,
    Loader2,
    Calendar,
    Target,
    TrendingUp
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import type { Assessment } from "../lib/dataService";
import type { SubjectKey } from "../types";

const SUBJECT_COLORS: Record<SubjectKey, string> = {
    biology: "bg-green-500",
    physics: "bg-blue-500",
    chemistry: "bg-purple-500",
    maths: "bg-orange-500",
    other: "bg-gray-500"
};

const SUBJECT_LABELS: Record<SubjectKey, string> = {
    biology: "Biology",
    physics: "Physics",
    chemistry: "Chemistry",
    maths: "Mathematics",
    other: "Other"
};

export function DashboardPage() {
    const {
        assessments,
        stats,
        isLoading,
        addAssessment,
        editAssessment,
        removeAssessment
    } = useUserData();

    const { isGrinding, activeSubject, startGrind, stopGrind, sessions } = useSessionStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<SubjectKey | null>(null);

    const handleAddAssessment = async (data: Omit<Assessment, "id" | "createdAt" | "updatedAt">) => {
        setIsSubmitting(true);
        try {
            await addAssessment(data);
            setShowAddModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditAssessment = async (data: Omit<Assessment, "id" | "createdAt" | "updatedAt">) => {
        if (!editingAssessment) return;
        setIsSubmitting(true);
        try {
            await editAssessment(editingAssessment.id, data);
            setEditingAssessment(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartStudy = (subject: SubjectKey) => {
        startGrind(subject);
        setSelectedSubject(subject);
    };

    const handleStopStudy = () => {
        stopGrind();
        setSelectedSubject(null);
    };

    const pendingAssessments = assessments.filter(a => a.status !== "completed");
    const completedCount = assessments.filter(a => a.status === "completed").length;
    const overallProgress = assessments.length > 0
        ? Math.round(assessments.reduce((sum, a) => sum + a.progress, 0) / assessments.length)
        : 0;

    const totalStudyMinutes = stats?.totalMinutes || sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const studyHours = Math.floor(totalStudyMinutes / 60);
    const studyMinutes = totalStudyMinutes % 60;

    return (
        <DashboardLayout>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Clock size={20} className="text-gold" />}
                    label="Study Time"
                    value={`${studyHours}h ${studyMinutes}m`}
                    subtext="This month"
                />
                <StatCard
                    icon={<BookOpen size={20} className="text-sage" />}
                    label="Flashcards"
                    value={String(stats?.totalFlashcards || 0)}
                    subtext="Created"
                />
                <StatCard
                    icon={<CheckCircle size={20} className="text-green-500" />}
                    label="Completed"
                    value={String(completedCount)}
                    subtext="Assessments"
                />
                <StatCard
                    icon={<Target size={20} className="text-purple-500" />}
                    label="Progress"
                    value={`${overallProgress}%`}
                    subtext="Overall"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Study Session */}
                <div className="glass-card p-6 bg-white/40">
                    <h3 className="font-playfair text-xl text-charcoal dark:text-white mb-4">Quick Study</h3>

                    {isGrinding ? (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-sage/20 flex items-center justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-sage animate-pulse" />
                            </div>
                            <p className="text-sm text-charcoal/60 dark:text-white/60 mb-2">
                                Studying {SUBJECT_LABELS[activeSubject!]}
                            </p>
                            <p className="text-2xl font-bold text-charcoal dark:text-white mb-4">
                                In Progress...
                            </p>
                            <button
                                onClick={handleStopStudy}
                                className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <Square size={18} />
                                Stop Session
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-charcoal/60 dark:text-white/60 mb-4">
                                Start a study session to track your time
                            </p>
                            {(["biology", "physics", "chemistry", "maths", "other"] as SubjectKey[]).map((subject) => (
                                <button
                                    key={subject}
                                    onClick={() => handleStartStudy(subject)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-charcoal/5 dark:bg-white/5 hover:bg-charcoal/10 dark:hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${SUBJECT_COLORS[subject]}`} />
                                        <span className="text-sm font-medium">{SUBJECT_LABELS[subject]}</span>
                                    </div>
                                    <Play size={16} className="text-charcoal/40" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assessments */}
                <div className="lg:col-span-2 glass-card p-6 bg-white/40">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-playfair text-xl text-charcoal dark:text-white">Assessments</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 text-xs font-bold text-gold hover:text-charcoal transition-colors uppercase tracking-wider"
                        >
                            <Plus size={16} />
                            Add New
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-gold" />
                        </div>
                    ) : pendingAssessments.length === 0 ? (
                        <EmptyState
                            icon={<BookOpen size={24} className="text-charcoal/40" />}
                            title="No assessments yet"
                            description="Add your assignments, projects, and exams to track your progress"
                            actionLabel="Add Assessment"
                            onAction={() => setShowAddModal(true)}
                        />
                    ) : (
                        <div className="space-y-3">
                            {pendingAssessments.slice(0, 5).map((assessment) => (
                                <AssessmentItem
                                    key={assessment.id}
                                    assessment={assessment}
                                    onEdit={() => setEditingAssessment(assessment)}
                                    onDelete={() => removeAssessment(assessment.id)}
                                    onStatusChange={(status) => editAssessment(assessment.id, { status })}
                                />
                            ))}
                            {pendingAssessments.length > 5 && (
                                <p className="text-xs text-charcoal/40 text-center pt-2">
                                    +{pendingAssessments.length - 5} more assessments
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6 bg-white/40">
                <h3 className="font-playfair text-xl text-charcoal dark:text-white mb-4">Recent Study Sessions</h3>
                {sessions.length === 0 ? (
                    <p className="text-sm text-charcoal/60 dark:text-white/60 text-center py-8">
                        No study sessions yet. Start studying to see your activity here.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.slice(0, 6).map((session) => (
                            <div
                                key={session.id}
                                className="p-4 rounded-xl bg-charcoal/5 dark:bg-white/5"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${SUBJECT_COLORS[session.subjectId]}`} />
                                    <span className="text-sm font-medium">{SUBJECT_LABELS[session.subjectId]}</span>
                                </div>
                                <p className="text-2xl font-bold text-charcoal dark:text-white">
                                    {session.durationMinutes} min
                                </p>
                                <p className="text-xs text-charcoal/40 dark:text-white/40">
                                    {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Assessment Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Assessment"
                size="md"
            >
                <AssessmentForm
                    onSubmit={handleAddAssessment}
                    onCancel={() => setShowAddModal(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Assessment Modal */}
            <Modal
                isOpen={!!editingAssessment}
                onClose={() => setEditingAssessment(null)}
                title="Edit Assessment"
                size="md"
            >
                {editingAssessment && (
                    <AssessmentForm
                        initialData={editingAssessment}
                        onSubmit={handleEditAssessment}
                        onCancel={() => setEditingAssessment(null)}
                        isLoading={isSubmitting}
                    />
                )}
            </Modal>
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext: string }) {
    return (
        <div className="glass-card p-4 bg-white/40">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <span className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold text-charcoal dark:text-white">{value}</p>
            <p className="text-xs text-charcoal/40 dark:text-white/40">{subtext}</p>
        </div>
    );
}

function AssessmentItem({
    assessment,
    onEdit,
    onDelete,
    onStatusChange
}: {
    assessment: Assessment;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: "not-started" | "in-progress" | "completed") => void;
}) {
    const dueDate = new Date(assessment.dueDate);
    const isOverdue = isPast(dueDate) && !isToday(dueDate) && assessment.status !== "completed";
    const isDueToday = isToday(dueDate);

    const statusColors = {
        "not-started": "bg-charcoal/10 text-charcoal/60",
        "in-progress": "bg-sage/20 text-sage",
        "completed": "bg-green-100 text-green-600"
    };

    const priorityColors = {
        low: "border-l-gray-400",
        medium: "border-l-gold",
        high: "border-l-red-500"
    };

    return (
        <div className={`p-4 rounded-xl bg-white/60 dark:bg-white/5 border-l-4 ${priorityColors[assessment.priority]} ${isOverdue ? "ring-2 ring-red-200" : ""}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-charcoal dark:text-white truncate">
                            {assessment.title}
                        </h4>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[assessment.status]}`}>
                            {assessment.status.replace("-", " ")}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-charcoal/60 dark:text-white/60">
                        <span className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${SUBJECT_COLORS[assessment.subjectId]}`} />
                            {SUBJECT_LABELS[assessment.subjectId]}
                        </span>
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : isDueToday ? "text-gold" : ""}`}>
                            <Calendar size={12} />
                            {isOverdue ? "Overdue" : isDueToday ? "Due Today" : format(dueDate, "MMM d")}
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                        <div className="h-1.5 bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sage rounded-full transition-all"
                                style={{ width: `${assessment.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {assessment.status !== "completed" && (
                        <button
                            onClick={() => onStatusChange("completed")}
                            className="p-2 rounded-lg hover:bg-green-100 text-charcoal/40 hover:text-green-600 transition-colors"
                            title="Mark complete"
                        >
                            <CheckCircle size={16} />
                        </button>
                    )}
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg hover:bg-charcoal/5 text-charcoal/40 hover:text-charcoal transition-colors"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg hover:bg-red-50 text-charcoal/40 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
