import { NavLink } from "react-router-dom";
import { Home, FileText, Camera, BarChart3, Settings, Moon, Sun, Salad } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { BottomNav } from "@/components/BottomNav";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/plan", icon: FileText, label: "Plan" },
  { to: "/log", icon: Camera, label: "Log" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-card border-r border-border fixed left-0 top-0 bottom-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Salad className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">PlateCheck</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer: theme toggle */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 shrink-0" />
          ) : (
            <Moon className="w-5 h-5 shrink-0" />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex-1 md:ml-60 min-h-screen">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
