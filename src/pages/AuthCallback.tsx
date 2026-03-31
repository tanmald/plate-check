import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      // PKCE flow: exchange the code for a session
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setError("The confirmation link has expired or is invalid. Please request a new one.");
          }
          // On success, onAuthStateChange in AuthContext fires → user is set → ProtectedRoute
          // redirects to home automatically. No need to navigate here.
        });
    } else {
      // No code in URL — check if there's already an active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/", { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }
      });
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-lg font-semibold">Confirmation failed</h1>
        <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        <Button onClick={() => navigate("/auth")} className="mt-2">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Confirming your account…</p>
    </div>
  );
}
