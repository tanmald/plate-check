import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(true);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});

  // Exchange the recovery code for a session as soon as the page loads
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (!code) {
      setExchangeError("Invalid or missing reset link. Please request a new password reset.");
      setIsExchanging(false);
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setExchangeError("The reset link has expired or is invalid. Please request a new one.");
      }
      setIsExchanging(false);
    });
  }, []);

  const validatePassword = (pw: string): string | undefined => {
    if (!pw) return "Password is required";
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(pw)) return "Password must contain a number";
    return undefined;
  };

  const handleSubmit = async () => {
    const passwordError = validatePassword(password);
    const confirmError = password !== confirmPassword ? "Passwords do not match" : undefined;
    setErrors({ password: passwordError, confirm: confirmError });
    if (passwordError || confirmError) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated successfully");
      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to update password. Please try again." });
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isExchanging) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying reset link…</p>
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-lg font-semibold">Reset link invalid</h1>
        <p className="text-sm text-muted-foreground max-w-xs">{exchangeError}</p>
        <Button onClick={() => navigate("/auth")} className="mt-2">
          Back to sign in
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-success" />
        <h1 className="text-lg font-semibold">Password updated</h1>
        <p className="text-sm text-muted-foreground">Redirecting you to the app…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="space-y-6 animate-fade-up">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground">Set new password</h2>
            <p className="text-sm text-muted-foreground">
              Choose a strong password for your account
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
              <label className="text-sm font-medium mb-2 block text-foreground">New password</label>
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

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Confirm password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
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
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
