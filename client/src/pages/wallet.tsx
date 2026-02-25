import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Wallet as WalletIcon,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Shield,
  Info,
  Zap,
} from "lucide-react";

const PACKAGES = [
  { index: 0, credits: 500, usd: 500, label: "500", popular: false },
  { index: 1, credits: 1500, usd: 1500, label: "1.500", popular: true },
  { index: 2, credits: 5000, usd: 5000, label: "5.000", popular: false },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function LedgerTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    topup: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    debit: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    refund: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    adjustment: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  const labels: Record<string, string> = {
    topup: "Recarga", debit: "Consumo", refund: "Estorno", adjustment: "Ajuste",
  };
  return (
    <Badge className={`text-[10px] ${styles[type] || ""}`} variant="outline" data-testid={`badge-ledger-type-${type}`}>
      {labels[type] || type}
    </Badge>
  );
}

export default function WalletPage() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ wallet: any; ledger: any[] }>({
    queryKey: ["/api/wallet"],
  });

  const topupMutation = useMutation({
    mutationFn: async (packageIndex: number) => {
      const res = await apiRequest("POST", "/api/wallet/topup", { packageIndex });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar sessao de pagamento", variant: "destructive" });
    },
  });

  const creditMutation = useMutation({
    mutationFn: async (credits: number) => {
      const res = await apiRequest("POST", "/api/wallet/credit", { credits, description: `Recarga demo de ${credits} creditos` });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({ title: "Creditos adicionados", description: "Saldo atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao adicionar creditos", variant: "destructive" });
    },
  });

  const balance = data?.wallet ? parseFloat(data.wallet.balanceCredits) : 0;
  const ledger = data?.ledger || [];

  const params = new URLSearchParams(window.location.search);
  const topupStatus = params.get("topup");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-wallet-title">Carteira de Creditos</h1>
        <p className="text-xs text-muted-foreground mt-1">Gerencie seus creditos para servicos de IA do AI Desk</p>
      </div>

      {topupStatus === "success" && (
        <Card className="border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10" data-testid="card-topup-success">
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Recarga realizada com sucesso! Seus creditos foram adicionados.</p>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-wallet-balance">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Saldo disponivel</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" data-testid="text-balance">{balance.toLocaleString("pt-BR")}</span>
                <span className="text-sm text-muted-foreground">creditos</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">1 credito = US$ 1</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
              <WalletIcon className="w-7 h-7 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Recarregar Creditos</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.index}
              className={`relative ${pkg.popular ? "border-primary/50 shadow-md" : ""}`}
              data-testid={`card-package-${pkg.credits}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]" data-testid="badge-popular">
                  Mais popular
                </Badge>
              )}
              <CardContent className="p-5 text-center space-y-3">
                <div>
                  <p className="text-2xl font-bold">{pkg.label}</p>
                  <p className="text-xs text-muted-foreground">creditos</p>
                </div>
                <p className="text-sm font-medium">US$ {pkg.usd.toLocaleString("pt-BR")}</p>
                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => topupMutation.mutate(pkg.index)}
                  disabled={topupMutation.isPending}
                  data-testid={`button-topup-${pkg.credits}`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => creditMutation.mutate(100)}
            disabled={creditMutation.isPending}
            data-testid="button-demo-credit"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Adicionar 100 creditos (demo)
          </Button>
        </div>
      </div>

      <Card className="bg-muted/30" data-testid="card-trust-messages">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium">Sem surpresas</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">Orcamento por job antes de executar</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">CAP por job evita gastos inesperados</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">Voce controla o escopo e as regras</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <ArrowDownCircle className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold" data-testid="text-ledger-title">Historico (Ledger)</h2>
          <Badge variant="secondary" className="text-[10px]">{ledger.length} registros</Badge>
        </div>

        {ledger.length === 0 ? (
          <Card data-testid="card-ledger-empty">
            <CardContent className="p-8 text-center">
              <WalletIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma transacao ainda</p>
              <p className="text-xs text-muted-foreground mt-1">Faca sua primeira recarga para comecar a usar o AI Desk</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="table-ledger">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Descricao</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Creditos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry: any) => {
                      const credits = parseFloat(entry.credits);
                      return (
                        <tr key={entry.id} className="border-b last:border-0" data-testid={`row-ledger-${entry.id}`}>
                          <td className="p-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                          <td className="p-3"><LedgerTypeBadge type={entry.type} /></td>
                          <td className="p-3">{entry.description || "—"}</td>
                          <td className={`p-3 text-right font-medium ${credits >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {credits >= 0 ? "+" : ""}{credits.toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Wallet auditavel — AuraDue</span>
        </div>
        <span>AuraAUDIT — AI Desk</span>
      </div>
    </div>
  );
}
