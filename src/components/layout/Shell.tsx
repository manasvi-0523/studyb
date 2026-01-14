import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Command Center" },
  { to: "/combat-drills", label: "Combat Drills" },
  { to: "/deep-work", label: "Deep Work" },
  { to: "/legion", label: "The Legion" }
];

export function Shell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-urgent shadow-neon" />
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-white/40">
                Sarwak
              </div>
              <div className="text-xs text-white/50">Elite Study Command Center</div>
            </div>
          </div>
          <nav className="flex gap-2 text-xs">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "px-3 py-1 rounded-full border border-white/5",
                    "hover:border-accent/60 hover:text-accent transition-colors",
                    isActive ? "bg-accent/20 text-accent" : "text-white/60"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-6 py-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

