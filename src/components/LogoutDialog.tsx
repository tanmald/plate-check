import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, WifiOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import posthog from "@/lib/posthog";
import { useTranslation } from "react-i18next";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LogoutState = "confirm" | "loading" | "error" | "expired";

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [state, setState] = useState<LogoutState>("confirm");

  const handleLogout = async () => {
    setState("loading");
    try {
      await signOut();
      posthog.capture('user logged out');
      onOpenChange(false);
      setState("confirm");
      toast.success(t("dialogs.logged_out"));
      navigate("/landing", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setState("error");
    }
  };

  const handleRetry = () => handleLogout();

  const handleCancel = () => {
    setState("confirm");
    onOpenChange(false);
  };

  const handleGoToSignIn = () => {
    setState("confirm");
    onOpenChange(false);
    navigate("/landing", { replace: true });
  };

  if (state === "confirm") {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{t("dialogs.logout_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("dialogs.logout_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleLogout}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("dialogs.logout_confirm")}
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleCancel} className="w-full mt-0">
              {t("common.cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
          <p className="text-xs text-center text-muted-foreground -mt-2">
            {t("dialogs.logout_data_note")}
          </p>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (state === "loading") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-foreground">{t("dialogs.logout_loading")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("dialogs.logout_securing")}</p>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (state === "error") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <WifiOff className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">{t("dialogs.logout_error_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("common.error_connection")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={handleRetry} className="w-full">{t("common.retry")}</Button>
            <Button variant="outline" onClick={handleCancel} className="w-full">{t("common.cancel")}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (state === "expired") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2">
              <LogOut className="w-7 h-7 text-muted-foreground" />
            </div>
            <AlertDialogTitle className="text-center">{t("dialogs.logout_expired_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("dialogs.logout_expired_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <Button onClick={handleGoToSignIn} className="w-full">{t("dialogs.go_to_signin")}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
