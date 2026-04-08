import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ChevronLeft,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import posthog from "@/lib/posthog";

type AuthStep = "welcome" | "signup" | "signin" | "forgot-password" | "check-email";

interface FormErrors {
  email?: string;
  password?: string;
  terms?: string;
  general?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signUp, signIn, resetPassword } = useAuth();

  const initialMode = searchParams.get("mode") === "signin" ? "signin" : "welcome";
  const [step, setStep] = useState<AuthStep>(initialMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // If already authenticated, go home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return undefined;
  };

  const handleSignUp = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const termsError = !termsAccepted ? "You must accept the terms" : undefined;
    setErrors({ email: emailError, password: passwordError, terms: termsError });
    if (emailError || passwordError || termsError) return;

    setIsLoading(true);
    try {
      await signUp(email, password);
      posthog.identify({ distinctId: email, properties: { email } });
      posthog.capture({
        distinctId: email,
        event: 'user signed up',
        properties: { login_type: 'email' },
      });
      setStep("check-email");
    } catch (error: any) {
      posthog.captureException(error, email);
      setErrors({ general: error.message || "Sign up failed. Please try again." });
      toast.error("Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    const emailError = validateEmail(email);
    const passwordError = !password ? "Password is required" : undefined;
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      posthog.identify({ distinctId: email, properties: { email } });
      posthog.capture({
        distinctId: email,
        event: 'user signed in',
        properties: { login_type: 'email' },
      });
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (error: any) {
      posthog.captureException(error, email);
      setErrors({ general: error.message || "Invalid email or password" });
      toast.error("Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    if (emailError) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      posthog.capture({
        distinctId: email,
        event: 'password reset requested',
      });
      toast.success("Password reset email sent");
      setErrors({ general: "Check your email for reset instructions" });
    } catch (error: any) {
      posthog.captureException(error, email);
      setErrors({ general: error.message || "Failed to send reset email" });
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate("/onboarding", { replace: true });
  };

  const handleBack = () => {
    if (step === "signup" || step === "signin") {
      setStep("welcome");
    } else if (step === "forgot-password") {
      setStep("signin");
    } else if (step === "check-email") {
      setStep("signup");
    } else {
      navigate("/landing");
    }
    setErrors({});
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Terms of Service coming soon");
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Privacy Policy coming soon");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="safe-top px-4 pt-4 flex items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2"
          disabled={isLoading}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* ── Welcome ──────────────────────────────────────── */}
        {step === "welcome" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto">
                <span className="text-3xl">🥗</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome to PlateCheck
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px] mx-auto">
                Create an account or sign in to save your plan and track progress
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
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
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
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                <FileText className="w-5 h-5 flex-shrink-0" />
                Continue with Email
              </Button>
            </div>

            <div className="text-center">
              <button
                className="text-sm text-primary font-semibold"
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

        {/* ── Sign Up ──────────────────────────────────────── */}
        {step === "signup" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-sm text-muted-foreground">Start tracking your nutrition journey</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
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
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
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
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
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
                    if (errors.terms) setErrors((p) => ({ ...p, terms: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(errors.terms && "border-destructive")}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the{" "}
                  <a href="#" onClick={handleTermsClick} className="text-primary underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" onClick={handlePrivacyClick} className="text-primary underline">
                    Privacy Policy
                  </a>
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

            <div className="text-center">
              <button
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signin")}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}

        {/* ── Sign In ──────────────────────────────────────── */}
        {step === "signin" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to continue tracking</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
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
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
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
                    className="text-sm text-primary font-medium"
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
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
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
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signup")}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        )}

        {/* ── Check Email ──────────────────────────────────── */}
        {step === "check-email" && (
          <div className="space-y-6 animate-fade-up text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a confirmation link to
              </p>
              <p className="text-sm font-semibold text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click the link to confirm your account and get started.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                size="xl"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await signUp(email, password);
                    toast.success("Confirmation email resent");
                  } catch {
                    toast.error("Failed to resend email");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resend email"}
              </Button>
              <button
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signin")}
              >
                Already confirmed? Sign in
              </button>
            </div>
          </div>
        )}

        {/* ── Forgot Password ──────────────────────────────── */}
        {step === "forgot-password" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">Reset password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive reset instructions
              </p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl border border-success/20">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
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
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
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
      </div>
    </div>
  );
}
