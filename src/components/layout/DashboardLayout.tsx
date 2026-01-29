import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, Calendar as CalendarIcon, Settings, Bell } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-background overflow-hidden font-inter">
            {/* Sidebar */}
            <aside className="w-64 border-r border-charcoal/5 bg-white/50 backdrop-blur-xl flex flex-col">
                <div className="p-8">
                    <Link to="/">
                        <h1 className="text-3xl font-playfair text-charcoal tracking-tight cursor-pointer">Elite</h1>
                    </Link>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 mt-1">Academic Manager</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link to="/">
                        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={location.pathname === "/"} />
                    </Link>
                    <Link to="/bot-prep">
                        <NavItem icon={<BookOpen size={18} />} label="Bot Prep" active={location.pathname === "/bot-prep"} />
                    </Link>
                    <Link to="/timeline">
                        <NavItem icon={<CalendarIcon size={18} />} label="Timeline" active={location.pathname === "/timeline"} />
                    </Link>
                    <Link to="/community">
                        <NavItem icon={<Users size={18} />} label="Community" active={location.pathname === "/community"} />
                    </Link>
                </nav>

                <div className="p-4 border-t border-charcoal/5 space-y-2">
                    <Link to="/settings">
                        <NavItem icon={<Settings size={18} />} label="Settings" active={location.pathname === "/settings"} />
                    </Link>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-charcoal/5 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center text-sage font-medium text-xs">
                            M
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-charcoal truncate">Mentor Mode</p>
                            <p className="text-[10px] text-charcoal/40">Switch to CR View</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-charcoal/5 flex items-center justify-between px-10 bg-white/30 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-2xl font-playfair text-charcoal">Refining the Student Experience</h2>
                        <p className="text-xs text-charcoal/40">Thursday, 29th January 2026</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <Bell size={20} className="text-charcoal/60 group-hover:text-gold transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full ring-2 ring-background" />
                        </div>

                        <div className="h-10 px-4 flex items-center gap-3 glass-card bg-white/80 border-charcoal/5">
                            <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40" />
                            <span className="text-xs font-medium text-charcoal/80 tracking-wide">92% Attendance</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <div className={`
      flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group
      ${active ? "bg-charcoal text-white shadow-lg shadow-charcoal/20" : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"}
    `}>
            <span className={`${active ? "text-gold" : "group-hover:text-gold"} transition-colors`}>{icon}</span>
            <span className="text-sm font-medium tracking-wide">{label}</span>
        </div>
    );
}
