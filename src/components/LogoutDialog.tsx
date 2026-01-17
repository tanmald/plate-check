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

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LogoutState = "confirm" | "loading" | "error" | "expired";

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [state, setState] = useState<LogoutState>("confirm");

  const handleLogout = async () => {
    setState("loading");

    try {
      await signOut();

      // Close dialog
      onOpenChange(false);
      setState("confirm");

      // Show success toast
      toast.success("Logged out successfully");

      // Navigate to onboarding/login with replace to prevent back navigation
      navigate("/onboarding", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setState("error");
    }
  };

  const handleRetry = () => {
    handleLogout();
  };

  const handleCancel = () => {
    setState("confirm");
    onOpenChange(false);
  };

  const handleGoToSignIn = () => {
    setState("confirm");
    onOpenChange(false);
    navigate("/onboarding", { replace: true });
  };

  // Confirmation state
  if (state === "confirm") {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Log out?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You'll need to sign in again to access your plan and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleLogout}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleCancel} className="w-full mt-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
          <p className="text-xs text-center text-muted-foreground -mt-2">
            This does not delete your data.
          </p>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Loading state
  if (state === "loading") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-foreground">Logging out…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Securing your account.
              </p>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Network error state
  if (state === "error") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <WifiOff className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">
              We couldn't log you out right now.
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Please check your connection and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={handleRetry} className="w-full">
              Try again
            </Button>
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Session expired state
  if (state === "expired") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2">
              <LogOut className="w-7 h-7 text-muted-foreground" />
            </div>
            <AlertDialogTitle className="text-center">
              You're already logged out.
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your session has expired.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <Button onClick={handleGoToSignIn} className="w-full">
              Go to sign in
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
