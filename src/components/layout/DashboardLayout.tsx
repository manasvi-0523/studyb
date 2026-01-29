import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, Calendar as CalendarIcon, Settings, Bell, Menu, X } from "lucide-react";
import { useUserData } from "../../hooks/useUserData";

export function DashboardLayout({ children }: { children: ReactNode }) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Load user data from Firebase on mount
    useUserData();

    const navItems = [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/bot-prep", icon: BookOpen, label: "Bot Prep" },
        { to: "/timeline", icon: CalendarIcon, label: "Timeline" },
        { to: "/community", icon: Users, label: "Community" },
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden font-inter">
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Slide-out Sidebar */}
            <aside className={`mobile-sidebar bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-xl flex flex-col ${mobileMenuOpen ? 'open' : 'closed'}`}>
                <div className="p-6 flex items-center justify-between border-b border-charcoal/5">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <h1 className="text-2xl font-playfair text-charcoal tracking-tight">Elite</h1>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-xl hover:bg-charcoal/5 transition-colors"
                    >
                        <X size={20} className="text-charcoal/60" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                            <NavItem
                                icon={<item.icon size={18} />}
                                label={item.label}
                                active={location.pathname === item.to}
                            />
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-charcoal/5">
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                        <NavItem icon={<Settings size={18} />} label="Settings" active={location.pathname === "/settings"} />
                    </Link>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar w-64 border-r border-charcoal/5 bg-white/50 backdrop-blur-xl flex-col hidden lg:flex">
                <div className="p-8">
                    <Link to="/">
                        <h1 className="text-3xl font-playfair text-charcoal tracking-tight cursor-pointer">Elite</h1>
                    </Link>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 mt-1">Academic Manager</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link key={item.to} to={item.to}>
                            <NavItem
                                icon={<item.icon size={18} />}
                                label={item.label}
                                active={location.pathname === item.to}
                            />
                        </Link>
                    ))}
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
                <header className="h-16 lg:h-20 border-b border-charcoal/5 flex items-center justify-between px-4 lg:px-10 bg-white/30 backdrop-blur-md z-10">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-charcoal/5 transition-colors"
                    >
                        <Menu size={24} className="text-charcoal/60" />
                    </button>

                    {/* Desktop Title */}
                    <div className="hidden lg:block">
                        <h2 className="text-2xl font-playfair text-charcoal">Refining the Student Experience</h2>
                        <p className="text-xs text-charcoal/40">Thursday, 29th January 2026</p>
                    </div>

                    {/* Mobile Title */}
                    <div className="lg:hidden">
                        <h2 className="text-lg font-playfair text-charcoal">Elite</h2>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="relative group cursor-pointer">
                            <Bell size={20} className="text-charcoal/60 group-hover:text-gold transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full ring-2 ring-background" />
                        </div>

                        <div className="hidden sm:flex h-10 px-4 items-center gap-3 glass-card bg-white/80 border-charcoal/5">
                            <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40" />
                            <span className="text-xs font-medium text-charcoal/80 tracking-wide">92% Attendance</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-8 custom-scrollbar mobile-main-content">
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                <nav className="bottom-nav mobile-nav lg:hidden flex items-center justify-around px-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors ${
                                    isActive ? "text-gold" : "text-charcoal/40"
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    <Link
                        to="/settings"
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors ${
                            location.pathname === "/settings" ? "text-gold" : "text-charcoal/40"
                        }`}
                    >
                        <Settings size={20} />
                        <span className="text-[10px] mt-1 font-medium">Settings</span>
                    </Link>
                </nav>
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
