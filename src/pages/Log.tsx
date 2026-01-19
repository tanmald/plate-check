import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { useCreateMealLog } from "@/hooks/use-meals";

type Step = "select" | "capture" | "analyzing";

const mealTypes = [
  { id: "breakfast", label: "Breakfast", icon: "🌅", time: "6:00 AM - 10:00 AM" },
  { id: "lunch", label: "Lunch", icon: "☀️", time: "11:00 AM - 2:00 PM" },
  { id: "dinner", label: "Dinner", icon: "🌙", time: "5:00 PM - 9:00 PM" },
  { id: "snack", label: "Snack", icon: "🍎", time: "Any time" },
];

export default function Log() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select");
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const createMealLog = useCreateMealLog();

  const handleMealSelect = (mealId: string) => {
    setSelectedMealType(mealId);
    setStep("capture");
  };

  const handleFileSelect = (file: File) => {
    if (!selectedMealType) return;

    // Store file and create preview
    setCapturedPhoto(file);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);

    // Move to analyzing step
    setStep("analyzing");

    // Call the mutation to upload and analyze
    createMealLog.mutate(
      {
        photoFile: file,
        mealType: selectedMealType,
      },
      {
        onSuccess: (analysisResult) => {
          // Navigate to result page with real data
          navigate("/meal-result", {
            state: {
              mealType: selectedMealType,
              analysisResult,
              photoPreview: preview,
            },
          });
        },
        onError: (error) => {
          console.error("Error analyzing meal:", error);
          toast.error("Failed to analyze meal. Please try again.");

          // Reset to capture step
          setStep("capture");
          setCapturedPhoto(null);
          if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
          }
          setPhotoPreview(null);
        },
      }
    );
  };

  const handleCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleBack = () => {
    if (step === "capture") {
      setStep("select");
      setSelectedMealType(null);
      setCapturedPhoto(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
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
                ← Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Log Meal</h1>
              <p className="text-sm text-muted-foreground">
                {step === "select" && "What meal are you logging?"}
                {step === "capture" && `Capture your ${selectedMealType}`}
                {step === "analyzing" && "Analyzing..."}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {step === "select" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Select the meal type, then take a photo or choose from your gallery.
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
            {/* Selected meal indicator */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <span className="text-2xl">
                {mealTypes.find(m => m.id === selectedMealType)?.icon}
              </span>
              <span className="font-medium">
                {mealTypes.find(m => m.id === selectedMealType)?.label}
              </span>
            </div>

            {/* Camera preview area */}
            <div className="aspect-[4/3] bg-secondary rounded-2xl flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-1">Take a photo of your meal</p>
                <p className="text-sm text-muted-foreground/70">Center your plate in the frame</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={handleGallery}>
                <Image className="w-5 h-5 mr-2" />
                Gallery
              </Button>
              <Button size="lg" className="flex-[2]" onClick={handleCapture}>
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-2">📸 Photo tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Good lighting helps identify foods better</li>
                <li>• Include all items on your plate</li>
                <li>• Avoid shadows covering your food</li>
              </ul>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            {/* Photo preview */}
            {photoPreview && (
              <div className="w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden relative">
                <img
                  src={photoPreview}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
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
              <h3 className="text-xl font-semibold mb-2">Analyzing your meal...</h3>
              <p className="text-muted-foreground">Detecting foods and checking against your plan</p>
            </div>

            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
