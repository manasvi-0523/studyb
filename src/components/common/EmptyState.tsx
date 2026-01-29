import { ReactNode } from "react";
import { Plus } from "lucide-react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-charcoal/5 dark:bg-white/5 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h4 className="font-playfair text-lg text-charcoal dark:text-white mb-2">{title}</h4>
            <p className="text-sm text-charcoal/60 dark:text-white/60 max-w-xs mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="gold-button flex items-center gap-2"
                >
                    <Plus size={18} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
