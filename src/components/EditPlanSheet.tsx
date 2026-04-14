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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
          toast.success(t("editPlan.success_toast"));
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error updating plan:", error);
          toast.error(t("editPlan.error_toast"));
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
          <SheetTitle>{t("editPlan.title")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="plan-name">{t("editPlan.name_label")}</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("editPlan.name_placeholder")}
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
                {t("editPlan.saving")}
              </>
            ) : (
              t("editPlan.save")
            )}
          </Button>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              {t("editPlan.danger_zone")}
            </p>
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("editPlan.delete_plan")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
