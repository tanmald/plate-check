import type { ElementType } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  Circle,
  Droplet,
  Dumbbell,
  ExternalLink,
  Utensils,
} from "lucide-react";
import type { ChallengeTaskDef, ChallengeTaskState } from "@/hooks/use-challenges";

const TASK_ICONS: Record<string, ElementType> = {
  diet: Utensils,
  water: Droplet,
  workout1: Dumbbell,
  workout2: Dumbbell,
  reading: BookOpen,
  photo: Camera,
};

interface TaskDetailProps {
  taskDef: ChallengeTaskDef;
  state?: ChallengeTaskState;
  onUpdate: (patch: Partial<ChallengeTaskState>) => void;
  disabled?: boolean;
}

interface ChallengeTaskRowProps extends TaskDetailProps {
  onPhotoCapture: () => void;
}

export function ChallengeTaskRow({ taskDef, state, onUpdate, onPhotoCapture, disabled }: ChallengeTaskRowProps) {
  const { t } = useTranslation();
  const done = state?.done ?? false;
  const Icon = TASK_ICONS[taskDef.key] ?? Circle;

  return (
    <Card className={cn("card-shadow transition-colors", done && "border-success/40 bg-success/5")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
              done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{taskDef.label}</p>
            {taskDef.type === "meal_adherence" && (
              <DietTaskDetail taskDef={taskDef} state={state} onUpdate={onUpdate} disabled={disabled} />
            )}
            {taskDef.type === "counter" && (
              <CounterTaskDetail taskDef={taskDef} state={state} onUpdate={onUpdate} disabled={disabled} />
            )}
            {taskDef.type === "activity" && (
              <ActivityTaskDetail taskDef={taskDef} state={state} onUpdate={onUpdate} disabled={disabled} />
            )}
            {taskDef.type === "photo" && (
              <PhotoTaskDetail state={state} onCapture={onPhotoCapture} disabled={disabled} />
            )}
          </div>
          {/* Every task is tickable by hand, whatever its own rule says — the
              counters and steppers are there to help, not to gatekeep. */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onUpdate({ done: !done, manual_override: true })}
            aria-pressed={done}
            aria-label={done ? t("challenges.mark_not_done") : t("challenges.mark_done")}
            className="shrink-0 rounded-full transition-transform active:scale-90 disabled:opacity-40"
          >
            {done ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function DietTaskDetail({ state, onUpdate, disabled }: TaskDetailProps) {
  const { t } = useTranslation();
  const mealsScored = state?.meals_scored ?? 0;
  const mealsRequired = state?.meals_required ?? 1;
  const minScore = state?.min_score ?? 70;
  const done = state?.done ?? false;
  const autoVerified = done && !state?.manual_override;

  // Toggling alcohol has to re-derive `done` here as well as server-side —
  // otherwise the write recomputes the day's completion against a stale value.
  const handleAlcoholChange = (confirmed: boolean) => {
    const meetsMealRules = mealsScored >= mealsRequired && (state?.meals_all_above_min ?? false);
    onUpdate(
      state?.manual_override
        ? { no_alcohol_confirmed: confirmed }
        : { no_alcohol_confirmed: confirmed, done: meetsMealRules && confirmed }
    );
  };

  return (
    <div className="space-y-2 mt-1">
      <p className="text-xs text-muted-foreground">
        {autoVerified
          ? t("challenges.diet_auto_verified")
          : t("challenges.diet_progress", { scored: mealsScored, required: mealsRequired, minScore })}
      </p>
      <label className="flex items-center gap-2 text-xs">
        <Checkbox
          checked={state?.no_alcohol_confirmed ?? false}
          disabled={disabled}
          onCheckedChange={(checked) => handleAlcoholChange(checked === true)}
        />
        {t("challenges.diet_no_alcohol")}
      </label>
      <Link to="/progress" className="text-xs text-primary inline-flex items-center gap-1">
        {t("challenges.diet_view_meals")}
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}

function CounterTaskDetail({ taskDef, state, onUpdate, disabled }: TaskDetailProps) {
  const { t } = useTranslation();
  const value = state?.value ?? 0;
  const goal = taskDef.config.goal ?? 1;
  const unit = taskDef.config.unit ?? "";
  const quickAdd = taskDef.config.quick_add ?? [1, 5, 10];
  const pct = Math.min(100, Math.round((value / goal) * 100));

  // Touching the counter hands control back to the goal: whatever was ticked
  // by hand before, the count decides from here.
  const addValue = (amount: number) => {
    const next = Math.max(0, value + amount);
    onUpdate({ value: next, done: next >= goal, manual_override: false });
  };

  return (
    <div className="space-y-2 mt-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("challenges.counter_progress", { value, goal, unit })}</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} status={pct >= 100 ? "high" : "medium"} />
      <div className="flex gap-2 flex-wrap">
        {quickAdd.map((amount) => (
          <Button key={amount} size="sm" variant="outline" disabled={disabled} onClick={() => addValue(amount)}>
            +{amount} {unit}
          </Button>
        ))}
        {value > 0 && (
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onUpdate({ value: 0, done: false, manual_override: false })}
          >
            {t("challenges.counter_reset")}
          </Button>
        )}
      </div>
    </div>
  );
}

function ActivityTaskDetail({ taskDef, state, onUpdate, disabled }: TaskDetailProps) {
  const { t } = useTranslation();
  const minutes = state?.minutes ?? 0;
  const outdoor = state?.outdoor ?? false;
  const minMinutes = taskDef.config.min_minutes ?? 45;
  const outdoorRequired = taskDef.config.outdoor_required ?? false;

  // As with the counters, using the stepper re-derives `done` from the goal
  // and drops any manual tick.
  const setMinutes = (next: number) => {
    const clamped = Math.max(0, next);
    onUpdate({
      minutes: clamped,
      outdoor,
      done: clamped >= minMinutes && (!outdoorRequired || outdoor),
      manual_override: false,
    });
  };

  const toggleOutdoor = (checked: boolean) => {
    onUpdate({
      minutes,
      outdoor: checked,
      done: minutes >= minMinutes && (!outdoorRequired || checked),
      manual_override: false,
    });
  };

  return (
    <div className="space-y-2 mt-1">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" className="h-7 w-7" disabled={disabled} onClick={() => setMinutes(minutes - 5)}>
          −
        </Button>
        <span className="text-sm font-medium w-24 text-center">
          {t("challenges.activity_minutes", { minutes, min: minMinutes })}
        </span>
        <Button size="icon" variant="outline" className="h-7 w-7" disabled={disabled} onClick={() => setMinutes(minutes + 5)}>
          +
        </Button>
      </div>
      {outdoorRequired && (
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={outdoor} disabled={disabled} onCheckedChange={(checked) => toggleOutdoor(checked === true)} />
          {t("challenges.activity_outdoor")}
        </label>
      )}
    </div>
  );
}

function PhotoTaskDetail({
  state,
  onCapture,
  disabled,
}: {
  state?: ChallengeTaskState;
  onCapture: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const done = state?.done ?? false;

  return (
    <div className="mt-1">
      <Button size="sm" variant={done ? "outline" : "default"} disabled={disabled} onClick={onCapture}>
        <Camera className="w-3.5 h-3.5 mr-1.5" />
        {done ? t("challenges.photo_retake") : t("challenges.photo_take")}
      </Button>
    </div>
  );
}
