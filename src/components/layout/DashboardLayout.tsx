import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, Calendar as CalendarIcon, Settings, Bell, Menu, X } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { to: "/bot-prep", icon: <BookOpen size={18} />, label: "Bot Prep" },
        { to: "/timeline", icon: <CalendarIcon size={18} />, label: "Timeline" },
        { to: "/community", icon: <Users size={18} />, label: "Community" },
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden font-inter">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 border-r border-charcoal/5 bg-white/95 lg:bg-white/50 backdrop-blur-xl flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 lg:p-8 flex items-center justify-between">
                    <Link to="/" onClick={() => setSidebarOpen(false)}>
                        <h1 className="text-2xl lg:text-3xl font-playfair text-charcoal tracking-tight cursor-pointer">Elite</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 mt-1">Academic Manager</p>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-charcoal/5"
                    >
                        <X size={20} className="text-charcoal/60" />
                    </button>
                </div>

                <nav className="flex-1 px-3 lg:px-4 space-y-1 lg:space-y-2 mt-2 lg:mt-4">
                    {navItems.map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}>
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                active={location.pathname === item.to}
                            />
                        </Link>
                    ))}
                </nav>

                <div className="p-3 lg:p-4 border-t border-charcoal/5 space-y-1 lg:space-y-2">
                    <Link to="/settings" onClick={() => setSidebarOpen(false)}>
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
            <main className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header */}
                <header className="h-16 lg:h-20 border-b border-charcoal/5 flex items-center justify-between px-4 lg:px-10 bg-white/30 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-charcoal/5"
                        >
                            <Menu size={24} className="text-charcoal" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-lg lg:text-2xl font-playfair text-charcoal">Refining the Student Experience</h2>
                            <p className="text-[10px] lg:text-xs text-charcoal/40">Thursday, 29th January 2026</p>
                        </div>
                        <div className="sm:hidden">
                            <h2 className="text-lg font-playfair text-charcoal">Elite</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="relative group cursor-pointer">
                            <Bell size={20} className="text-charcoal/60 group-hover:text-gold transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full ring-2 ring-background" />
                        </div>

                        <div className="h-9 lg:h-10 px-3 lg:px-4 flex items-center gap-2 lg:gap-3 glass-card bg-white/80 border-charcoal/5">
                            <div className="w-5 lg:w-6 h-5 lg:h-6 rounded-full bg-gold/20 border border-gold/40" />
                            <span className="text-[10px] lg:text-xs font-medium text-charcoal/80 tracking-wide hidden sm:inline">92% Attendance</span>
                            <span className="text-[10px] font-medium text-charcoal/80 sm:hidden">92%</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-8 custom-scrollbar">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-charcoal/10 z-30 safe-area-bottom">
                <div className="flex justify-around items-center h-16">
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex flex-col items-center gap-1 px-4 py-2 ${
                                location.pathname === item.to ? 'text-gold' : 'text-charcoal/40'
                            }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`
            flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-300 cursor-pointer group
            ${active ? "bg-charcoal text-white shadow-lg shadow-charcoal/20" : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"}
        `}>
            <span className={`${active ? "text-gold" : "group-hover:text-gold"} transition-colors`}>{icon}</span>
            <span className="text-sm font-medium tracking-wide">{label}</span>
        </div>
    );
}
