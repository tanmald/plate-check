import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateNutritionPlan } from "@/hooks/use-nutrition-plan";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface EditPlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planName: string;
  onDeleteClick: () => void;
}

export function EditPlanSheet({
  open,
  onOpenChange,
  planId,
  planName,
  onDeleteClick,
}: EditPlanSheetProps) {
  const [name, setName] = useState(planName);
  const updatePlan = useUpdateNutritionPlan();

  const hasChanges = name.trim() !== planName;
  const isValid = name.trim().length > 0;

  // Reset name when sheet opens with new plan name
  useEffect(() => {
    if (open) {
      setName(planName);
    }
  }, [open, planName]);

  const handleSave = () => {
    if (!hasChanges || !isValid) return;

    updatePlan.mutate(
      { planId, name: name.trim() },
      {
        onSuccess: () => {
          toast.success("Plan name updated");
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error updating plan:", error);
          toast.error("Failed to update plan name");
        },
      }
    );
  };

  const handleDelete = () => {
    onOpenChange(false);
    // Small delay to allow sheet to close before opening dialog
    setTimeout(() => {
      onDeleteClick();
    }, 150);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle>Edit Plan</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Nutrition Plan"
            />
          </div>

          {/* Save Button */}
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!hasChanges || !isValid || updatePlan.isPending}
          >
            {updatePlan.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Danger Zone
            </p>
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Plan
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
