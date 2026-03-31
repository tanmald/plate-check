import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, Check, AlertCircle, ChevronRight, CalendarDays, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="safe-top sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm">🥗</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">PlateCheck</span>
          </div>
          <button
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate("/auth?mode=signin")}
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ── Hero — dark background ───────────────────────────── */}
      <section className="bg-foreground text-background px-5 pt-12 pb-14">
        <div className="space-y-8 max-w-lg mx-auto">

          {/* Overline */}
          <p className="text-xs font-semibold tracking-widest uppercase text-background/50">
            Nutrition plan adherence · AI-powered
          </p>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter leading-[1.05] text-background">
              Snap a photo.<br />
              Know if you're<br />
              <span className="text-primary">on plan.</span>
            </h1>
            <p className="text-base text-background/60 leading-relaxed max-w-[300px]">
              PlateCheck checks your meal against your personal nutrition plan — no calorie counting, no logging. Just a clear score.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground font-semibold"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Get started free
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <button
              className="text-sm text-background/50 hover:text-background/80 transition-colors py-1"
              onClick={() => navigate("/auth?mode=signin")}
            >
              Already have an account? Sign in
            </button>
          </div>

          {/* Demo card — phone-style */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative bg-background rounded-2xl shadow-2xl overflow-hidden border border-background/10">
              {/* App top bar */}
              <div className="bg-background/5 px-4 py-3 border-b border-background/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-background/40 uppercase tracking-wider">Today · Dinner</p>
                  <p className="text-sm font-semibold text-foreground">Grilled salmon & quinoa</p>
                </div>
                {/* Score */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-success/10 rounded-xl border border-success/20">
                  <span className="text-lg font-black text-success leading-none">90</span>
                  <span className="text-[8px] text-success/60 font-medium">score</span>
                </div>
              </div>

              {/* Detected foods */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Detected foods</p>
                {[
                  { name: "Grilled salmon", label: "Required", style: "bg-success/8 border-success/15 text-success" },
                  { name: "Quinoa", label: "Allowed", style: "bg-secondary border-border text-muted-foreground" },
                  { name: "Cream sauce", label: "Off plan", style: "bg-warning/8 border-warning/15 text-warning" },
                ].map(({ name, label, style }) => (
                  <div key={name} className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg border",
                    style.split(" ").slice(0, 2).join(" ")
                  )}>
                    {label === "Required"
                      ? <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      : label === "Off plan"
                        ? <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                        : <span className="w-3.5 h-3.5 flex-shrink-0" />
                    }
                    <span className="text-xs text-foreground">{name}</span>
                    <span className={cn("ml-auto text-[10px] font-medium", style.split(" ").slice(2).join(" "))}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Score breakdown */}
              <div className="px-4 pb-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Score breakdown</p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono p-2 bg-muted/40 rounded-lg">
                  <span className="text-foreground font-medium">100</span>
                  <span className="text-muted-foreground">−</span>
                  <span className="text-warning font-medium">10</span>
                  <span className="text-muted-foreground">(off plan)</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-success font-bold">90</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="px-5 py-14 max-w-lg mx-auto">
        <div className="space-y-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">How it works</h2>
            <p className="text-sm text-muted-foreground">Three steps, zero friction.</p>
          </div>

          <div className="space-y-8">
            {[
              {
                n: "1",
                icon: Upload,
                color: "text-primary bg-primary/10",
                title: "Import your plan",
                desc: "Upload your nutrition plan from PDF or photo. We parse it into meal templates automatically.",
              },
              {
                n: "2",
                icon: Camera,
                color: "text-success bg-success/10",
                title: "Snap your meal",
                desc: "Take a quick photo before or after eating. No typing, no searching for foods.",
              },
              {
                n: "3",
                icon: Sparkles,
                color: "text-warning bg-warning/10",
                title: "Get your score",
                desc: "Instant score with a full breakdown — required foods, off-plan items, and exactly what to swap.",
              },
            ].map(({ n, icon: Icon, color, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <span className="absolute -top-2 -left-1 text-6xl font-black text-muted/20 leading-none select-none">{n}</span>
                  <div className={cn("relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center mt-1", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-1.5">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── More than meal tracking ──────────────────────────── */}
      <section className="px-5 py-12 bg-secondary/40 border-y border-border/50">
        <div className="max-w-lg mx-auto space-y-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">More than meal tracking</h2>
            <p className="text-sm text-muted-foreground">Everything you need to eat with intention.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: "🌙",
                title: "Weekly meal planner",
                desc: "Plan your dinners (and everything else) for the week. No more 'what's for dinner?' at 7pm.",
                tag: "New",
              },
              {
                icon: "🛒",
                title: "Smart shopping list",
                desc: "Automatically generated from your meal plan. Share with your partner in real time.",
                tag: "New",
              },
              {
                icon: "📊",
                title: "Progress tracking",
                desc: "Daily and weekly adherence trends. See patterns over time, not just today.",
                tag: null,
              },
            ].map(({ icon, title, desc, tag }) => (
              <div key={title} className="flex items-start gap-4 p-4 bg-background rounded-2xl border border-border/60">
                <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                    {tag && (
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded tracking-wide uppercase">
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="px-5 py-16 max-w-lg mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-3xl font-black tracking-tight text-foreground">
            Start eating<br />with intention.
          </h3>
          <p className="text-sm text-muted-foreground">Free to try. No credit card needed.</p>
        </div>
        <Button
          size="lg"
          className="w-full font-semibold"
          onClick={() => navigate("/auth?mode=signup")}
        >
          Create your account
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="px-5 pb-10 text-center border-t border-border/40 pt-6">
        <p className="text-xs text-muted-foreground">
          © 2026 PlateCheck · Wellness support, not medical advice ·{" "}
          <button className="hover:text-foreground transition-colors">Terms</button> ·{" "}
          <button className="hover:text-foreground transition-colors">Privacy</button>
        </p>
      </footer>
    </div>
  );
}
