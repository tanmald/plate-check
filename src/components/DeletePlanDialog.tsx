import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteNutritionPlan } from "@/hooks/use-nutrition-plan";
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
import { Loader2, WifiOff, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeleteState = "confirm" | "loading" | "error";

export function DeletePlanDialog({ open, onOpenChange }: DeletePlanDialogProps) {
  const navigate = useNavigate();
  const deletePlan = useDeleteNutritionPlan();
  const [state, setState] = useState<DeleteState>("confirm");

  const handleDelete = async () => {
    setState("loading");

    try {
      await deletePlan.mutateAsync();

      // Close dialog
      onOpenChange(false);
      setState("confirm");

      // Show success toast
      toast.success("Plan deleted successfully");

      // Navigate to plan page (will show empty state)
      navigate("/plan");
    } catch (error) {
      console.error("Delete plan error:", error);
      setState("error");
    }
  };

  const handleRetry = () => {
    handleDelete();
  };

  const handleCancel = () => {
    setState("confirm");
    onOpenChange(false);
  };

  // Confirmation state
  if (state === "confirm") {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Delete your nutrition plan?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This will remove your current plan and all meal templates. You'll be able to upload a new plan afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Plan
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleCancel} className="w-full mt-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
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
              <p className="font-semibold text-foreground">Deleting plan…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Removing your nutrition plan.
              </p>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <WifiOff className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">
              We couldn't delete your plan right now.
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

  return null;
}
