import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import posthog from "@/lib/posthog";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleImportPlan = () => {
    posthog.capture('onboarding completed', { choice: 'import_plan' });
    navigate("/plan");
  };
  const handleCreateManually = () => {
    posthog.capture('onboarding completed', { choice: 'create_manually' });
    navigate("/plan");
  };
  const handleStartWithoutPlan = () => {
    posthog.capture('onboarding completed', { choice: 'skip' });
    navigate("/");
  };

  const handleWhyPlan = () => {
    toast.info(
      "PlateCheck compares your meals to your nutrition plan to give you personalized feedback and track your adherence over time."
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="space-y-8 animate-fade-up">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              One last step
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
              Import your nutrition plan so PlateCheck can check your meals against it.
            </p>
          </div>

          <div className="space-y-3">
            <Button size="xl" className="w-full" onClick={handleImportPlan}>
              <Upload className="w-5 h-5 mr-2" />
              Import my plan
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleCreateManually}
            >
              Create manually
            </Button>

            <button
              className="w-full text-sm text-primary font-medium py-2"
              onClick={handleWhyPlan}
            >
              Why do I need a plan?
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 bg-secondary rounded-2xl">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Wellness support, not medical advice.</span>
            </p>
          </div>

          <button
            className="w-full text-sm text-muted-foreground py-2"
            onClick={handleStartWithoutPlan}
          >
            Skip for now — I'll add a plan later
          </button>
        </div>
      </div>
    </div>
  );
}
