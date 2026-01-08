import { NavLink } from "react-router-dom";
import { Home, FileText, Camera, BarChart3, Settings } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  isCenter?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/plan", icon: FileText, label: "Plan" },
  { to: "/log", icon: Camera, label: "Log", isCenter: true },
  { to: "/progress", icon: BarChart3, label: "Progress" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const CenterNavIcon = ({ icon: Icon, isActive }: { icon: LucideIcon; isActive: boolean }) => (
  <div
    className={cn(
      "w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-lg transition-all animate-pulse",
      isActive && "ring-2 ring-success ring-offset-2 ring-offset-card"
    )}
  >
    <Icon className="w-6 h-6 text-success-foreground" />
  </div>
);

const SideNavIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <Icon className="w-5 h-5" />
);

function NavItemContent({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const { icon: Icon, label, isCenter } = item;

  if (isCenter) {
    return (
      <div className="flex flex-col items-center gap-1">
        <CenterNavIcon icon={Icon} isActive={isActive} />
        <span
          className={cn(
            "text-[10px] font-medium",
            isActive ? "text-success" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <>
      <SideNavIcon icon={Icon} />
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </>
  );
}

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 rounded-lg transition-colors",
          item.isCenter ? "relative -mt-4" : "px-4 py-2",
          !item.isCenter && isActive && "text-primary",
          !item.isCenter && !isActive && "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {({ isActive }) => <NavItemContent item={item} isActive={isActive} />}
    </NavLink>
  );
}

export function BottomNav() {
  const centerIndex = 2;
  const leftItems = NAV_ITEMS.slice(0, centerIndex);
  const centerItem = NAV_ITEMS[centerIndex];
  const rightItems = NAV_ITEMS.slice(centerIndex + 1);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="relative flex items-center justify-between px-2 h-16 w-full">
        {/* Left items */}
        <div className="flex items-center justify-around flex-1 pr-8">
          {leftItems.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </div>

        {/* Center item - absolutely positioned */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
          <NavItemLink item={centerItem} />
        </div>

        {/* Right items */}
        <div className="flex items-center justify-around flex-1 pl-8">
          {rightItems.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </div>
      </div>
    </nav>
  );
}
