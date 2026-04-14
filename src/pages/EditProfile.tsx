import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUserProfile, useUpdateProfile } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { toast } from "sonner";
import { ArrowLeft, Camera, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";
import posthog from "@/lib/posthog";
import { useTranslation } from "react-i18next";

export default function EditProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { updateProfile } = useUpdateProfile();

  const profileSchema = z.object({
    fullName: z.string().min(2, t("editProfile.name_min")).max(100),
    email: z.string().email(t("editProfile.email_invalid")).max(255),
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [originalFullName, setOriginalFullName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; general?: string }>({});
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setOriginalFullName(profile.full_name || "");
      setOriginalEmail(profile.email || user?.email || "");
    } else if (user) {
      setEmail(user.email || "");
      setOriginalEmail(user.email || "");
    }
  }, [profile, user]);

  const hasChanges = useMemo(() => (
    fullName !== originalFullName ||
    email !== originalEmail ||
    avatarUrl !== originalAvatarUrl
  ), [fullName, email, avatarUrl, originalFullName, originalEmail, originalAvatarUrl]);

  const getInitials = () => {
    if (fullName) {
      return fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const validateForm = (): boolean => {
    try {
      profileSchema.parse({ fullName, email });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { fullName?: string; email?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "fullName") newErrors.fullName = err.message;
          else if (err.path[0] === "email") newErrors.email = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setErrors({});
    try {
      await updateProfile({ full_name: fullName, email });
      setOriginalFullName(fullName);
      setOriginalEmail(email);
      setOriginalAvatarUrl(avatarUrl);
      posthog.capture('profile updated', { has_name: !!fullName });
      toast.success(t("editProfile.profile_updated"));
      navigate(-1);
    } catch {
      setErrors({ general: t("editProfile.error_update") });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setPendingNavigation("back");
      setShowDiscardDialog(true);
    } else {
      navigate(-1);
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    if (pendingNavigation === "back") navigate(-1);
    setPendingNavigation(null);
  };

  const handleChangePhoto = () => toast.info(t("editProfile.photo_coming_soon"));
  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    toast.success(t("editProfile.photo_removed"));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border safe-top sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-primary font-medium -ml-1 p-1"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{t("editProfile.title")}</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="px-4 py-6 pb-6 max-w-2xl mx-auto space-y-8">
        {errors.general && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{errors.general}</p>
          </div>
        )}

        <section className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile photo" /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleChangePhoto} className="gap-2">
              <Camera className="w-4 h-4" />
              {t("editProfile.change_photo")}
            </Button>
            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                {t("editProfile.remove_photo")}
              </Button>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              {t("editProfile.full_name")}
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("editProfile.full_name_placeholder")}
              className={errors.fullName ? "border-destructive" : ""}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t("editProfile.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("editProfile.email_placeholder")}
              className={errors.email ? "border-destructive" : ""}
              aria-invalid={!!errors.email}
              aria-describedby="email-helper email-error"
            />
            <p id="email-helper" className="text-xs text-muted-foreground">
              {t("editProfile.email_helper")}
            </p>
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
        <div className="max-w-2xl mx-auto">
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="w-full" size="lg">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("editProfile.saving")}
              </>
            ) : (
              t("editProfile.save")
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("editProfile.discard_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("editProfile.discard_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3">
            <AlertDialogCancel className="flex-1 m-0">{t("editProfile.keep_editing")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscard}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {t("editProfile.discard")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
