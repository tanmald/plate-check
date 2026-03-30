import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  ChevronRight,
  Shield,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
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
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="safe-top sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-base">🥗</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              PlateCheck
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="font-medium"
            onClick={() => navigate("/auth?mode=signin")}
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative px-6 pt-10 pb-14 overflow-hidden">
        {/* Background wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

        <div className="relative space-y-7">
          {/* Label */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                AI-powered meal analysis
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center space-y-3">
            <h1 className="text-[2.6rem] font-bold leading-[1.1] text-foreground tracking-tight">
              Know if you're{" "}
              <span className="relative">
                <span className="relative z-10 text-primary">on plan</span>
                <span className="absolute inset-x-0 bottom-1 h-2 bg-primary/15 rounded-sm -z-0" />
              </span>{" "}
              today
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              Snap a photo of your meal and get instant feedback — no calorie counting needed.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              size="xl"
              className="w-full text-base font-semibold shadow-sm"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Get started — it's free
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="w-full text-base font-medium"
              onClick={() => navigate("/auth?mode=signin")}
            >
              I already have an account
            </Button>
          </div>

          {/* Demo card */}
          <div className="relative pt-2">
            <div className="absolute -left-4 top-1/2 w-16 h-16 bg-success/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -right-2 bottom-0 w-10 h-10 bg-warning/20 rounded-full blur-lg pointer-events-none" />

            <Card className="card-shadow border-border/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-success to-primary/40" />
              <CardContent className="p-5 space-y-4">
                {/* Meal header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Today · Breakfast
                    </p>
                    <p className="font-semibold text-foreground">Avocado Toast & Eggs</p>
                  </div>
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-success/10 rounded-2xl border border-success/20">
                    <span className="text-xl font-bold text-success leading-none">87</span>
                    <span className="text-[9px] text-success/70 font-medium mt-0.5">score</span>
                  </div>
                </div>

                {/* Feedback items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-success/8 rounded-xl border border-success/15">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-xs text-foreground">
                      Protein source matches your plan
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-warning/8 rounded-xl border border-warning/15">
                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                    <p className="text-xs text-foreground">
                      Consider adding leafy greens
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Adherence</span>
                    <span className="text-xs font-semibold text-success">On track</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-success to-success/70 rounded-full transition-all"
                      style={{ width: "87%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────── */}
      <section className="px-6 py-5 border-y border-border/50 bg-secondary/40">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-foreground">0s</p>
            <p className="text-xs text-muted-foreground">Manual entry</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-foreground">GPT-4</p>
            <p className="text-xs text-muted-foreground">Vision AI</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-foreground">0–100</p>
            <p className="text-xs text-muted-foreground">Clear scoring</p>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="px-6 py-12 space-y-7">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <p className="text-sm text-muted-foreground">Three steps to stay on track</p>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-semibold text-foreground">1. Upload your plan</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Import your nutrition plan from PDF, photo, or Word doc. We structure it automatically.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-success" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-semibold text-foreground">2. Log meals by photo</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Snap a quick photo of what you eat. No manual food entry needed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-semibold text-foreground">3. Get instant feedback</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                See if you're on plan, off plan, or not sure — with explanations you can actually understand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="px-6 py-10 bg-secondary/30 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Built for real life</h2>
          <p className="text-sm text-muted-foreground">No spreadsheets. No obsessing.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              icon: Clock,
              title: "Log in seconds",
              desc: "A photo is all it takes. AI does the heavy lifting.",
            },
            {
              icon: TrendingUp,
              title: "Track your progress",
              desc: "Daily and weekly views show how consistent you've been.",
            },
            {
              icon: Star,
              title: "Honest confidence scores",
              desc: "We tell you when we're sure — and when we're not.",
            },
            {
              icon: Shield,
              title: "Private by default",
              desc: "Your meal data never leaves without your permission.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 p-4 bg-background rounded-2xl border border-border/50"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sample result ──────────────────────────────────── */}
      <section className="px-6 py-12 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Clear, honest feedback</h2>
          <p className="text-sm text-muted-foreground">We tell you what we know — and what we don't</p>
        </div>

        <Card className="card-shadow">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Sample result
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl border border-success/20">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">On plan</p>
                  <p className="text-xs text-muted-foreground">Matches your breakfast template</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-xl border border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">Off plan</p>
                  <p className="text-xs text-muted-foreground">Added sugar not in your plan</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Confidence level</p>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-success/10 text-success text-xs font-semibold rounded-lg">
                  High
                </span>
                <span className="px-2.5 py-1 bg-warning/10 text-warning text-xs font-semibold rounded-lg">
                  Medium
                </span>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-lg">
                  Low
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Trust ──────────────────────────────────────────── */}
      <section className="px-6 pb-10 space-y-3">
        <div className="flex items-start gap-3.5 p-4 bg-secondary rounded-2xl">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-foreground">Wellness support, not medical advice</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Always consult your healthcare provider for medical decisions.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3.5 p-4 bg-secondary rounded-2xl">
          <span className="text-base mt-0.5">🔒</span>
          <div>
            <p className="font-semibold text-sm text-foreground">Your data stays private</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              We never share or sell your personal information or meal data.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-2">
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-success/5 rounded-3xl p-7 space-y-5 text-center border border-primary/15 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="text-4xl relative z-10">🥗</div>
          <div className="space-y-1.5 relative z-10">
            <h3 className="text-xl font-bold text-foreground">Ready to get on track?</h3>
            <p className="text-sm text-muted-foreground">
              Start for free. No credit card required.
            </p>
          </div>
          <div className="space-y-2.5 relative z-10">
            <Button
              size="xl"
              className="w-full font-semibold shadow-sm"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Create your free account
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
            <button
              className="text-sm text-primary font-semibold"
              onClick={() => navigate("/auth?mode=signin")}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="px-6 pb-10 text-center">
        <p className="text-xs text-muted-foreground">
          © 2025 PlateCheck ·{" "}
          <button className="text-primary hover:underline">Terms</button> ·{" "}
          <button className="text-primary hover:underline">Privacy</button>
        </p>
      </footer>
    </div>
  );
}
