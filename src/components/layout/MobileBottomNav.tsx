import { NavLink } from "react-router-dom";
import { Home, CheckSquare, Timer, User, Music, MessageCircle, BookOpen, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Home", url: "/niranx/dashboard", icon: Home },
  { title: "Tasks", url: "/niranx/tasks", icon: CheckSquare },
  { title: "Focus", url: "/niranx/focus-engine", icon: Timer },
  { title: "Chat", url: "/niranx/chat", icon: MessageCircle },
  { title: "Profile", url: "/niranx/profile", icon: User },
];

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[70px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
