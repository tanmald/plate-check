import { NavLink } from "react-router-dom";
import { Home, BarChart3, FileText, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  onCameraClick?: () => void;
}

export function BottomNav({ onCameraClick }: BottomNavProps) {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/weekly", icon: BarChart3, label: "Weekly" },
    { to: "/plan", icon: FileText, label: "Plan" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto relative">
        {/* Left nav items */}
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Center FAB */}
        <div className="relative -mt-8">
          <Button
            variant="fab"
            size="fab"
            onClick={onCameraClick}
            className="relative animate-pulse-ring"
          >
            <Camera className="w-7 h-7" />
          </Button>
        </div>

        {/* Right nav items */}
        {navItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
