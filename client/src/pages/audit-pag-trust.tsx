import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, Award, BadgeCheck, Calculator, DollarSign,
  Clock, FileText, Lock, AlertTriangle, CheckCircle2,
  XCircle, Copy, TrendingUp, BarChart3, ArrowRight,
} from "lucide-react";

interface TrustPanelProps {
  toast: any;
}

export default function TrustPanel({ toast }: TrustPanelProps) {
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);
  const [detailCert, setDetailCert] = useState<any>(null);
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newType, setNewType] = useState("active_monitoring");
  const [billingCompanyId, setBillingCompanyId] = useState("");
  const [billingStart, setBillingStart] = useState("");
  const [billingEnd, setBillingEnd] = useState("");
  const [simulateQty, setSimulateQty] = useState("500");

  const summaryQuery = useQuery<any>({ queryKey: ["/api/audit-pag/trust/summary"] });
  const certsQuery = useQuery<any[]>({ queryKey: ["/api/audit-pag/trust/certificates"] });
  const meteringQuery = useQuery<any[]>({ queryKey: ["/api/audit-pag/trust/metering"] });
  const pricingQuery = useQuery<any>({ queryKey: ["/api/audit-pag/trust/pricing"] });

  const issueMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/audit-pag/trust/certificates", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/trust/certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/trust/summary"] });
      setIssueDialogOpen(false);
      toast({ title: "Certificado emitido", description: "Selo de confiança gerado com cadeia de custódia SHA-256." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/audit-pag/trust/certificates/${id}/revoke`, { reason: "Monitoramento encerrado pelo operador" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/trust/certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/trust/summary"] });
      setDetailCert(null);
      toast({ title: "Selo revogado", description: "Certificado de período será emitido automaticamente." });
    },
  });

  const calculateMeteringMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/audit-pag/trust/metering/calculate", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/trust/metering"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/trust/summary"] });
      setBillingDialogOpen(false);
      toast({ title: "Metering calculado", description: "Faturamento do período calculado com sucesso." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const simulateMutation = useMutation({
    mutationFn: async (qty: number) => {
      const res = await apiRequest("POST", "/api/audit-pag/trust/simulate-billing", { totalTransactions: qty });
      return res.json();
    },
    onSuccess: (data) => setSimulationResult(data),
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const summary = summaryQuery.data;
  const certs = certsQuery.data || [];
  const metering = meteringQuery.data || [];
  const pricing = pricingQuery.data;

  const copySealCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copiado", description: `Selo ${code} copiado para clipboard.` });
  };

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold" data-testid="text-trust-title">Evidence Tracking Infrastructure</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSimulateDialogOpen(true)} data-testid="button-simulate-billing">
            <Calculator className="w-4 h-4 mr-2" />
            Simular Faturamento
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBillingDialogOpen(true)} data-testid="button-calculate-metering">
            <DollarSign className="w-4 h-4 mr-2" />
            Calcular Período
          </Button>
          <Button size="sm" onClick={() => setIssueDialogOpen(true)} data-testid="button-issue-certificate">
            <BadgeCheck className="w-4 h-4 mr-2" />
            Emitir Certificado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="kpi-active-seals">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              Selos Ativos
            </div>
            <p className="text-2xl font-bold text-emerald-400">{summary?.activeSealCount || 0}</p>
            <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
          </CardContent>
        </Card>
        <Card data-testid="kpi-issued-certs">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400 text-xs mb-1">
              <FileText className="w-4 h-4" />
              Certificados de Período
            </div>
            <p className="text-2xl font-bold text-blue-400">{summary?.issuedCertificateCount || 0}</p>
            <p className="text-xs text-muted-foreground">Validados até a data</p>
          </CardContent>
        </Card>
        <Card data-testid="kpi-revoked">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <XCircle className="w-4 h-4" />
              Revogados
            </div>
            <p className="text-2xl font-bold">{summary?.revokedCount || 0}</p>
          </CardContent>
        </Card>
        <Card data-testid="kpi-total-billed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
              <DollarSign className="w-4 h-4" />
              Total Faturado
            </div>
            <p className="text-2xl font-bold text-amber-400">US$ {(summary?.totalBilled || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      {summary?.currentActiveSeal && (
        <Card className="border-emerald-500/30 bg-emerald-500/5" data-testid="card-active-seal">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Selo de Confiança Ativo
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">ATIVO</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Código do Selo</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono font-bold text-emerald-400" data-testid="text-active-seal-code">{summary.currentActiveSeal.sealCode}</p>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copySealCode(summary.currentActiveSeal.sealCode)} data-testid="button-copy-seal">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Empresa</p>
                <p className="font-medium">{summary.currentActiveSeal.companyName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Desde</p>
                <p>{new Date(summary.currentActiveSeal.periodStart).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Transações Monitoradas</p>
                <p className="font-bold">{summary.currentActiveSeal.totalTransactionsMonitored}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Taxa de Reconciliação</p>
                <p className="font-bold">{summary.currentActiveSeal.reconciliationRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              SHA-256: <span className="font-mono text-[10px]">{summary.currentActiveSeal.integrityHash?.substring(0, 24)}...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {pricing && (
        <Card data-testid="card-pricing-table">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tabela de Precificação — AuraTRUST Evidence Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-sm text-muted-foreground">
              Mensalidade base: <span className="font-bold text-foreground">US$ {pricing.baseFee}</span>/mês — inclui até <span className="font-bold text-foreground">{pricing.includedTransactions}</span> transações conciliadas.
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {pricing.transactionDefinition}
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left p-2 font-medium">Faixa de Transações</th>
                    <th className="text-right p-2 font-medium">Valor/Transação</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.tiers.map((t: any, i: number) => (
                    <tr key={i} className="border-b last:border-0" data-testid={`row-pricing-tier-${i}`}>
                      <td className="p-2">{t.from === 0 ? `Até ${t.to}` : t.to ? `${t.from.toLocaleString()} — ${t.to.toLocaleString()}` : `${t.from.toLocaleString()}+`}</td>
                      <td className="p-2 text-right font-mono">{t.rate === 0 ? "Incluso" : `US$ ${t.rate.toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-certificates-list">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certificados e Selos Emitidos ({certs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum certificado emitido ainda.</p>
          ) : (
            <div className="space-y-2">
              {certs.map((cert: any) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 cursor-pointer"
                  onClick={() => setDetailCert(cert)}
                  data-testid={`cert-row-${cert.id}`}
                >
                  <div className="flex items-center gap-3">
                    {cert.status === "active" ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : cert.status === "issued" ? (
                      <BadgeCheck className="w-5 h-5 text-blue-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{cert.sealCode}</span>
                        <Badge variant={cert.status === "active" ? "default" : cert.status === "issued" ? "secondary" : "outline"}>
                          {cert.status === "active" ? "ATIVO" : cert.status === "issued" ? "PERÍODO" : "REVOGADO"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{cert.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Transações</p>
                      <p className="font-bold">{cert.totalTransactionsMonitored}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Compliance</p>
                      <p className="font-bold">{cert.complianceScore}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Emissão</p>
                      <p>{new Date(cert.issuedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {metering.length > 0 && (
        <Card data-testid="card-metering-history">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Histórico de Metering ({metering.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left p-2 font-medium">Período</th>
                    <th className="text-right p-2 font-medium">Total Tx</th>
                    <th className="text-right p-2 font-medium">Inclusas</th>
                    <th className="text-right p-2 font-medium">Excedentes</th>
                    <th className="text-right p-2 font-medium">Base</th>
                    <th className="text-right p-2 font-medium">Excedente</th>
                    <th className="text-right p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {metering.map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0" data-testid={`metering-row-${m.id}`}>
                      <td className="p-2">
                        {new Date(m.billingPeriodStart).toLocaleDateString("pt-BR")} — {new Date(m.billingPeriodEnd).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-2 text-right font-bold">{m.totalTransactions}</td>
                      <td className="p-2 text-right">{m.includedTransactions}</td>
                      <td className="p-2 text-right">{m.excessTransactions}</td>
                      <td className="p-2 text-right font-mono">US$ {parseFloat(m.baseFee).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">US$ {parseFloat(m.excessFee).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold">US$ {parseFloat(m.totalFee).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              Emitir Certificado / Selo de Confiança
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID da Empresa</Label>
              <Input value={newCompanyId} onChange={e => setNewCompanyId(e.target.value)} placeholder="UUID da empresa" data-testid="input-cert-company-id" />
            </div>
            <div>
              <Label>Nome da Empresa</Label>
              <Input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="Ex: Stabia Turismo" data-testid="input-cert-company-name" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger data-testid="select-cert-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active_monitoring">Selo de Confiança (Monitoramento Ativo)</SelectItem>
                  <SelectItem value="period_validated">Certificado de Período (Validação Concluída)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {newType === "active_monitoring"
                  ? "Selo ativo enquanto o monitoramento em tempo real estiver contratado. Válido continuamente."
                  : "Certificado que formaliza que o processo foi avaliado e validado até a data, apenas para o período monitorado."}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => issueMutation.mutate({ companyId: newCompanyId, companyName: newCompanyName, type: newType })}
              disabled={!newCompanyId || !newCompanyName || issueMutation.isPending}
              data-testid="button-confirm-issue"
            >
              {issueMutation.isPending ? "Emitindo..." : "Emitir com Cadeia de Custódia SHA-256"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Calcular Metering do Período
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID da Empresa</Label>
              <Input value={billingCompanyId} onChange={e => setBillingCompanyId(e.target.value)} placeholder="UUID da empresa" data-testid="input-metering-company" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Início do Período</Label>
                <Input type="date" value={billingStart} onChange={e => setBillingStart(e.target.value)} data-testid="input-metering-start" />
              </div>
              <div>
                <Label>Fim do Período</Label>
                <Input type="date" value={billingEnd} onChange={e => setBillingEnd(e.target.value)} data-testid="input-metering-end" />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => calculateMeteringMutation.mutate({ companyId: billingCompanyId, periodStart: billingStart, periodEnd: billingEnd })}
              disabled={!billingCompanyId || !billingStart || !billingEnd || calculateMeteringMutation.isPending}
              data-testid="button-confirm-metering"
            >
              {calculateMeteringMutation.isPending ? "Calculando..." : "Calcular Faturamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={simulateDialogOpen} onOpenChange={(v) => { setSimulateDialogOpen(v); if (!v) setSimulationResult(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Simulador de Faturamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantidade de Transações no Mês</Label>
              <Input type="number" value={simulateQty} onChange={e => setSimulateQty(e.target.value)} min="0" data-testid="input-simulate-qty" />
            </div>
            <Button
              className="w-full"
              onClick={() => simulateMutation.mutate(parseInt(simulateQty))}
              disabled={simulateMutation.isPending}
              data-testid="button-confirm-simulate"
            >
              {simulateMutation.isPending ? "Calculando..." : "Simular"}
            </Button>
            {simulationResult && (
              <Card className="bg-muted/30" data-testid="card-simulation-result">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Mensalidade Base</p>
                      <p className="font-mono font-bold">US$ {simulationResult.baseFee.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transações Excedentes</p>
                      <p className="font-bold">{simulationResult.excessTx}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Excedente</p>
                      <p className="font-mono font-bold">US$ {simulationResult.excessFee.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Mensal</p>
                      <p className="font-mono font-bold text-lg text-primary">US$ {simulationResult.totalFee.toFixed(2)}</p>
                    </div>
                  </div>
                  {simulationResult.tierBreakdown.length > 0 && (
                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground mb-1">Detalhamento por Faixa</p>
                      {simulationResult.tierBreakdown.map((t: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span>Faixa {t.tier}: {t.qty} tx × US$ {t.rate.toFixed(2)}</span>
                          <span className="font-mono">US$ {t.cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailCert} onOpenChange={(v) => { if (!v) setDetailCert(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailCert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detailCert.status === "active" ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : detailCert.status === "issued" ? <BadgeCheck className="w-5 h-5 text-blue-400" /> : <XCircle className="w-5 h-5" />}
                  Certificado {detailCert.sealCode}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={detailCert.status === "active" ? "default" : detailCert.status === "issued" ? "secondary" : "outline"} data-testid="text-detail-status">
                      {detailCert.status === "active" ? "SELO ATIVO — Monitoramento em Tempo Real" : detailCert.status === "issued" ? "CERTIFICADO DE PERÍODO — Validação Concluída" : "REVOGADO"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa</p>
                    <p className="font-medium" data-testid="text-detail-company">{detailCert.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Período Monitorado</p>
                    <p data-testid="text-detail-period">
                      {new Date(detailCert.periodStart).toLocaleDateString("pt-BR")}
                      {detailCert.periodEnd ? ` — ${new Date(detailCert.periodEnd).toLocaleDateString("pt-BR")}` : " — em andamento"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Emissão</p>
                    <p>{new Date(detailCert.issuedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transações Monitoradas</p>
                    <p className="font-bold text-lg" data-testid="text-detail-tx-count">{detailCert.totalTransactionsMonitored}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volume Monitorado</p>
                    <p className="font-bold">R$ {parseFloat(detailCert.totalVolumeMonitored || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Score de Compliance</p>
                    <p className="font-bold text-lg" data-testid="text-detail-compliance">{detailCert.complianceScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa de Reconciliação</p>
                    <p className="font-bold text-lg">{detailCert.reconciliationRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alertas Gerados</p>
                    <p>{detailCert.totalAlertsGenerated}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Divergências Encontradas</p>
                    <p>{detailCert.totalDivergencesFound}</p>
                  </div>
                </div>

                <div className="border rounded-md p-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Cadeia de Custódia</p>
                  <p className="text-xs font-mono break-all" data-testid="text-detail-hash">SHA-256: {detailCert.integrityHash}</p>
                  {detailCert.previousCertificateHash && (
                    <p className="text-xs font-mono break-all text-muted-foreground mt-1">Cert. anterior: {detailCert.previousCertificateHash}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Versão da Metodologia: {detailCert.methodologyVersion}</p>
                </div>

                {detailCert.status === "revoked" && detailCert.revocationReason && (
                  <div className="border border-destructive/30 rounded-md p-3 bg-destructive/5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Motivo da Revogação</p>
                    <p className="text-sm">{detailCert.revocationReason}</p>
                    <p className="text-xs text-muted-foreground mt-1">Revogado em: {new Date(detailCert.revokedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}

                {detailCert.type === "period_validated" && detailCert.status !== "revoked" && (
                  <div className="border border-blue-500/30 rounded-md p-3 bg-blue-500/5 text-sm">
                    <p className="flex items-center gap-1 font-medium text-blue-400"><BadgeCheck className="w-4 h-4" /> Certificado de Período Validado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este certificado formaliza que o processo de monitoramento contínuo foi executado e validado para o período de {new Date(detailCert.periodStart).toLocaleDateString("pt-BR")} a {detailCert.periodEnd ? new Date(detailCert.periodEnd).toLocaleDateString("pt-BR") : "data atual"}.
                      Válido exclusivamente para as transações analisadas durante este período.
                    </p>
                  </div>
                )}

                {detailCert.type === "active_monitoring" && detailCert.status === "active" && (
                  <div className="border border-emerald-500/30 rounded-md p-3 bg-emerald-500/5 text-sm">
                    <p className="flex items-center gap-1 font-medium text-emerald-400"><ShieldCheck className="w-4 h-4" /> Selo de Confiança em Tempo Real</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este selo permanece ativo enquanto o cliente mantiver a assinatura mensal do AuraTRUST (mínimo US$ 149/mês).
                      Ao encerrar o monitoramento, o selo é revogado e um Certificado de Período é emitido automaticamente.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  {detailCert.status === "active" && (
                    <Button variant="destructive" size="sm" onClick={() => revokeMutation.mutate(detailCert.id)} disabled={revokeMutation.isPending} data-testid="button-revoke-cert">
                      <XCircle className="w-4 h-4 mr-2" />
                      {revokeMutation.isPending ? "Revogando..." : "Revogar Selo"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => copySealCode(detailCert.sealCode)} data-testid="button-copy-detail-seal">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
