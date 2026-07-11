import { useState } from "react";
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

const INGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-health`;

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
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
  const { data: token, isLoading } = useIngestToken();
  const generateToken = useGenerateIngestToken();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const handleGenerate = () => {
    generateToken.mutate(undefined, {
      onSuccess: ({ plaintext }) => setNewToken(plaintext),
      onError: () => toast.error("Couldn't generate a token. Please try again."),
    });
  };

  return (
    <>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-primary" />
            Health Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect the Health Auto Export app to bring your Apple Watch data (HRV, sleep, activity) into PlateCheck.
          </p>

          {!isLoading && token && (
            <p className="text-xs text-muted-foreground">
              Active token: {token.tokenPrefix}…
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
            {token ? "Regenerate Token" : "Generate Sync Token"}
          </Button>

          <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-sm font-medium text-primary py-1">
                Setup guide
                <ChevronDown className={`w-4 h-4 transition-transform ${guideOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Install "Health Auto Export" from the App Store.</li>
                <li>In Automations, create a new REST API automation.</li>
                <li>Paste the endpoint URL below and add the header shown, using your token as the value.</li>
                <li>Enable the metrics you want to sync and set it to run automatically (hourly is a good default).</li>
              </ol>
              <CopyField value={INGEST_URL} label="Endpoint URL" />
              <CopyField value="x-api-key" label="Header name (value = your token)" />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <AlertDialog open={!!newToken} onOpenChange={(open) => !open && setNewToken(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Your sync token</AlertDialogTitle>
            <AlertDialogDescription>
              Copy it now — for your security, it won't be shown again. Paste it as the value of the x-api-key header in Health Auto Export.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {newToken && <CopyField value={newToken} label="Token" />}
          <AlertDialogAction onClick={() => setNewToken(null)} className="w-full">
            I've copied it
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
