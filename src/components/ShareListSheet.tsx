import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useJoinShoppingList } from "@/hooks/use-shopping-list";

interface ShareListSheetProps {
  open: boolean;
  onClose: () => void;
  shareCode: string;
  listName: string;
}

export function ShareListSheet({ open, onClose, shareCode, listName }: ShareListSheetProps) {
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const joinList = useJoinShoppingList();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Código copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    joinList.mutate(
      { shareCode: joinCode.trim() },
      {
        onSuccess: ({ alreadyJoined }) => {
          if (alreadyJoined) {
            toast.info("Já tens acesso a esta lista");
          } else {
            toast.success("Lista adicionada com sucesso!");
          }
          setJoinCode("");
          onClose();
        },
        onError: (err: Error) => toast.error(err.message || "Código inválido"),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="mb-6">
          <SheetTitle>Partilhar lista de compras</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Share section */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Partilha este código com o André para que ele possa ver e fazer check na lista em tempo real.
            </p>

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
              O André abre o PlateCheck → "Juntar-me a uma lista" → insere o código
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Join section */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Juntar-me a uma lista</p>
            <div className="flex gap-2">
              <Input
                placeholder="Código (ex: AB12CD)"
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
