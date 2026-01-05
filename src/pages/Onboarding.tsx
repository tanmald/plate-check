import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Upload, Camera, FileText, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "welcome" | "signup" | "upload" | "parsing" | "review" | "complete";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleComplete = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      {step !== "welcome" && step !== "complete" && (
        <div className="safe-top px-4 pt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const steps: Step[] = ["welcome", "signup", "upload", "parsing", "review"];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) setStep(steps[currentIndex - 1]);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex gap-1">
              {["signup", "upload", "review"].map((s, i) => (
                <div 
                  key={s}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-colors",
                    step === s || (step === "parsing" && s === "upload")
                      ? "bg-primary"
                      : ["signup", "upload", "parsing", "review"].indexOf(step) > i
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center p-6">
        {step === "welcome" && (
          <div className="space-y-8 text-center animate-fade-up">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                <span className="text-5xl">🥗</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">PlateCheck</h1>
              <p className="text-lg text-muted-foreground">
                The easiest way to know if you're following your nutrition plan
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Photo-based logging</h3>
                  <p className="text-sm text-muted-foreground">Just snap a photo of your meal</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-powered feedback</h3>
                  <p className="text-sm text-muted-foreground">Instant adherence scores & explanations</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Your plan, structured</h3>
                  <p className="text-sm text-muted-foreground">Upload any nutrition plan format</p>
                </div>
              </div>
            </div>

            <Button size="xl" className="w-full" onClick={() => setStep("signup")}>
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === "signup" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="text-muted-foreground">Start tracking your nutrition journey</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input 
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button size="xl" className="w-full" onClick={() => setStep("upload")}>
                Continue
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Continue with Apple
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Continue with Google
              </Button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Upload your nutrition plan</h2>
              <p className="text-muted-foreground">PDF, Word, or image - we'll structure it for you</p>
            </div>

            <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium mb-1">Drag & drop or tap to upload</p>
                <p className="text-sm text-muted-foreground">Supports PDF, DOCX, JPG, PNG</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button size="xl" className="w-full" onClick={() => {
                setStep("parsing");
                setTimeout(() => setStep("review"), 2500);
              }}>
                <Upload className="w-5 h-5 mr-2" />
                Upload Plan
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("review")}>
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {step === "parsing" && (
          <div className="space-y-6 text-center animate-fade-up">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Analyzing your plan...</h2>
              <p className="text-muted-foreground">Our AI is extracting meal templates and guidelines</p>
            </div>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Plan ready!</h2>
              <p className="text-muted-foreground">We've structured your nutrition plan</p>
            </div>

            <Card className="card-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <span className="text-xl">🌅</span>
                  <div>
                    <p className="font-medium text-sm">Breakfast</p>
                    <p className="text-xs text-muted-foreground">Whole grains, protein, fruit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <span className="text-xl">☀️</span>
                  <div>
                    <p className="font-medium text-sm">Lunch</p>
                    <p className="text-xs text-muted-foreground">Lean protein, vegetables, carbs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <span className="text-xl">🌙</span>
                  <div>
                    <p className="font-medium text-sm">Dinner</p>
                    <p className="text-xs text-muted-foreground">Lean protein, vegetables</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <span className="text-xl">🍎</span>
                  <div>
                    <p className="font-medium text-sm">Snacks</p>
                    <p className="text-xs text-muted-foreground">Protein or fruit based</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button size="xl" className="w-full" onClick={() => setStep("complete")}>
              Looks Good!
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-8 text-center animate-fade-up">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold">You're all set!</h2>
              <p className="text-muted-foreground">
                Start logging your meals and see how well you're following your plan.
              </p>
            </div>

            <Button size="xl" className="w-full" onClick={handleComplete}>
              Start Tracking
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
