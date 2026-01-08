import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronRight, 
  Upload, 
  Camera, 
  FileText, 
  Check, 
  Sparkles, 
  Shield,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingStep = "value1" | "value2" | "value3";
type AuthStep = "welcome" | "signup" | "signin" | "forgot-password";
type PostAuthStep = "no-plan";
type Step = OnboardingStep | AuthStep | PostAuthStep;

interface FormErrors {
  email?: string;
  password?: string;
  terms?: string;
  general?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("value1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const onboardingSteps: OnboardingStep[] = ["value1", "value2", "value3"];
  const currentOnboardingIndex = onboardingSteps.indexOf(step as OnboardingStep);
  const isOnboardingStep = currentOnboardingIndex !== -1;

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return undefined;
  };

  const handleSkip = () => {
    setStep("welcome");
  };

  const handleContinueOnboarding = () => {
    if (currentOnboardingIndex < onboardingSteps.length - 1) {
      setStep(onboardingSteps[currentOnboardingIndex + 1]);
    } else {
      setStep("welcome");
    }
  };

  const handleSignUp = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const termsError = !termsAccepted ? "You must accept the terms" : undefined;

    setErrors({ email: emailError, password: passwordError, terms: termsError });

    if (emailError || passwordError || termsError) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("no-plan");
  };

  const handleSignIn = async () => {
    const emailError = validateEmail(email);
    const passwordError = !password ? "Password is required" : undefined;

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate("/");
  };

  const handleForgotPassword = async () => {
    const emailError = validateEmail(email);
    setErrors({ email: emailError });

    if (emailError) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Show success state
    setErrors({ general: "Check your email for reset instructions" });
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("no-plan");
  };

  const handleImportPlan = () => {
    navigate("/plan");
  };

  const handleCreateManually = () => {
    navigate("/plan");
  };

  const handleStartWithoutPlan = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress dots for onboarding screens */}
      {isOnboardingStep && (
        <div className="safe-top px-6 pt-6 flex justify-between items-center">
          <div className="flex gap-2">
            {onboardingSteps.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i <= currentOnboardingIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={handleSkip}
          >
            Skip
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center p-6">
        {/* Onboarding 1 — Value Proposition */}
        {step === "value1" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                <span className="text-4xl">🥗</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Know if you're on plan
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PlateCheck tells you whether your meals match your nutrition plan — no calorie counting required.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                size="xl" 
                className="w-full" 
                onClick={handleContinueOnboarding}
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Wellness support, not medical advice.
            </p>
          </div>
        )}

        {/* Onboarding 2 — How it works */}
        {step === "value2" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                How it works
              </h1>
              <p className="text-muted-foreground">
                Three simple steps to stay on track
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">1. Upload your plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Import your nutrition plan from PDF, Word, or image. We'll structure it for you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">2. Log meals by photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Snap a quick photo of what you eat. No manual entry needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">3. Get instant feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    See if you're on plan, off plan, or not sure yet — with clear explanations.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              size="xl" 
              className="w-full" 
              onClick={handleContinueOnboarding}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Onboarding 3 — Trust & expectations */}
        {step === "value3" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Clear, honest feedback
              </h1>
              <p className="text-muted-foreground">
                We tell you what we know — and what we don't
              </p>
            </div>

            {/* Sample confidence card */}
            <Card className="card-shadow">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Sample result</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                    <Check className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-sm text-foreground">On plan</p>
                      <p className="text-xs text-muted-foreground">Matches your breakfast template</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-sm text-foreground">Off plan</p>
                      <p className="text-xs text-muted-foreground">Added sugar not in your plan</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Info className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm text-foreground">Not sure yet</p>
                      <p className="text-xs text-muted-foreground">Couldn't identify all ingredients</p>
                    </div>
                  </div>
                </div>

                {/* Confidence indicator */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Confidence level</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded">High</span>
                    <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded">Medium</span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">Low</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    We show confidence so you know when to double-check
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <Shield className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Wellness support, not medical advice.</span> Always consult your healthcare provider for medical decisions.
              </p>
            </div>

            <Button 
              size="xl" 
              className="w-full" 
              onClick={handleContinueOnboarding}
            >
              Get started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Auth — Welcome */}
        {step === "welcome" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                <span className="text-4xl">🥗</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Create account or sign in
              </h1>
              <p className="text-muted-foreground">
                Save your plan and track progress across devices
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full justify-start gap-3"
                onClick={() => handleSocialAuth("apple")}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </Button>

              <Button 
                variant="outline" 
                size="xl" 
                className="w-full justify-start gap-3"
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button 
                variant="outline" 
                size="xl" 
                className="w-full justify-start gap-3"
                onClick={() => setStep("signup")}
                disabled={isLoading}
              >
                <FileText className="w-5 h-5" />
                Continue with Email
              </Button>
            </div>

            <div className="text-center">
              <button 
                className="text-sm text-primary font-medium"
                onClick={() => setStep("signin")}
              >
                Already have an account? Sign in
              </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Your data stays private. We never share your information.
            </p>
          </div>
        )}

        {/* Auth — Email Sign Up */}
        {step === "signup" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-muted-foreground">Start tracking your nutrition journey</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Email</label>
                <Input 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={cn("h-12", errors.email && "border-destructive")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Password</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={cn("h-12 pr-10", errors.password && "border-destructive")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked === true);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(errors.terms && "border-destructive")}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the{" "}
                  <a href="#" className="text-primary underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary underline">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-destructive -mt-2">{errors.terms}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                size="xl" 
                className="w-full" 
                onClick={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep("welcome")}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Auth — Email Sign In */}
        {step === "signin" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to continue tracking</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Email</label>
                <Input 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={cn("h-12", errors.email && "border-destructive")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <button 
                    className="text-sm text-primary"
                    onClick={() => setStep("forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={cn("h-12 pr-10", errors.password && "border-destructive")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                size="xl" 
                className="w-full" 
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep("welcome")}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>

            <div className="text-center">
              <button 
                className="text-sm text-primary font-medium"
                onClick={() => setStep("signup")}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        )}

        {/* Auth — Forgot Password */}
        {step === "forgot-password" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Reset password</h2>
              <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <Check className="w-4 h-4 text-success" />
                <p className="text-sm text-success">{errors.general}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Email</label>
              <Input 
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                className={cn("h-12", errors.email && "border-destructive")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                size="xl" 
                className="w-full" 
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep("signin")}
                disabled={isLoading}
              >
                Back to sign in
              </Button>
            </div>
          </div>
        )}

        {/* Post-auth — No Plan Yet */}
        {step === "no-plan" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                No plan yet
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                To get started, import your nutrition plan or create one manually.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                size="xl" 
                className="w-full" 
                onClick={handleImportPlan}
              >
                <Upload className="w-5 h-5 mr-2" />
                Import plan
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={handleCreateManually}
              >
                Create manually
              </Button>

              <button 
                className="w-full text-sm text-primary font-medium py-2"
                onClick={() => {/* Show modal explaining why */}}
              >
                Why we ask for your plan
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <Shield className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Wellness support, not medical advice.</span>
              </p>
            </div>

            <button 
              className="w-full text-sm text-muted-foreground py-2"
              onClick={handleStartWithoutPlan}
            >
              Skip for now — I'll add a plan later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
