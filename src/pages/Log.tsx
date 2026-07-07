import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraView } from "@/components/CameraView";
import { cn } from "@/lib/utils";
import { useCreateMealLog, MealLogResult } from "@/hooks/use-meals";
import { useAuth } from "@/hooks/use-auth";
import posthog from "@/lib/posthog";
import { useTranslation } from "react-i18next";

type Step = "select" | "capture" | "analyzing";

export default function Log() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const createMealLog = useCreateMealLog();

  const mealTypes = [
    { id: "breakfast", label: t("log.breakfast"), icon: "🌅", time: t("log.breakfast_time") },
    { id: "lunch",     label: t("log.lunch"),     icon: "☀️",  time: t("log.lunch_time") },
    { id: "dinner",    label: t("log.dinner"),    icon: "🌙", time: t("log.dinner_time") },
    { id: "snack",     label: t("log.snack"),     icon: "🍎", time: t("log.snack_time") },
  ];

  const handleMealSelect = (mealId: string) => {
    setSelectedMealType(mealId);
    setStep("capture");
    posthog.capture('meal logging started', { meal_type: mealId });
  };

  const handleFileSelect = (file: File) => {
    if (!selectedMealType) return;

    setCapturedPhoto(file);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setStep("analyzing");

    posthog.capture('meal photo submitted', { meal_type: selectedMealType });

    createMealLog.mutate(
      { photoFile: file, mealType: selectedMealType },
      {
        onSuccess: (analysisResult) => {
          posthog.capture('meal logged', { meal_type: selectedMealType });
          navigate("/meal-result", {
            state: {
              mealType: selectedMealType,
              analysisResult,
              photoPreview: preview,
              mealLogId: analysisResult.mealLogId,
            },
          });
        },
        onError: (error) => {
          console.error("Error analyzing meal:", error);
          toast.error(t("log.error_analyze"));
          setStep("capture");
          setCapturedPhoto(null);
          if (photoPreview) URL.revokeObjectURL(photoPreview);
          setPhotoPreview(null);
        },
      }
    );
  };

  const handleCapture = () => setShowCamera(true);
  const handleGallery = () => galleryInputRef.current?.click();

  const handleBack = () => {
    if (step === "capture") {
      setStep("select");
      setSelectedMealType(null);
      setCapturedPhoto(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const selectedMealLabel = mealTypes.find(m => m.id === selectedMealType)?.label ?? selectedMealType ?? "";

  return (
    <div className="min-h-screen bg-background pb-6 md:pb-0">
      {showCamera && (
        <CameraView
          onCapture={(file) => { setShowCamera(false); handleFileSelect(file); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {step === "capture" && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                {t("common.back")}
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("log.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {step === "select" && t("log.step_select")}
                {step === "capture" && t("log.step_capture", { mealType: selectedMealLabel })}
                {step === "analyzing" && t("log.step_analyzing")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {step === "select" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              {t("log.select_hint")}
            </p>

            <div className="space-y-3">
              {mealTypes.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => handleMealSelect(meal.id)}
                  className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left card-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                    <span className="text-3xl">{meal.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{meal.label}</h3>
                    <p className="text-sm text-muted-foreground">{meal.time}</p>
                  </div>
                  <div className="text-muted-foreground">→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <span className="text-2xl">
                {mealTypes.find(m => m.id === selectedMealType)?.icon}
              </span>
              <span className="font-medium">
                {mealTypes.find(m => m.id === selectedMealType)?.label}
              </span>
            </div>

            <div className="aspect-[4/3] bg-secondary rounded-2xl flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-1">{t("log.take_photo")}</p>
                <p className="text-sm text-muted-foreground/70">{t("log.center_plate")}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={handleGallery}>
                <Image className="w-5 h-5 mr-2" />
                {t("log.gallery")}
              </Button>
              <Button size="lg" className="flex-[2]" onClick={handleCapture}>
                <Camera className="w-5 h-5 mr-2" />
                {t("log.take_photo_btn")}
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-2">{t("log.photo_tips_title")}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>{t("log.photo_tips_1")}</li>
                <li>{t("log.photo_tips_2")}</li>
                <li>{t("log.photo_tips_3")}</li>
              </ul>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            {photoPreview && (
              <div className="w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden relative">
                <img src={photoPreview} alt="Meal preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
              </div>
            )}

            {!photoPreview && (
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{t("log.analyzing_title")}</h3>
              <p className="text-muted-foreground">{t("log.analyzing_desc")}</p>
            </div>

            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
