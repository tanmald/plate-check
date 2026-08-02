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
      {/* w-full + truncate: with 3 items sharing one side, a long label
          (translated or not) ellipsizes instead of pushing the item off
          the edge of the screen — see the min-w-0 on the link itself below. */}
      <span className="text-[9px] font-medium text-muted-foreground w-full text-center truncate">{label}</span>
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
          item.isCenter ? "relative -mt-4" : "flex-1 min-w-0 px-0.5 py-2",
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
      <div className="relative flex items-center h-16 w-full px-0.5">
        {/* Both sides get an equal flex-1 share — NOT proportional to item
            count — so this spacer lands exactly at the floating center
            button's true 50% position regardless of the 2-left/3-right
            split. (Proportional sizing was tried and rejected: it gives
            each item more even width, but shifts this spacer off-center
            and reopens the overlap it exists to prevent.) The 3-item side
            being tighter per-item is instead handled by tighter padding
            and a smaller label font on side items. */}
        <div className="flex items-center justify-around flex-1 min-w-0">
          {leftItems.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
        </div>
        {/* Reserves room for the floating center button in normal flow, so
            side groups never crowd under it. */}
        <div className="w-14 shrink-0" aria-hidden="true" />
        <div className="flex items-center justify-around flex-1 min-w-0">
          {rightItems.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              showBadge={item.to === "/challenges" ? hasPendingChallengeTasks : undefined}
            />
          ))}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
          <NavItemLink item={centerItem} />
        </div>
      </div>
    </nav>
  );
}
