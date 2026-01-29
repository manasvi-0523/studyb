import { useState } from "react";
import { Plus, X, Check, Trash2 } from "lucide-react";

interface Task {
    id: string;
    text: string;
    quadrant: "do" | "schedule" | "optimize" | "eliminate";
}

export function PriorityMatrix() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: "1", text: "Complete Lab Report", quadrant: "do" },
        { id: "2", text: "Study for Math Quiz", quadrant: "do" },
        { id: "3", text: "Term Paper Research", quadrant: "schedule" },
        { id: "4", text: "Reply to Club Mails", quadrant: "optimize" },
        { id: "5", text: "Infinite scrolling", quadrant: "eliminate" },
    ]);

    const [isAdding, setIsAdding] = useState<string | null>(null);
    const [newTaskText, setNewTaskText] = useState("");

    const addTask = (quadrant: Task["quadrant"]) => {
        if (!newTaskText.trim()) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            text: newTaskText.trim(),
            quadrant
        };

        setTasks([...tasks, newTask]);
        setNewTaskText("");
        setIsAdding(null);
    };

    const removeTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const getTasksForQuadrant = (quadrant: Task["quadrant"]) => {
        return tasks.filter(t => t.quadrant === quadrant);
    };

    return (
        <div className="glass-card p-8 bg-white/40 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="font-playfair text-xl text-charcoal">Priority Matrix</h3>
                <p className="text-xs text-charcoal/40 mt-1">Eisenhower 2x2 Strategy</p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
                <Quadrant
                    title="Do"
                    subtitle="Urgent & Important"
                    color="bg-sage/10"
                    textColor="text-sage"
                    tasks={getTasksForQuadrant("do")}
                    isAdding={isAdding === "do"}
                    newTaskText={newTaskText}
                    onStartAdd={() => setIsAdding("do")}
                    onCancelAdd={() => { setIsAdding(null); setNewTaskText(""); }}
                    onChangeText={setNewTaskText}
                    onAddTask={() => addTask("do")}
                    onRemoveTask={removeTask}
                />
                <Quadrant
                    title="Schedule"
                    subtitle="Not Urgent / Important"
                    color="bg-gold/10"
                    textColor="text-gold"
                    tasks={getTasksForQuadrant("schedule")}
                    isAdding={isAdding === "schedule"}
                    newTaskText={newTaskText}
                    onStartAdd={() => setIsAdding("schedule")}
                    onCancelAdd={() => { setIsAdding(null); setNewTaskText(""); }}
                    onChangeText={setNewTaskText}
                    onAddTask={() => addTask("schedule")}
                    onRemoveTask={removeTask}
                />
                <Quadrant
                    title="Optimize"
                    subtitle="Urgent / Not Important"
                    color="bg-beige/20"
                    textColor="text-charcoal/60"
                    tasks={getTasksForQuadrant("optimize")}
                    isAdding={isAdding === "optimize"}
                    newTaskText={newTaskText}
                    onStartAdd={() => setIsAdding("optimize")}
                    onCancelAdd={() => { setIsAdding(null); setNewTaskText(""); }}
                    onChangeText={setNewTaskText}
                    onAddTask={() => addTask("optimize")}
                    onRemoveTask={removeTask}
                />
                <Quadrant
                    title="Eliminate"
                    subtitle="Not Urgent / Not Important"
                    color="bg-charcoal/5"
                    textColor="text-charcoal/30"
                    tasks={getTasksForQuadrant("eliminate")}
                    isAdding={isAdding === "eliminate"}
                    newTaskText={newTaskText}
                    onStartAdd={() => setIsAdding("eliminate")}
                    onCancelAdd={() => { setIsAdding(null); setNewTaskText(""); }}
                    onChangeText={setNewTaskText}
                    onAddTask={() => addTask("eliminate")}
                    onRemoveTask={removeTask}
                />
            </div>
        </div>
    );
}

interface QuadrantProps {
    title: string;
    subtitle: string;
    color: string;
    textColor: string;
    tasks: Task[];
    isAdding: boolean;
    newTaskText: string;
    onStartAdd: () => void;
    onCancelAdd: () => void;
    onChangeText: (text: string) => void;
    onAddTask: () => void;
    onRemoveTask: (id: string) => void;
}

function Quadrant({
    title,
    subtitle,
    color,
    textColor,
    tasks,
    isAdding,
    newTaskText,
    onStartAdd,
    onCancelAdd,
    onChangeText,
    onAddTask,
    onRemoveTask
}: QuadrantProps) {
    return (
        <div className={`${color} rounded-2xl p-4 flex flex-col gap-3 group transition-all duration-300 hover:shadow-md border border-charcoal/5`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>{title}</h4>
                    <p className="text-[9px] text-charcoal/40 mt-0.5">{subtitle}</p>
                </div>
                <button
                    onClick={onStartAdd}
                    className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:bg-white transition-all"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className="space-y-2 mt-2 max-h-32 overflow-y-auto custom-scrollbar">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center gap-2 bg-white/40 px-3 py-2 rounded-xl text-[11px] text-charcoal/80 border border-white/40 group/task"
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${textColor.replace('text-', 'bg-')}`} />
                        <span className="flex-1">{task.text}</span>
                        <button
                            onClick={() => onRemoveTask(task.id)}
                            className="opacity-0 group-hover/task:opacity-100 text-charcoal/30 hover:text-red-500 transition-all"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}

                {isAdding && (
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-gold/40">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => onChangeText(e.target.value)}
                            placeholder="New task..."
                            className="flex-1 text-[11px] bg-transparent outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onAddTask();
                                if (e.key === "Escape") onCancelAdd();
                            }}
                        />
                        <button onClick={onAddTask} className="text-green-500 hover:text-green-600">
                            <Check size={14} />
                        </button>
                        <button onClick={onCancelAdd} className="text-charcoal/40 hover:text-charcoal">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
