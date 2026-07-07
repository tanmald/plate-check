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
import { useTranslation } from "react-i18next";

type AuthStep = "welcome" | "signup" | "signin" | "forgot-password" | "check-email";

interface FormErrors {
  email?: string;
  password?: string;
  terms?: string;
  general?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const validateEmail = (val: string): string | undefined => {
    if (!val) return t("auth.error_email_required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t("auth.error_email_invalid");
    return undefined;
  };

  const validatePassword = (val: string): string | undefined => {
    if (!val) return t("auth.error_password_required");
    if (val.length < 8) return t("auth.error_password_min");
    if (!/[A-Z]/.test(val)) return t("auth.error_password_uppercase");
    if (!/[0-9]/.test(val)) return t("auth.error_password_number");
    return undefined;
  };

  const handleSignUp = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const termsError = !termsAccepted ? t("auth.error_terms") : undefined;
    setErrors({ email: emailError, password: passwordError, terms: termsError });
    if (emailError || passwordError || termsError) return;

    setIsLoading(true);
    try {
      await signUp(email, password);
      posthog.identify(email, { email });
      posthog.capture('user signed up', { login_type: 'email' });
      setStep("check-email");
    } catch (error: any) {
      setErrors({ general: error.message || t("auth.error_signup") });
      toast.error(t("auth.signup_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    const emailError = validateEmail(email);
    const passwordError = !password ? t("auth.error_password_required") : undefined;
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      posthog.identify(email, { email });
      posthog.capture('user signed in', { login_type: 'email' });
      toast.success(t("auth.welcome_back"));
      navigate("/", { replace: true });
    } catch (error: any) {
      setErrors({ general: error.message || t("auth.error_signin") });
      toast.error(t("auth.signin_failed"));
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
      posthog.capture('password reset requested');
      toast.success(t("auth.reset_sent_toast"));
      setErrors({ general: t("auth.reset_check_email") });
    } catch (error: any) {
      setErrors({ general: error.message || t("auth.reset_failed_toast") });
      toast.error(t("auth.reset_failed_toast"));
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
    toast.info(t("auth.terms_coming_soon"));
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info(t("auth.privacy_coming_soon"));
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
          <span className="text-sm">{t("auth.back")}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:items-center">
        <div className="w-full max-w-md md:bg-card md:rounded-2xl md:shadow-xl md:border md:border-border md:p-10">
        {/* ── Welcome ──────────────────────────────────────── */}
        {step === "welcome" && (
          <div className="space-y-8 animate-fade-up">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto">
                <span className="text-3xl">🥗</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("auth.welcome_title_simple")}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px] mx-auto">
                {t("auth.welcome_desc")}
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
                {t("auth.continue_apple")}
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
                {t("auth.continue_google")}
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="w-full justify-start gap-3"
                onClick={() => setStep("signup")}
                disabled={isLoading}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                {t("auth.continue_email")}
              </Button>
            </div>

            <div className="text-center">
              <button
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signin")}
              >
                {t("auth.have_account_link")}
              </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              {t("auth.privacy_note")}
            </p>
          </div>
        )}

        {/* ── Sign Up ──────────────────────────────────────── */}
        {step === "signup" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">{t("auth.sign_up_title")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.sign_up_subtitle")}</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">{t("auth.email_label")}</label>
                <Input
                  type="email"
                  placeholder={t("auth.email_placeholder")}
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
                <label className="text-sm font-medium mb-2 block text-foreground">{t("auth.password_label")}</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password_hint")}
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
                  {t("auth.terms_agree")}{" "}
                  <a href="#" onClick={handleTermsClick} className="text-primary underline">
                    {t("auth.terms_service")}
                  </a>{" "}
                  {t("auth.terms_and")}{" "}
                  <a href="#" onClick={handlePrivacyClick} className="text-primary underline">
                    {t("auth.privacy_link")}
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
                    {t("auth.creating_account")}
                  </>
                ) : (
                  t("auth.create_account")
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("welcome")}
                disabled={isLoading}
              >
                {t("auth.back")}
              </Button>
            </div>

            <div className="text-center">
              <button
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signin")}
              >
                {t("auth.have_account_link")}
              </button>
            </div>
          </div>
        )}

        {/* ── Sign In ──────────────────────────────────────── */}
        {step === "signin" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">{t("auth.sign_in_title")}</h2>
              <p className="text-sm text-muted-foreground">{t("auth.sign_in_subtitle_short")}</p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">{t("auth.email_label")}</label>
                <Input
                  type="email"
                  placeholder={t("auth.email_placeholder")}
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
                  <label className="text-sm font-medium text-foreground">{t("auth.password_label")}</label>
                  <button
                    className="text-sm text-primary font-medium"
                    onClick={() => setStep("forgot-password")}
                  >
                    {t("auth.forgot_password")}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password_placeholder")}
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
                    {t("auth.signing_in")}
                  </>
                ) : (
                  t("auth.sign_in")
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("welcome")}
                disabled={isLoading}
              >
                {t("auth.back")}
              </Button>
            </div>

            <div className="text-center">
              <button
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signup")}
              >
                {t("auth.no_account_link")}
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
              <h2 className="text-2xl font-bold text-foreground">{t("auth.check_email_title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("auth.check_email_sent")}
              </p>
              <p className="text-sm font-semibold text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("auth.check_email_click")}
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
                    toast.success(t("auth.resend_success"));
                  } catch {
                    toast.error(t("auth.resend_fail"));
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("auth.resend_email")}
              </Button>
              <button
                className="text-sm text-primary font-semibold"
                onClick={() => setStep("signin")}
              >
                {t("auth.already_confirmed")}
              </button>
            </div>
          </div>
        )}

        {/* ── Forgot Password ──────────────────────────────── */}
        {step === "forgot-password" && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">{t("auth.reset_title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("auth.reset_subtitle")}
              </p>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl border border-success/20">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-sm text-success">{errors.general}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">{t("auth.email_label")}</label>
              <Input
                type="email"
                placeholder={t("auth.email_placeholder")}
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
                    {t("auth.sending")}
                  </>
                ) : (
                  t("auth.send_reset")
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("signin")}
                disabled={isLoading}
              >
                {t("auth.back_to_sign_in")}
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
