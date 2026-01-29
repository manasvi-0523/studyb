import { Plus } from "lucide-react";

export function PriorityMatrix() {
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
                    tasks={["Complete Lab Report", "Study for Math Quiz"]}
                />
                <Quadrant
                    title="Schedule"
                    subtitle="Not Urgent / Important"
                    color="bg-gold/10"
                    textColor="text-gold"
                    tasks={["Term Paper Research"]}
                />
                <Quadrant
                    title="Optimize"
                    subtitle="Urgent / Not Important"
                    color="bg-beige/20"
                    textColor="text-charcoal/60"
                    tasks={["Reply to Club Mails"]}
                />
                <Quadrant
                    title="Eliminate"
                    subtitle="Not Urgent / Not Important"
                    color="bg-charcoal/5"
                    textColor="text-charcoal/30"
                    tasks={["Infinite scrolling"]}
                />
            </div>
        </div>
    );
}

function Quadrant({ title, subtitle, color, textColor, tasks }: { title: string, subtitle: string, color: string, textColor: string, tasks: string[] }) {
    return (
        <div className={`${color} rounded-2xl p-4 flex flex-col gap-3 group transition-all duration-300 hover:shadow-md border border-charcoal/5`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>{title}</h4>
                    <p className="text-[9px] text-charcoal/40 mt-0.5">{subtitle}</p>
                </div>
                <button className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:bg-white transition-all">
                    <Plus size={14} />
                </button>
            </div>

            <div className="space-y-2 mt-2">
                {tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/40 px-3 py-2 rounded-xl text-[11px] text-charcoal/80 border border-white/40">
                        <div className={`w-1.5 h-1.5 rounded-full ${textColor.replace('text-', 'bg-')}`} />
                        {task}
                    </div>
                ))}
            </div>
        </div>
    );
}
