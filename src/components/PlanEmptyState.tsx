import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image, File } from "lucide-react";

interface PlanEmptyStateProps {
  onImportStart: () => void;
}

export function PlanEmptyState({ onImportStart }: PlanEmptyStateProps) {
  return (
    <Card className="card-shadow animate-fade-up">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No plan imported yet</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Upload your nutrition plan (PDF, Word, or image) and we'll parse it into meal templates.
        </p>

        <div className="space-y-3">
          <Button size="lg" className="w-full" onClick={onImportStart}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Plan
          </Button>

          <div className="flex gap-2 justify-center">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <File className="w-3 h-3" /> PDF
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" /> Word
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Image className="w-3 h-3" /> Image
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
