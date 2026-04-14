import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(true);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});

  // Establish a session from the reset link.
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (accessToken && refreshToken && type === "recovery") {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            setExchangeError(t("resetPassword.expired_error"));
          }
          setIsExchanging(false);
        });
      return;
    }

    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setExchangeError(t("resetPassword.expired_error"));
        }
        setIsExchanging(false);
      });
      return;
    }

    setExchangeError(t("resetPassword.missing_error"));
    setIsExchanging(false);
  }, [t]);

  const validatePassword = (pw: string): string | undefined => {
    if (!pw) return t("resetPassword.error_required");
    if (pw.length < 8) return t("resetPassword.error_min");
    if (!/[A-Z]/.test(pw)) return t("resetPassword.error_uppercase");
    if (!/[0-9]/.test(pw)) return t("resetPassword.error_number");
    return undefined;
  };

  const handleSubmit = async () => {
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? t("resetPassword.error_mismatch") : undefined;
    setErrors({ password: passwordError, confirm: confirmError });
    if (passwordError || confirmError) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success(t("resetPassword.success_toast"));
      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (error: any) {
      setErrors({ general: error.message || t("resetPassword.error_general") });
      toast.error(t("resetPassword.error_toast"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isExchanging) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("resetPassword.verifying")}</p>
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-full max-w-md md:bg-card md:rounded-2xl md:shadow-xl md:border md:border-border md:p-10 flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h1 className="text-lg font-semibold">{t("resetPassword.invalid_title")}</h1>
          <p className="text-sm text-muted-foreground max-w-xs">{exchangeError}</p>
          <Button onClick={() => navigate("/auth")} className="mt-2">
            {t("resetPassword.back_to_signin")}
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-full max-w-md md:bg-card md:rounded-2xl md:shadow-xl md:border md:border-border md:p-10 flex flex-col items-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-success" />
          <h1 className="text-lg font-semibold">{t("resetPassword.updated_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("resetPassword.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:items-center">
        <div className="w-full max-w-md md:bg-card md:rounded-2xl md:shadow-xl md:border md:border-border md:p-10">
        <div className="space-y-6 animate-fade-up">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground">{t("resetPassword.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("resetPassword.subtitle")}
            </p>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">{t("resetPassword.new_password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("resetPassword.new_password_placeholder")}
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

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">{t("resetPassword.confirm_password")}</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("resetPassword.confirm_placeholder")}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
                  }}
                  className={cn("h-12 pr-10", errors.confirm && "border-destructive")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-xs text-destructive mt-1">{errors.confirm}</p>
              )}
            </div>
          </div>

          <Button
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("resetPassword.updating")}
              </>
            ) : (
              t("resetPassword.update_btn")
            )}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
