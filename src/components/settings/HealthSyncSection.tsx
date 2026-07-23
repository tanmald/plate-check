import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Check, HeartPulse, ChevronDown, Loader2 } from "lucide-react";
import { useIngestToken, useGenerateIngestToken } from "@/hooks/use-health";
import { resolvedSupabaseUrl } from "@/lib/supabase";

const INGEST_URL = `${resolvedSupabaseUrl}/functions/v1/ingest-health`;

function CopyField({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("settings.health_sync.copied"));
    } catch {
      toast.error(t("settings.health_sync.copy_error"));
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <code className="flex-1 text-xs font-mono break-all">{value}</code>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-background transition-colors text-muted-foreground shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function HealthSyncSection() {
  const { t } = useTranslation();
  const { data: token, isLoading } = useIngestToken();
  const generateToken = useGenerateIngestToken();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const handleGenerate = () => {
    generateToken.mutate(undefined, {
      onSuccess: ({ plaintext }) => setNewToken(plaintext),
      onError: () => toast.error(t("settings.health_sync.generate_error")),
    });
  };

  return (
    <>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-primary" />
            {t("settings.health_sync.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("settings.health_sync.description")}</p>

          {!isLoading && token && (
            <p className="text-xs text-muted-foreground">
              {t("settings.health_sync.active_token", { prefix: token.tokenPrefix })}
            </p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generateToken.isPending}
            variant={token ? "outline" : "default"}
            className="w-full"
          >
            {generateToken.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <HeartPulse className="w-4 h-4 mr-2" />
            )}
            {token ? t("settings.health_sync.regenerate") : t("settings.health_sync.generate")}
          </Button>

          <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-sm font-medium text-primary py-1">
                {t("settings.health_sync.setup_guide")}
                <ChevronDown className={`w-4 h-4 transition-transform ${guideOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>{t("settings.health_sync.setup_step_1")}</li>
                <li>{t("settings.health_sync.setup_step_2")}</li>
                <li>{t("settings.health_sync.setup_step_3")}</li>
                <li>{t("settings.health_sync.setup_step_4")}</li>
              </ol>
              <CopyField value={INGEST_URL} label={t("settings.health_sync.endpoint_label")} />
              <CopyField value="x-api-key" label={t("settings.health_sync.header_label")} />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <AlertDialog open={!!newToken} onOpenChange={(open) => !open && setNewToken(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.health_sync.token_ready_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.health_sync.token_ready_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          {newToken && <CopyField value={newToken} label={t("settings.health_sync.token_label")} />}
          <AlertDialogAction onClick={() => setNewToken(null)} className="w-full">
            {t("settings.health_sync.token_saved")}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
