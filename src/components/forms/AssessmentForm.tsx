import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Assessment } from "../../lib/dataService";
import type { SubjectKey } from "../../types";

interface AssessmentFormProps {
    initialData?: Partial<Assessment>;
    onSubmit: (data: Omit<Assessment, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const SUBJECTS: { id: SubjectKey; label: string }[] = [
    { id: "biology", label: "Biology" },
    { id: "physics", label: "Physics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "maths", label: "Mathematics" },
    { id: "other", label: "Other" }
];

export function AssessmentForm({ initialData, onSubmit, onCancel, isLoading }: AssessmentFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [subjectId, setSubjectId] = useState<SubjectKey>(initialData?.subjectId || "other");
    const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(initialData?.priority || "medium");
    const [status, setStatus] = useState<"not-started" | "in-progress" | "completed">(initialData?.status || "not-started");
    const [progress, setProgress] = useState(initialData?.progress || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !dueDate) return;

        await onSubmit({
            title: title.trim(),
            description: description.trim(),
            subjectId,
            dueDate,
            priority,
            status,
            progress
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                    Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Physics Lab Report"
                    required
                    className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about the assessment..."
                    rows={3}
                    className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40 resize-none"
                />
            </div>

            {/* Subject & Due Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                        Subject *
                    </label>
                    <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value as SubjectKey)}
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    >
                        {SUBJECTS.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                        Due Date *
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    />
                </div>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                        Priority
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as "not-started" | "in-progress" | "completed")}
                        className="w-full mt-2 p-3 bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-gold/40"
                    >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Progress */}
            <div>
                <label className="text-xs font-bold text-charcoal/60 dark:text-white/60 uppercase tracking-wider">
                    Progress: {progress}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-charcoal/10 dark:border-white/10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-full text-sm font-medium text-charcoal/60 hover:bg-charcoal/5 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !dueDate}
                    className="flex-1 gold-button flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        initialData ? "Update" : "Add Assessment"
                    )}
                </button>
            </div>
        </form>
    );
}
