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
  Layers, Plus, ArrowRight, CheckCircle2, XCircle, Clock, AlertTriangle,
  RefreshCw, Eye, DollarSign, FileText, CreditCard, Building2,
  ArrowDownToLine, ShieldCheck, Ban, TrendingUp, Landmark,
} from "lucide-react";

const PIPELINE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  layer1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  layer2: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  layer3: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  reconciled: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  blocked: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PIPELINE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  layer1: "Camada 1",
  layer2: "Camada 2",
  layer3: "Camada 3",
  reconciled: "Reconciliado",
  blocked: "Bloqueado",
};

const RECON_STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-500/20 text-slate-400",
  matched: "bg-emerald-500/20 text-emerald-400",
  partial: "bg-amber-500/20 text-amber-400",
  divergent: "bg-red-500/20 text-red-400",
};

const RECON_LABELS: Record<string, string> = {
  pending: "Pendente",
  matched: "Reconciliado",
  partial: "Parcial",
  divergent: "Divergente",
};

const LAYER3_LABELS: Record<string, string> = {
  conta_corrente: "Conta Corrente",
  cartao_credito: "Cartão de Crédito",
  cartao_virtual: "Cartão Virtual (VCN)",
};

function formatBRL(v: string | number | null | undefined): string {
  const n = parseFloat(String(v || "0"));
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface ReconciliationPanelProps {
  toast: any;
}

export default function ReconciliationPanel({ toast }: ReconciliationPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [layer1Open, setLayer1Open] = useState(false);
  const [layer2Open, setLayer2Open] = useState(false);
  const [layer3Open, setLayer3Open] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const summaryQuery = useQuery({ queryKey: ["/api/audit-pag/reconciliation/summary"] });
  const txQuery = useQuery({
    queryKey: ["/api/audit-pag/transactions", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/audit-pag/transactions${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const txDetailQuery = useQuery({
    queryKey: ["/api/audit-pag/transactions", selectedTx?.id],
    queryFn: async () => {
      if (!selectedTx?.id) return null;
      const res = await fetch(`/api/audit-pag/transactions/${selectedTx.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!selectedTx?.id && detailOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/audit-pag/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/reconciliation/summary"] });
      setCreateOpen(false);
      toast({ title: "Transação criada", description: "Pipeline de reconciliação iniciado." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const layer1Mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("POST", `/api/audit-pag/transactions/${id}/layer1`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/reconciliation/summary"] });
      setLayer1Open(false);
      toast({ title: "Camada 1 ingerida", description: "Dados do pedido processados." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const layer2Mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("POST", `/api/audit-pag/transactions/${id}/layer2`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/reconciliation/summary"] });
      setLayer2Open(false);
      toast({ title: "Camada 2 ingerida", description: "Dados ERP processados com cruzamento Camada 1×2." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const layer3Mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("POST", `/api/audit-pag/transactions/${id}/layer3`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/reconciliation/summary"] });
      setLayer3Open(false);
      toast({ title: "Camada 3 ingerida", description: "Dados bancários processados com cruzamento triplo." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const reconcileMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/audit-pag/transactions/${id}/reconcile`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/reconciliation/summary"] });
      toast({ title: "Reconciliação executada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const summary: any = summaryQuery.data || {};
  const transactions: any[] = txQuery.data || [];

  return (
    <div className="space-y-6">
      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Layers className="w-3.5 h-3.5" />Total</div>
              <p className="text-2xl font-bold text-white" data-testid="text-recon-total">{summary.total || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs mb-1"><Clock className="w-3.5 h-3.5" />Pendentes</div>
              <p className="text-2xl font-bold text-amber-300" data-testid="text-recon-pending">{summary.pending || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-800 bg-emerald-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1"><CheckCircle2 className="w-3.5 h-3.5" />Reconciliados</div>
              <p className="text-2xl font-bold text-emerald-300" data-testid="text-recon-matched">{summary.matched || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-800 bg-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs mb-1"><AlertTriangle className="w-3.5 h-3.5" />Parciais</div>
              <p className="text-2xl font-bold text-amber-300" data-testid="text-recon-partial">{summary.partial || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-red-800 bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400 text-xs mb-1"><XCircle className="w-3.5 h-3.5" />Divergentes</div>
              <p className="text-2xl font-bold text-red-300" data-testid="text-recon-divergent">{summary.divergent || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-red-800 bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400 text-xs mb-1"><Ban className="w-3.5 h-3.5" />Bloqueados</div>
              <p className="text-2xl font-bold text-red-300" data-testid="text-recon-blocked">{summary.blocked || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!summaryQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 mb-1">Volume Solicitado</div>
              <p className="text-lg font-bold text-white" data-testid="text-total-requested">{formatBRL(summary.totalRequestedAmount)}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 mb-1">Volume Faturado</div>
              <p className="text-lg font-bold text-white" data-testid="text-total-invoiced">{formatBRL(summary.totalInvoicedAmount)}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 mb-1">Confirmado Banco</div>
              <p className="text-lg font-bold text-white" data-testid="text-total-bank">{formatBRL(summary.totalBankConfirmedAmount)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!summaryQuery.isLoading && (summary.totalCommissionExpected > 0 || summary.totalIncentiveExpected > 0 || summary.totalFeeAmount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 mb-1">FEE Total / Reconciliadas</div>
              <p className="text-sm text-white">{formatBRL(summary.totalFeeAmount)} <span className="text-emerald-400">({summary.feeReconciledCount || 0} ok)</span></p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 mb-1">Comissão Esperada / Recebida</div>
              <p className="text-sm text-white">{formatBRL(summary.totalCommissionExpected)} / <span className="text-emerald-400">{formatBRL(summary.totalCommissionReceived)}</span></p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 mb-1">Incentivo Esperado / Recebido</div>
              <p className="text-sm text-white">{formatBRL(summary.totalIncentiveExpected)} / <span className="text-emerald-400">{formatBRL(summary.totalIncentiveReceived)}</span></p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700" data-testid="select-recon-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="layer1">Camada 1</SelectItem>
              <SelectItem value="layer2">Camada 2</SelectItem>
              <SelectItem value="layer3">Camada 3</SelectItem>
              <SelectItem value="reconciled">Reconciliado</SelectItem>
              <SelectItem value="blocked">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-new-transaction">
          <Plus className="w-4 h-4 mr-1" /> Nova Transação
        </Button>
      </div>

      {txQuery.isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : transactions.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-8 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma transação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx: any) => (
            <Card key={tx.id} className="border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-colors cursor-pointer" data-testid={`card-transaction-${tx.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-white" data-testid={`text-ref-${tx.id}`}>{tx.referenceCode}</span>
                        <Badge className={PIPELINE_STATUS_COLORS[tx.status] || "bg-slate-500/20 text-slate-400"} data-testid={`badge-status-${tx.id}`}>
                          {PIPELINE_STATUS_LABELS[tx.status] || tx.status}
                        </Badge>
                        <Badge className={RECON_STATUS_COLORS[tx.reconciliationStatus] || ""} data-testid={`badge-recon-${tx.id}`}>
                          {RECON_LABELS[tx.reconciliationStatus] || tx.reconciliationStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {tx.supplierName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{tx.supplierName}</span>}
                        {tx.serviceTypeName && <span>{tx.serviceTypeName}</span>}
                        {tx.requestedAmount && <span className="text-white">{formatBRL(tx.requestedAmount)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${tx.layer1At ? "bg-blue-400" : "bg-slate-600"}`} title="Camada 1" />
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <div className={`w-2.5 h-2.5 rounded-full ${tx.layer2At ? "bg-indigo-400" : "bg-slate-600"}`} title="Camada 2" />
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <div className={`w-2.5 h-2.5 rounded-full ${tx.layer3At ? "bg-purple-400" : "bg-slate-600"}`} title="Camada 3" />
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <div className={`w-2.5 h-2.5 rounded-full ${tx.reconciliationStatus === "matched" ? "bg-emerald-400" : tx.reconciliationStatus === "divergent" ? "bg-red-400" : tx.reconciliationStatus === "partial" ? "bg-amber-400" : "bg-slate-600"}`} title="Reconciliação" />
                    </div>
                    <div className="flex gap-1">
                      {!tx.layer1At && tx.status !== "blocked" && (
                        <Button size="sm" variant="outline" className="text-xs h-7" data-testid={`button-layer1-${tx.id}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); setLayer1Open(true); }}>
                          <ArrowDownToLine className="w-3 h-3 mr-1" />C1
                        </Button>
                      )}
                      {tx.layer1At && !tx.layer2At && (
                        <Button size="sm" variant="outline" className="text-xs h-7" data-testid={`button-layer2-${tx.id}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); setLayer2Open(true); }}>
                          <ArrowDownToLine className="w-3 h-3 mr-1" />C2
                        </Button>
                      )}
                      {tx.layer2At && !tx.layer3At && (
                        <Button size="sm" variant="outline" className="text-xs h-7" data-testid={`button-layer3-${tx.id}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); setLayer3Open(true); }}>
                          <ArrowDownToLine className="w-3 h-3 mr-1" />C3
                        </Button>
                      )}
                      {tx.layer3At && tx.reconciliationStatus === "pending" && (
                        <Button size="sm" variant="default" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" data-testid={`button-reconcile-${tx.id}`}
                          onClick={(e) => { e.stopPropagation(); reconcileMutation.mutate(tx.id); }}>
                          <ShieldCheck className="w-3 h-3 mr-1" />Reconciliar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-xs h-7" data-testid={`button-detail-${tx.id}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); setDetailOpen(true); }}>
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTransactionDialog open={createOpen} onOpenChange={setCreateOpen}
        onSubmit={(d: any) => createMutation.mutate(d)} isPending={createMutation.isPending} />

      {selectedTx && (
        <>
          <Layer1Dialog open={layer1Open} onOpenChange={setLayer1Open}
            tx={selectedTx} onSubmit={(d: any) => layer1Mutation.mutate({ id: selectedTx.id, data: d })}
            isPending={layer1Mutation.isPending} />
          <Layer2Dialog open={layer2Open} onOpenChange={setLayer2Open}
            tx={selectedTx} onSubmit={(d: any) => layer2Mutation.mutate({ id: selectedTx.id, data: d })}
            isPending={layer2Mutation.isPending} />
          <Layer3Dialog open={layer3Open} onOpenChange={setLayer3Open}
            tx={selectedTx} onSubmit={(d: any) => layer3Mutation.mutate({ id: selectedTx.id, data: d })}
            isPending={layer3Mutation.isPending} />
          <TransactionDetailDialog open={detailOpen} onOpenChange={setDetailOpen}
            tx={txDetailQuery.data || selectedTx} isLoading={txDetailQuery.isLoading} />
        </>
      )}
    </div>
  );
}

function CreateTransactionDialog({ open, onOpenChange, onSubmit, isPending }: any) {
  const [form, setForm] = useState({ referenceCode: "", supplierCnpj: "", supplierName: "", serviceTypeName: "", requestedAmount: "" });
  const handleSubmit = () => {
    if (!form.referenceCode) return;
    onSubmit(form);
    setForm({ referenceCode: "", supplierCnpj: "", supplierName: "", serviceTypeName: "", requestedAmount: "" });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader><DialogTitle className="text-white">Nova Transação — Pipeline de Reconciliação</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-slate-300">Código de Referência *</Label>
            <Input value={form.referenceCode} onChange={e => setForm(f => ({ ...f, referenceCode: e.target.value }))}
              placeholder="Ex: REQ-2026-0001" className="bg-slate-800 border-slate-700" data-testid="input-ref-code" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">CNPJ Fornecedor</Label>
              <Input value={form.supplierCnpj} onChange={e => setForm(f => ({ ...f, supplierCnpj: e.target.value }))}
                placeholder="00.000.000/0000-00" className="bg-slate-800 border-slate-700" data-testid="input-supplier-cnpj" /></div>
            <div><Label className="text-slate-300">Fornecedor</Label>
              <Input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))}
                className="bg-slate-800 border-slate-700" data-testid="input-supplier-name" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">Tipo de Serviço</Label>
              <Input value={form.serviceTypeName} onChange={e => setForm(f => ({ ...f, serviceTypeName: e.target.value }))}
                className="bg-slate-800 border-slate-700" data-testid="input-service-type" /></div>
            <div><Label className="text-slate-300">Valor Solicitado</Label>
              <Input value={form.requestedAmount} onChange={e => setForm(f => ({ ...f, requestedAmount: e.target.value }))}
                placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-requested-amount" /></div>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !form.referenceCode} className="w-full" data-testid="button-submit-transaction">
            {isPending ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
            Criar Transação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Layer1Dialog({ open, onOpenChange, tx, onSubmit, isPending }: any) {
  const [form, setForm] = useState({
    source: "", requesterName: "", requesterDepartment: "", destination: "",
    travelDate: "", returnDate: "", reservationCode: "", supplierConfirmation: "",
    approvalReference: "", requestedAmount: "", paymentMethod: "", supplierCnpj: tx?.supplierCnpj || "",
  });
  const handleSubmit = () => {
    if (!form.source) return;
    onSubmit(form);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            Camada 1 — Pedido do Cliente
            <Badge className="ml-2 bg-slate-700 text-slate-300">{tx?.referenceCode}</Badge>
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-slate-400">Ingestão de dados do pedido original (OBT/GDS/email/workflow de aprovação).</p>
        <div className="space-y-3">
          <div><Label className="text-slate-300">Fonte de Dados *</Label>
            <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
              <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-l1-source"><SelectValue placeholder="Selecione a fonte" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="obt">OBT (Online Booking Tool)</SelectItem>
                <SelectItem value="gds">GDS (Amadeus/Sabre/Travelport)</SelectItem>
                <SelectItem value="email">E-mail/Requisição</SelectItem>
                <SelectItem value="approval">Workflow de Aprovação</SelectItem>
                <SelectItem value="manual">Entrada Manual</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">Solicitante</Label>
              <Input value={form.requesterName} onChange={e => setForm(f => ({ ...f, requesterName: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-requester" /></div>
            <div><Label className="text-slate-300">Departamento</Label>
              <Input value={form.requesterDepartment} onChange={e => setForm(f => ({ ...f, requesterDepartment: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-dept" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Destino</Label>
              <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-destination" /></div>
            <div><Label className="text-slate-300">Data Ida</Label>
              <Input type="date" value={form.travelDate} onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-travel-date" /></div>
            <div><Label className="text-slate-300">Data Volta</Label>
              <Input type="date" value={form.returnDate} onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-return-date" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">Localizador/Reserva</Label>
              <Input value={form.reservationCode} onChange={e => setForm(f => ({ ...f, reservationCode: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-reservation" /></div>
            <div><Label className="text-slate-300">Confirmação Fornecedor</Label>
              <Input value={form.supplierConfirmation} onChange={e => setForm(f => ({ ...f, supplierConfirmation: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-confirmation" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Ref. Aprovação</Label>
              <Input value={form.approvalReference} onChange={e => setForm(f => ({ ...f, approvalReference: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-approval" /></div>
            <div><Label className="text-slate-300">Valor Solicitado</Label>
              <Input value={form.requestedAmount} onChange={e => setForm(f => ({ ...f, requestedAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l1-amount" /></div>
            <div><Label className="text-slate-300">Forma Pagamento</Label>
              <Input value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l1-payment" /></div>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !form.source} className="w-full" data-testid="button-submit-layer1">
            {isPending ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <ArrowDownToLine className="w-4 h-4 mr-1" />}
            Ingerir Camada 1
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Layer2Dialog({ open, onOpenChange, tx, onSubmit, isPending }: any) {
  const [form, setForm] = useState({
    source: "", invoiceNumber: "", invoiceDate: "", invoiceDueDate: "",
    invoicedAmount: "", supplierPaidAmount: "", clientPaidAmount: "",
    fiscalDocType: "", fiscalDocNumber: "", fiscalDocAmount: "",
    feeAmount: "", commissionExpected: "", incentiveExpected: "", paymentMethodErp: "",
  });
  const handleSubmit = () => {
    if (!form.source) return;
    const data: any = { ...form };
    if (!data.fiscalDocType) delete data.fiscalDocType;
    onSubmit(data);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-400" />
            Camada 2 — ERP / Faturamento
            <Badge className="ml-2 bg-slate-700 text-slate-300">{tx?.referenceCode}</Badge>
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-slate-400">Ingestão de dados do ERP (fatura, nota fiscal, nota de débito). Cruzamento automático com Camada 1.</p>
        <div className="space-y-3">
          <div><Label className="text-slate-300">Fonte ERP *</Label>
            <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
              <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-l2-source"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sap">SAP</SelectItem>
                <SelectItem value="totvs">TOTVS</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
                <SelectItem value="netsuite">NetSuite</SelectItem>
                <SelectItem value="manual">Entrada Manual</SelectItem>
              </SelectContent>
            </Select></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Nº Fatura</Label>
              <Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l2-invoice" /></div>
            <div><Label className="text-slate-300">Data Emissão</Label>
              <Input type="date" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l2-invoice-date" /></div>
            <div><Label className="text-slate-300">Vencimento</Label>
              <Input type="date" value={form.invoiceDueDate} onChange={e => setForm(f => ({ ...f, invoiceDueDate: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l2-due-date" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Valor Faturado</Label>
              <Input value={form.invoicedAmount} onChange={e => setForm(f => ({ ...f, invoicedAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-invoiced" /></div>
            <div><Label className="text-slate-300">Pago ao Fornecedor</Label>
              <Input value={form.supplierPaidAmount} onChange={e => setForm(f => ({ ...f, supplierPaidAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-supplier-paid" /></div>
            <div><Label className="text-slate-300">Pago pelo Cliente</Label>
              <Input value={form.clientPaidAmount} onChange={e => setForm(f => ({ ...f, clientPaidAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-client-paid" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Tipo Doc Fiscal</Label>
              <Select value={form.fiscalDocType} onValueChange={v => setForm(f => ({ ...f, fiscalDocType: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-l2-fiscal-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nf">Nota Fiscal</SelectItem>
                  <SelectItem value="recibo">Recibo</SelectItem>
                  <SelectItem value="fatura">Fatura</SelectItem>
                </SelectContent>
              </Select></div>
            <div><Label className="text-slate-300">Nº Doc Fiscal</Label>
              <Input value={form.fiscalDocNumber} onChange={e => setForm(f => ({ ...f, fiscalDocNumber: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l2-fiscal-number" /></div>
            <div><Label className="text-slate-300">Valor Doc Fiscal</Label>
              <Input value={form.fiscalDocAmount} onChange={e => setForm(f => ({ ...f, fiscalDocAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-fiscal-amount" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Taxa FEE</Label>
              <Input value={form.feeAmount} onChange={e => setForm(f => ({ ...f, feeAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-fee" /></div>
            <div><Label className="text-slate-300">Comissão Esperada</Label>
              <Input value={form.commissionExpected} onChange={e => setForm(f => ({ ...f, commissionExpected: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-commission" /></div>
            <div><Label className="text-slate-300">Incentivo Esperado</Label>
              <Input value={form.incentiveExpected} onChange={e => setForm(f => ({ ...f, incentiveExpected: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l2-incentive" /></div>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !form.source} className="w-full" data-testid="button-submit-layer2">
            {isPending ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <ArrowDownToLine className="w-4 h-4 mr-1" />}
            Ingerir Camada 2
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Layer3Dialog({ open, onOpenChange, tx, onSubmit, isPending }: any) {
  const [form, setForm] = useState({
    source: "", type: "" as string, bankConfirmedAmount: "", transactionDate: "",
    cardLastFour: "", bankReference: "", supplierPaidConfirmed: "", clientPaidConfirmed: "",
    commissionReceived: "", incentiveReceived: "", feeReceived: "",
  });
  const handleSubmit = () => {
    if (!form.source || !form.type) return;
    onSubmit(form);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            Camada 3 — Extrato Bancário
            <Badge className="ml-2 bg-slate-700 text-slate-300">{tx?.referenceCode}</Badge>
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-slate-400">Ingestão bancária (conta corrente / cartão de crédito / cartão virtual VCN). Cruzamento triplo automático.</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">Fonte Bancária *</Label>
              <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-l3-source"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="extrato_cc">Extrato Conta Corrente</SelectItem>
                  <SelectItem value="extrato_cartao">Extrato Cartão Crédito</SelectItem>
                  <SelectItem value="extrato_vcn">Extrato Cartão Virtual (VCN)</SelectItem>
                  <SelectItem value="ofx">Arquivo OFX</SelectItem>
                  <SelectItem value="manual">Entrada Manual</SelectItem>
                </SelectContent>
              </Select></div>
            <div><Label className="text-slate-300">Tipo de Conta *</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-l3-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_virtual">Cartão Virtual (VCN)</SelectItem>
                </SelectContent>
              </Select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Valor Confirmado Banco</Label>
              <Input value={form.bankConfirmedAmount} onChange={e => setForm(f => ({ ...f, bankConfirmedAmount: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l3-bank-amount" /></div>
            <div><Label className="text-slate-300">Data Transação</Label>
              <Input type="date" value={form.transactionDate} onChange={e => setForm(f => ({ ...f, transactionDate: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l3-date" /></div>
            <div><Label className="text-slate-300">Ref. Bancária</Label>
              <Input value={form.bankReference} onChange={e => setForm(f => ({ ...f, bankReference: e.target.value }))} className="bg-slate-800 border-slate-700" data-testid="input-l3-bank-ref" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">Pgto Fornecedor Confirmado</Label>
              <Input value={form.supplierPaidConfirmed} onChange={e => setForm(f => ({ ...f, supplierPaidConfirmed: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l3-supplier-confirmed" /></div>
            <div><Label className="text-slate-300">Pgto Cliente Confirmado</Label>
              <Input value={form.clientPaidConfirmed} onChange={e => setForm(f => ({ ...f, clientPaidConfirmed: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l3-client-confirmed" /></div>
          </div>
          {form.type === "cartao_credito" || form.type === "cartao_virtual" ? (
            <div><Label className="text-slate-300">Últimos 4 dígitos do Cartão</Label>
              <Input value={form.cardLastFour} onChange={e => setForm(f => ({ ...f, cardLastFour: e.target.value }))} maxLength={4} className="bg-slate-800 border-slate-700" data-testid="input-l3-card-last4" /></div>
          ) : null}
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300">Comissão Recebida</Label>
              <Input value={form.commissionReceived} onChange={e => setForm(f => ({ ...f, commissionReceived: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l3-commission" /></div>
            <div><Label className="text-slate-300">Incentivo Recebido</Label>
              <Input value={form.incentiveReceived} onChange={e => setForm(f => ({ ...f, incentiveReceived: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l3-incentive" /></div>
            <div><Label className="text-slate-300">FEE Recebida</Label>
              <Input value={form.feeReceived} onChange={e => setForm(f => ({ ...f, feeReceived: e.target.value }))} placeholder="0.00" className="bg-slate-800 border-slate-700" data-testid="input-l3-fee" /></div>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !form.source || !form.type} className="w-full" data-testid="button-submit-layer3">
            {isPending ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <ArrowDownToLine className="w-4 h-4 mr-1" />}
            Ingerir Camada 3
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TransactionDetailDialog({ open, onOpenChange, tx, isLoading }: any) {
  if (!tx) return null;
  const logs = tx.reconciliationLog || [];

  const stepLabels: Record<string, string> = {
    supplier_validation: "Validação Fornecedor",
    layer1_ingestion: "Ingestão Camada 1",
    layer2_ingestion: "Ingestão Camada 2",
    cross_match_1_2: "Cruzamento C1×C2",
    layer3_ingestion: "Ingestão Camada 3",
    cross_match_1_2_3: "Cruzamento Triplo",
    full_reconciliation: "Reconciliação Final",
    fee_check: "Verificação FEE",
    commission_check: "Verificação Comissão",
    fiscal_check: "Verificação Fiscal",
  };

  const resultColors: Record<string, string> = {
    match: "text-emerald-400",
    partial: "text-amber-400",
    divergent: "text-red-400",
    blocked: "text-red-500",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transação {tx.referenceCode}
            <Badge className={PIPELINE_STATUS_COLORS[tx.status] || ""}>{PIPELINE_STATUS_LABELS[tx.status] || tx.status}</Badge>
            <Badge className={RECON_STATUS_COLORS[tx.reconciliationStatus] || ""}>{RECON_LABELS[tx.reconciliationStatus] || tx.reconciliationStatus}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.layer1At ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-400"}`}>C1</div>
              <span className="text-[10px] text-slate-400 mt-1">Pedido</span>
            </div>
            <ArrowRight className={`w-4 h-4 ${tx.layer1At ? "text-blue-400" : "text-slate-600"}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.layer2At ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400"}`}>C2</div>
              <span className="text-[10px] text-slate-400 mt-1">ERP</span>
            </div>
            <ArrowRight className={`w-4 h-4 ${tx.layer2At ? "text-indigo-400" : "text-slate-600"}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.layer3At ? "bg-purple-500 text-white" : "bg-slate-700 text-slate-400"}`}>C3</div>
              <span className="text-[10px] text-slate-400 mt-1">Banco</span>
            </div>
            <ArrowRight className={`w-4 h-4 ${tx.reconciliationAt ? "text-emerald-400" : "text-slate-600"}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tx.reconciliationStatus === "matched" ? "bg-emerald-500 text-white" : tx.reconciliationStatus === "divergent" ? "bg-red-500 text-white" : tx.reconciliationStatus === "partial" ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-400"}`} data-testid="indicator-final">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Final</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">Informações Gerais</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Fornecedor:</span><span className="text-white">{tx.supplierName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">CNPJ:</span><span className="text-white font-mono">{tx.supplierCnpj || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Serviço:</span><span className="text-white">{tx.serviceTypeName || "—"}</span></div>
                {tx.layer3Type && <div className="flex justify-between"><span className="text-slate-400">Tipo Conta:</span><span className="text-white">{LAYER3_LABELS[tx.layer3Type] || tx.layer3Type}</span></div>}
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">Valores</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Solicitado:</span><span className="text-white">{formatBRL(tx.requestedAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Faturado:</span><span className="text-white">{formatBRL(tx.invoicedAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Pago Fornecedor:</span><span className="text-white">{formatBRL(tx.supplierPaidAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Pago Cliente:</span><span className="text-white">{formatBRL(tx.clientPaidAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Confirmado Banco:</span><span className="text-emerald-400 font-bold">{formatBRL(tx.bankConfirmedAmount)}</span></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">FEE</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Valor:</span><span className="text-white">{formatBRL(tx.feeAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Reconciliada:</span>
                  <Badge className={tx.feeReconciled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>{tx.feeReconciled ? "Sim" : "Não"}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">Comissão</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Esperada:</span><span className="text-white">{formatBRL(tx.commissionExpected)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Recebida:</span><span className="text-emerald-400">{formatBRL(tx.commissionReceived)}</span></div>
              </CardContent>
            </Card>
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">Incentivo</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Esperado:</span><span className="text-white">{formatBRL(tx.incentiveExpected)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Recebido:</span><span className="text-emerald-400">{formatBRL(tx.incentiveReceived)}</span></div>
              </CardContent>
            </Card>
          </div>

          {tx.fiscalDocNumber && (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">Documento Fiscal</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 text-sm">
                <div className="flex gap-4">
                  <span className="text-slate-400">Tipo: <span className="text-white">{tx.fiscalDocType === "nf" ? "Nota Fiscal" : tx.fiscalDocType === "recibo" ? "Recibo" : "Fatura"}</span></span>
                  <span className="text-slate-400">Nº: <span className="text-white font-mono">{tx.fiscalDocNumber}</span></span>
                  <span className="text-slate-400">Valor: <span className="text-white">{formatBRL(tx.fiscalDocAmount)}</span></span>
                </div>
              </CardContent>
            </Card>
          )}

          {tx.reconciliationNotes && (
            <Card className={`border-slate-700 ${tx.reconciliationStatus === "divergent" ? "bg-red-900/20 border-red-800" : tx.reconciliationStatus === "matched" ? "bg-emerald-900/20 border-emerald-800" : "bg-amber-900/20 border-amber-800"}`}>
              <CardContent className="p-3">
                <p className="text-xs font-medium text-slate-300 mb-1">Notas de Reconciliação:</p>
                <p className="text-sm text-white" data-testid="text-recon-notes">{tx.reconciliationNotes}</p>
              </CardContent>
            </Card>
          )}

          {logs.length > 0 && (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs text-slate-400">Timeline de Reconciliação</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-2">
                  {logs.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="flex items-start gap-3 text-sm" data-testid={`log-entry-${idx}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{stepLabels[log.step] || log.step}</span>
                          <span className={`text-xs font-bold ${resultColors[log.result] || "text-slate-400"}`}>{log.result?.toUpperCase()}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(log.createdAt)}</span>
                        </div>
                        {log.details && typeof log.details === "object" && (
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono break-all">
                            {Object.entries(log.details as Record<string, any>).filter(([k]) => !["source"].includes(k)).map(([k, v]) => (
                              <span key={k} className="mr-3">{k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-3 text-[10px] text-slate-500">
            <div>C1: {tx.layer1Source || "—"} {tx.layer1At ? formatDate(tx.layer1At) : ""}</div>
            <div>C2: {tx.layer2Source || "—"} {tx.layer2At ? formatDate(tx.layer2At) : ""}</div>
            <div>C3: {tx.layer3Source || "—"} {tx.layer3At ? formatDate(tx.layer3At) : ""}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
