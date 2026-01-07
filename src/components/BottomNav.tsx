import { NavLink } from "react-router-dom";
import { Home, FileText, Camera, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/plan", icon: FileText, label: "Plan" },
    { to: "/log", icon: Camera, label: "Log", isCenter: true },
    { to: "/progress", icon: BarChart3, label: "Progress" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-lg transition-colors min-w-[56px]",
                item.isCenter ? "relative -mt-4" : "px-4 py-2",
                !item.isCenter && (isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground")
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.isCenter ? (
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className={cn(
                        "w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-lg transition-all",
                        "animate-pulse",
                        isActive && "ring-2 ring-success ring-offset-2 ring-offset-card"
                      )}
                    >
                      <item.icon className="w-6 h-6 text-success-foreground" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-success" : "text-muted-foreground"
                    )}>{item.label}</span>
                  </div>
                ) : (
                  <>
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
