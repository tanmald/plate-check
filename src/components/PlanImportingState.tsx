import { Loader2 } from "lucide-react";

export function PlanImportingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-fade-up">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Parsing your plan...</h3>
        <p className="text-muted-foreground">Extracting meal templates and guidelines</p>
      </div>
    </div>
  );
}
