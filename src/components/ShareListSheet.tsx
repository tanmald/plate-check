import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useJoinShoppingList } from "@/hooks/use-shopping-list";
import { useTranslation } from "react-i18next";

interface ShareListSheetProps {
  open: boolean;
  onClose: () => void;
  shareCode: string;
  listName: string;
}

export function ShareListSheet({ open, onClose, shareCode, listName }: ShareListSheetProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const joinList = useJoinShoppingList();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("shareList.code_copied"));
    } catch {
      toast.error(t("shareList.copy_error"));
    }
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    joinList.mutate(
      { shareCode: joinCode.trim() },
      {
        onSuccess: ({ alreadyJoined }) => {
          if (alreadyJoined) {
            toast.info(t("shareList.already_joined"));
          } else {
            toast.success(t("shareList.join_success"));
          }
          setJoinCode("");
          onClose();
        },
        onError: (err: Error) => toast.error(err.message || t("shareList.join_error")),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle>{t("shareList.title")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("shareList.share_desc")}</p>

            <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
              <span className="flex-1 text-center text-2xl font-mono font-bold tracking-widest text-primary">
                {shareCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground"
              >
                {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t("shareList.join_instructions")}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t("common.or")}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">{t("shareList.join_title")}</p>
            <div className="flex gap-2">
              <Input
                placeholder={t("shareList.join_placeholder")}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono tracking-widest text-center"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <Button
                onClick={handleJoin}
                disabled={joinList.isPending || joinCode.trim().length < 4}
              >
                {joinList.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
