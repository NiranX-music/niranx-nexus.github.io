import { NavLink } from "react-router-dom";
import { Home, CheckSquare, Timer, User, Compass, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navigationItems = [
  { title: "Home", url: "/niranx/dashboard", icon: Home },
  { title: "Tasks", url: "/niranx/tasks", icon: CheckSquare },
  { title: "Focus", url: "/niranx/focus-engine", icon: Timer },
  { title: "AI", url: "/niranx/ai-corner", icon: Zap },
  { title: "Profile", url: "/niranx/profile", icon: User },
];

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] active:scale-95 touch-manipulation",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <span className="text-[10px] font-medium leading-none">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
