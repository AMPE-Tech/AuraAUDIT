import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import {
  CreditCard,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  Coins,
} from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LedgerTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    topup: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    debit: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    refund: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    adjustment: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    vip_courtesy: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  const labels: Record<string, string> = {
    topup: "Recarga",
    debit: "Consumo",
    refund: "Estorno",
    adjustment: "Ajuste",
    vip_courtesy: "Cortesia VIP",
  };
  return (
    <Badge
      className={`text-[10px] ${styles[type] || ""}`}
      variant="outline"
      data-testid={`badge-billing-ledger-type-${type}`}
    >
      {labels[type] || type}
    </Badge>
  );
}

export default function BillingPage() {
  const [, navigate] = useLocation();

  const { data: subscriptionData, isLoading: subLoading } = useQuery<any>({
    queryKey: ["/api/subscription/status"],
  });

  const { data: walletData, isLoading: walletLoading } = useQuery<{
    wallet: any;
    ledger: any[];
  }>({
    queryKey: ["/api/wallet"],
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-billing-title">
          Faturamento
        </h1>
        <p className="text-sm text-muted-foreground mt-1" data-testid="text-billing-subtitle">
          Gerencie sua assinatura AuraAudit Pass e sua Wallet de creditos IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-subscription">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              AuraAudit Pass
            </CardTitle>
            {subLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : subscriptionData?.active ? (
              <Badge
                variant="outline"
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]"
                data-testid="badge-subscription-active"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]"
                data-testid="badge-subscription-inactive"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Inativo
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground" data-testid="text-pass-description">
              Pass = auditoria base (assinatura mensal)
            </p>

            {subLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Plano</span>
                  <span className="text-sm font-medium" data-testid="text-plan-name">
                    {subscriptionData?.plan || "AuraAudit Pass"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium" data-testid="text-plan-status">
                    {subscriptionData?.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Custo Mensal</span>
                  <span className="text-sm font-medium" data-testid="text-plan-cost">
                    {subscriptionData?.price
                      ? `US$ ${(subscriptionData.price / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "---"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">CAP Mensal</span>
                  <span className="text-sm font-medium" data-testid="text-plan-cap">
                    {subscriptionData?.cap
                      ? `US$ ${subscriptionData.cap.toLocaleString("pt-BR")}`
                      : "Sem limite definido"}
                  </span>
                </div>
                {subscriptionData?.currentPeriodEnd && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Proximo Ciclo</span>
                      <span className="text-sm font-medium" data-testid="text-plan-next-cycle">
                        {formatDate(subscriptionData.currentPeriodEnd)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <Button
              className="w-full mt-2"
              variant="outline"
              onClick={() => navigate("/subscription")}
              data-testid="button-manage-subscription"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Gerenciar Assinatura
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-wallet">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Wallet de Creditos
            </CardTitle>
            {walletLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span
                className="text-xl font-bold tabular-nums"
                data-testid="text-wallet-balance"
              >
                {walletData?.wallet?.balance?.toLocaleString("pt-BR") ?? 0}
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground" data-testid="text-wallet-description">
              Wallet = servicos de IA sob demanda (creditos)
            </p>

            {walletLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ultimas Transacoes
                </div>
                {walletData?.ledger && walletData.ledger.length > 0 ? (
                  walletData.ledger.slice(0, 5).map((entry: any, idx: number) => (
                    <div
                      key={entry.id || idx}
                      className="flex items-center justify-between gap-2"
                      data-testid={`row-billing-ledger-${idx}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {entry.type === "topup" ? (
                          <ArrowUpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : entry.type === "refund" ? (
                          <RefreshCw className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm truncate" data-testid={`text-billing-ledger-desc-${idx}`}>
                            {entry.description || entry.type}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {entry.createdAt ? formatDate(entry.createdAt) : "---"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <LedgerTypeBadge type={entry.type} />
                        <span
                          className={`text-sm font-mono font-medium ${
                            entry.credits > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}
                          data-testid={`text-billing-ledger-credits-${idx}`}
                        >
                          {entry.credits > 0 ? "+" : ""}
                          {entry.credits?.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-transactions">
                    Nenhuma transacao encontrada
                  </p>
                )}
              </div>
            )}

            <Button
              className="w-full mt-2"
              variant="outline"
              onClick={() => navigate("/wallet")}
              data-testid="button-recharge-wallet"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Recarregar Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
