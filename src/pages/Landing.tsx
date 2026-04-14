import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, Check, AlertCircle, ChevronRight, CalendarDays, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        <div className="flex items-center justify-between px-5 py-3.5 max-w-5xl mx-auto">
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
            {t("landing.sign_in")}
          </button>
        </div>
      </header>

      {/* ── Hero — dark background ───────────────────────────── */}
      <section className="bg-foreground text-background px-5 pt-12 pb-14">
        <div className="max-w-5xl mx-auto md:flex md:items-center md:gap-16">
        <div className="space-y-8 md:flex-1">

          {/* Overline */}
          <p className="text-xs font-semibold tracking-widest uppercase text-background/50">
            {t("landing.overline")}
          </p>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter leading-[1.05] text-background">
              {t("landing.headline_1")}<br />
              {t("landing.headline_2")}<br />
              <span className="text-primary">{t("landing.headline_accent")}</span>
            </h1>
            <p className="text-base text-background/60 leading-relaxed max-w-[300px]">
              {t("landing.hero_desc")}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground font-semibold"
              onClick={() => navigate("/auth?mode=signup")}
            >
              {t("landing.cta_start")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <button
              className="text-sm text-background/50 hover:text-background/80 transition-colors py-1"
              onClick={() => navigate("/auth?mode=signin")}
            >
              {t("landing.cta_signin")}
            </button>
          </div>

        </div>{/* end left column */}

          {/* Demo card — phone-style */}
          <div className="relative md:flex-1 md:max-w-sm">
            {/* Glow */}
            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative bg-background rounded-2xl shadow-2xl overflow-hidden border border-background/10">
              {/* App top bar */}
              <div className="bg-background/5 px-4 py-3 border-b border-background/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-background/40 uppercase tracking-wider">{t("landing.demo_today")}</p>
                  <p className="text-sm font-semibold text-foreground">Grilled salmon & quinoa</p>
                </div>
                {/* Score */}
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-success/10 rounded-xl border border-success/20">
                  <span className="text-lg font-black text-success leading-none">90</span>
                  <span className="text-[8px] text-success/60 font-medium">{t("landing.demo_score")}</span>
                </div>
              </div>

              {/* Detected foods */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("landing.demo_detected")}</p>
                {[
                  { name: "Grilled salmon", label: t("landing.demo_required"), style: "bg-success/8 border-success/15 text-success" },
                  { name: "Quinoa", label: t("landing.demo_allowed"), style: "bg-secondary border-border text-muted-foreground" },
                  { name: "Cream sauce", label: t("landing.demo_not_aligned"), style: "bg-warning/8 border-warning/15 text-warning" },
                ].map(({ name, label, style }) => (
                  <div key={name} className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg border",
                    style.split(" ").slice(0, 2).join(" ")
                  )}>
                    {label === t("landing.demo_required")
                      ? <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                      : label === t("landing.demo_not_aligned")
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
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("landing.demo_breakdown")}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono p-2 bg-muted/40 rounded-lg">
                  <span className="text-foreground font-medium">100</span>
                  <span className="text-muted-foreground">−</span>
                  <span className="text-warning font-medium">10</span>
                  <span className="text-muted-foreground">{t("landing.demo_not_aligned_label")}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-success font-bold">90</span>
                </div>
              </div>
            </div>
          </div>
        </div>{/* end right column / outer flex */}
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="px-5 py-14 max-w-3xl mx-auto">
        <div className="space-y-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t("landing.how_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("landing.how_subtitle")}</p>
          </div>

          <div className="space-y-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
            {[
              { n: "1", icon: Upload, color: "text-primary bg-primary/10", titleKey: "landing.step1_title", descKey: "landing.step1_desc" },
              { n: "2", icon: Camera, color: "text-success bg-success/10", titleKey: "landing.step2_title", descKey: "landing.step2_desc" },
              { n: "3", icon: Sparkles, color: "text-warning bg-warning/10", titleKey: "landing.step3_title", descKey: "landing.step3_desc" },
            ].map(({ n, icon: Icon, color, titleKey, descKey }) => (
              <div key={n} className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <span className="absolute -top-2 -left-1 text-6xl font-black text-muted/20 leading-none select-none">{n}</span>
                  <div className={cn("relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center mt-1", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-1.5">
                  <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── More than meal tracking ──────────────────────────── */}
      <section className="px-5 py-12 bg-secondary/40 border-y border-border/50">
        <div className="max-w-3xl mx-auto space-y-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t("landing.features_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("landing.features_subtitle")}</p>
          </div>

          <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
            {[
              { icon: "🌙", titleKey: "landing.feat1_title", descKey: "landing.feat1_desc", tag: true },
              { icon: "🛒", titleKey: "landing.feat2_title", descKey: "landing.feat2_desc", tag: true },
              { icon: "📊", titleKey: "landing.feat3_title", descKey: "landing.feat3_desc", tag: false },
            ].map(({ icon, titleKey, descKey, tag }) => (
              <div key={titleKey} className="flex items-start gap-4 p-4 bg-background rounded-2xl border border-border/60">
                <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{t(titleKey)}</p>
                    {tag && (
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded tracking-wide uppercase">
                        {t("landing.feat_tag_new")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="px-5 py-16 max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-3xl font-black tracking-tight text-foreground">
            {t("landing.final_title_1")}<br />{t("landing.final_title_2")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("landing.final_desc")}</p>
        </div>
        <Button
          size="lg"
          className="w-full font-semibold"
          onClick={() => navigate("/auth?mode=signup")}
        >
          {t("landing.create_account")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="px-5 pb-10 text-center border-t border-border/40 pt-6">
        <p className="text-xs text-muted-foreground">
          {t("landing.footer_copy")} ·{" "}
          <button className="hover:text-foreground transition-colors">{t("landing.footer_terms")}</button> ·{" "}
          <button className="hover:text-foreground transition-colors">{t("landing.footer_privacy")}</button>
        </p>
      </footer>
    </div>
  );
}
