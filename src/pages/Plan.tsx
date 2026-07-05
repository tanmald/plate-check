import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { PlanPageSkeleton } from "@/components/PageSkeletons";
import { PlanEmptyState } from "@/components/PlanEmptyState";
import { PlanImportingState } from "@/components/PlanImportingState";
import { PlanReviewState } from "@/components/PlanReviewState";
import { PlanActiveState } from "@/components/PlanActiveState";
import { EditPlanSheet } from "@/components/EditPlanSheet";
import { DeletePlanDialog } from "@/components/DeletePlanDialog";
import {
  useNutritionPlan,
  useImportNutritionPlan,
  useConfirmNutritionPlan,
  computeDailyTargets,
} from "@/hooks/use-nutrition-plan";
import { ParsePlanResponse } from "@/lib/api";
import { toast } from "sonner";
import { CalendarDays, FileText, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";
import { ShoppingListView } from "@/components/ShoppingListView";
import { getWeekStartDate } from "@/hooks/use-weekly-plan";
import posthog from "@/lib/posthog";

type ViewState = "empty" | "importing" | "review" | "active";
type PlanTab = "plan" | "week" | "shopping";

export default function Plan() {
  const navigate = useNavigate();
  const { data: planData, isLoading } = useNutritionPlan();
  const [viewState, setViewState] = useState<ViewState>("empty");
  const [isReplacingPlan, setIsReplacingPlan] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [parsedPlan, setParsedPlan] = useState<ParsePlanResponse | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PlanTab>("plan");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importPlan = useImportNutritionPlan();
  const confirmPlan = useConfirmNutritionPlan();
  const weekStartDate = getWeekStartDate();

  const hasPlan = planData?.hasPlan || false;
  const plan = planData?.plan;
  const dailyTargets = plan ? computeDailyTargets(plan.templates) : null;
  const showUploadFlow = !hasPlan || isReplacingPlan;

  const handleImportStart = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (file: File) => {
    setViewState("importing");

    importPlan.mutate(
      { file },
      {
        onSuccess: (result) => {
          posthog.capture('nutrition plan imported', {
            plan_name: result.planName,
            confidence: result.confidence,
            template_count: result.mealTemplates.length,
            warnings_count: result.warnings.length,
          });
          setParsedPlan(result);
          setViewState("review");
        },
        onError: (error) => {
          console.error("Error importing plan:", error);
          toast.error("Failed to parse plan. Please try again.");
          setViewState("empty");
          setParsedPlan(null);
        },
      }
    );
  };

  const handleConfirmPlan = () => {
    if (!parsedPlan) {
      toast.error("No plan to confirm");
      return;
    }

    confirmPlan.mutate(parsedPlan, {
      onSuccess: () => {
        posthog.capture('nutrition plan confirmed', {
          plan_name: parsedPlan.planName,
          template_count: parsedPlan.mealTemplates.length,
        });
        toast.success("Plan confirmed successfully!");
        setViewState("active");
        setIsReplacingPlan(false);
        setParsedPlan(null);
      },
      onError: (error) => {
        console.error("Error confirming plan:", error);
        toast.error("Failed to save plan. Please try again.");
      },
    });
  };

  const handleReplacePlan = () => {
    setIsReplacingPlan(true);
    setViewState("empty");
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/plan/template/${templateId}`);
  };

  const handleAddTemplate = () => {
    navigate("/plan/template/new");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Header */}
      <header className="bg-card border-b border-border safe-top">
        <div className="px-4 pt-4 pb-0">
          <h1 className="text-2xl font-bold text-foreground">Plano</h1>

          {/* Tab bar */}
          <div className="flex gap-1 mt-3">
            {([
              { key: "plan",     label: "Meu Plano",    icon: FileText },
              { key: "week",     label: "Esta Semana",  icon: CalendarDays },
              { key: "shopping", label: "Compras",       icon: ShoppingCart },
            ] as { key: PlanTab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* ── This Week tab ── */}
        {activeTab === "week" && (
          hasPlan ? (
            <WeeklyPlanner onShoppingListGenerated={() => setActiveTab("shopping")} />
          ) : (
            <div className="text-center py-12 space-y-3">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="font-medium">Importa primeiro o teu plano nutricional</p>
              <p className="text-sm text-muted-foreground">
                Para planear a ementa semanal precisas de um plano activo.
              </p>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("plan")}>
                Ir para Meu Plano
              </Button>
            </div>
          )
        )}

        {/* ── Shopping tab ── */}
        {activeTab === "shopping" && (
          hasPlan ? (
            <ShoppingListView weekStartDate={weekStartDate} />
          ) : (
            <div className="text-center py-12 space-y-3">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="font-medium">Importa primeiro o teu plano nutricional</p>
              <p className="text-sm text-muted-foreground">
                Precisas de um plano activo para gerar listas de compras.
              </p>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("plan")}>
                Ir para Meu Plano
              </Button>
            </div>
          )
        )}

        {/* ── My Plan tab ── */}
        {activeTab === "plan" && isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : activeTab === "plan" && showUploadFlow && viewState === "empty" ? (
          <PlanEmptyState onImportStart={handleImportStart} />
        ) : activeTab === "plan" && viewState === "importing" ? (
          <PlanImportingState />
        ) : activeTab === "plan" && viewState === "review" && parsedPlan ? (
          <PlanReviewState
            parsedPlan={parsedPlan}
            onConfirm={handleConfirmPlan}
            isConfirming={confirmPlan.isPending}
          />
        ) : activeTab === "plan" && hasPlan && plan ? (
          <PlanActiveState
            plan={plan}
            dailyTargets={dailyTargets}
            selectedTemplate={selectedTemplate}
            onToggleTemplate={(templateId) =>
              setSelectedTemplate(selectedTemplate === templateId ? null : templateId)
            }
            onEditTemplate={handleEditTemplate}
            onAddTemplate={handleAddTemplate}
            onEditPlan={() => setEditPlanOpen(true)}
            onReplacePlan={handleReplacePlan}
          />
        ) : null}
      </main>

      <BottomNav />

      {/* Edit Plan Sheet */}
      {plan && (
        <EditPlanSheet
          open={editPlanOpen}
          onOpenChange={setEditPlanOpen}
          planId={plan.id}
          planName={plan.name}
          onDeleteClick={() => setDeleteDialogOpen(true)}
        />
      )}

      {/* Delete Plan Dialog */}
      <DeletePlanDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
