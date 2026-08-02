import { NavLink } from "react-router-dom";
import { Home, FileText, Camera, BarChart3, Trophy, Settings } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useActiveChallenge } from "@/hooks/use-challenges";

type NavItem = {
  to: string;
  icon: LucideIcon;
  labelKey: string;
  isCenter?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/",           icon: Home,      labelKey: "nav.home" },
  { to: "/plan",       icon: FileText,  labelKey: "nav.plan" },
  { to: "/log",        icon: Camera,    labelKey: "nav.log",      isCenter: true },
  { to: "/progress",   icon: BarChart3, labelKey: "nav.progress" },
  { to: "/challenges", icon: Trophy,    labelKey: "nav.challenges" },
  { to: "/settings",   icon: Settings,  labelKey: "nav.settings" },
];

const CenterNavIcon = ({ icon: Icon, isActive }: { icon: LucideIcon; isActive: boolean }) => (
  <div
    className={cn(
      "w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-lg transition-all motion-safe:animate-pulse",
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
  label,
  showBadge,
}: {
  item: NavItem;
  isActive: boolean;
  label: string;
  showBadge?: boolean;
}) {
  const { icon: Icon, isCenter } = item;

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
      <div className="relative">
        <SideNavIcon icon={Icon} />
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive" />
        )}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </>
  );
}

function NavItemLink({ item, showBadge }: { item: NavItem; showBadge?: boolean }) {
  const { t } = useTranslation();
  const label = t(item.labelKey);

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
      {({ isActive }) => <NavItemContent item={item} isActive={isActive} label={label} showBadge={showBadge} />}
    </NavLink>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  // Only fires the query when a session exists — BottomNav also renders
  // for a beat during auth transitions.
  const { data: activeChallenge } = useActiveChallenge();
  const hasPendingChallengeTasks =
    !!user &&
    activeChallenge?.enrollment.status === "active" &&
    activeChallenge.todayLog?.allComplete === false;

  const centerIndex = NAV_ITEMS.findIndex((i) => i.isCenter);
  const leftItems = NAV_ITEMS.slice(0, centerIndex);
  const centerItem = NAV_ITEMS[centerIndex];
  const rightItems = NAV_ITEMS.slice(centerIndex + 1);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="relative flex items-center justify-between px-2 h-16 w-full">
        <div className="flex items-center justify-around flex-1 pr-8">
          {leftItems.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
          <NavItemLink item={centerItem} />
        </div>
        <div className="flex items-center justify-around flex-1 pl-8">
          {rightItems.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              showBadge={item.to === "/challenges" ? hasPendingChallengeTasks : undefined}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
