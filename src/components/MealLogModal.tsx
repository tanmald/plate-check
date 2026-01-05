import { useState } from "react";
import { X, Camera, Image, Sparkles, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdherenceScore } from "./AdherenceScore";
import { cn } from "@/lib/utils";

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "capture" | "analyzing" | "result";

export function MealLogModal({ isOpen, onClose }: MealLogModalProps) {
  const [step, setStep] = useState<Step>("capture");
  const [selectedMealType, setSelectedMealType] = useState<string>("lunch");

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", icon: "🌅" },
    { id: "lunch", label: "Lunch", icon: "☀️" },
    { id: "dinner", label: "Dinner", icon: "🌙" },
    { id: "snack", label: "Snack", icon: "🍎" },
  ];

  const mockResult = {
    score: 78,
    detectedFoods: [
      { name: "Grilled chicken breast", matched: true },
      { name: "Brown rice", matched: true },
      { name: "Steamed broccoli", matched: true },
      { name: "Caesar dressing", matched: false },
    ],
    feedback: "Great protein choice! The chicken and rice match your lunch template. Consider using olive oil instead of Caesar dressing for better plan adherence.",
    confidence: "high" as const,
  };

  const handleCapture = () => {
    setStep("analyzing");
    // Simulate AI analysis
    setTimeout(() => {
      setStep("result");
    }, 2000);
  };

  const handleSave = () => {
    onClose();
    setStep("capture");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => { onClose(); setStep("capture"); }}>
          <X className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold text-lg">Log Meal</h2>
        <div className="w-10" />
      </div>

      <div className="flex flex-col h-[calc(100%-64px)] overflow-auto">
        {step === "capture" && (
          <div className="flex-1 flex flex-col p-4 gap-6">
            {/* Meal type selector */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Meal type</p>
              <div className="flex gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedMealType(type.id)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all",
                      selectedMealType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      selectedMealType === type.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera preview area */}
            <div className="flex-1 bg-secondary rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-1">Take a photo of your meal</p>
                <p className="text-sm text-muted-foreground/70">or select from gallery</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1">
                <Image className="w-5 h-5 mr-2" />
                Gallery
              </Button>
              <Button size="lg" className="flex-[2]" onClick={handleCapture}>
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Analyzing your meal...</h3>
              <p className="text-muted-foreground">Detecting foods and checking against your plan</p>
            </div>
            <div className="w-48">
              <Progress value={65} className="animate-pulse" />
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="flex-1 flex flex-col p-4 gap-6 pb-24">
            {/* Score */}
            <div className="flex justify-center pt-4">
              <AdherenceScore score={mockResult.score} size="lg" />
            </div>

            {/* Detected foods */}
            <Card className="card-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Detected Foods</h3>
                <div className="space-y-2">
                  {mockResult.detectedFoods.map((food, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        food.matched ? "bg-success/10" : "bg-warning/10"
                      )}
                    >
                      {food.matched ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      )}
                      <span className={cn(
                        "font-medium",
                        food.matched ? "text-success" : "text-warning"
                      )}>
                        {food.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Feedback */}
            <Card className="card-shadow border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">AI Feedback</h3>
                    <p className="text-sm text-muted-foreground">{mockResult.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
              <Button size="xl" className="w-full" onClick={handleSave}>
                Save Meal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
