import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  Building2,
  Landmark,
  Play,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileQuestion,
  ArrowDownUp,
  RefreshCw,
  FileText,
} from "lucide-react";

type Pasta = "pagar" | "receber";

function formatCurrency(val: string | null | undefined): string {
  if (!val) return "—";
  const num = parseFloat(val);
  if (isNaN(num)) return "—";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    conciliado: { label: "Conciliado", variant: "default", icon: CheckCircle2 },
    conciliado_parcial: { label: "Parcial", variant: "secondary", icon: ArrowDownUp },
    divergente: { label: "Divergente", variant: "destructive", icon: AlertTriangle },
    nota_sem_pagamento: { label: "Nota s/ Pagamento", variant: "outline", icon: FileQuestion },
    pagamento_sem_nota: { label: "Pgto s/ Nota", variant: "destructive", icon: XCircle },
    nota_cancelada: { label: "Cancelada", variant: "outline", icon: XCircle },
    pendente: { label: "Pendente", variant: "outline", icon: RefreshCw },
  };

  const c = config[status] || config.pendente;
  const Icon = c.icon;

  return (
    <Badge variant={c.variant} className="gap-1" data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
}

function UploadSection({
  title,
  icon: Icon,
  accept,
  multiple,
  endpoint,
  pasta,
  queryKey,
  description,
}: {
  title: string;
  icon: any;
  accept: string;
  multiple?: boolean;
  endpoint: string;
  pasta: Pasta;
  queryKey: string;
  description: string;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("pasta", pasta);

    if (multiple) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    } else {
      formData.append("file", files[0]);
    }

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error || "Erro no upload");

      toast({
        title: `${data.count} registro(s) importado(s)`,
        description: title,
        duration: 5000,
      });

      queryClient.invalidateQueries({ queryKey: [queryKey, pasta] });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/resumo", pasta] });
    } catch (err: any) {
      toast({
        title: "Erro no upload",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card data-testid={`card-upload-${queryKey.replace("/api/conciliacao/", "")}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <label className="cursor-pointer">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
            data-testid={`input-upload-${queryKey.replace("/api/conciliacao/", "")}`}
          />
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {uploading ? "Importando..." : "Clique para selecionar arquivo(s)"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {accept.split(",").join(" / ")}
            </p>
          </div>
        </label>
      </CardContent>
    </Card>
  );
}

function PastaContent({ pasta }: { pasta: Pasta }) {
  const { toast } = useToast();

  const { data: nfseData = [] } = useQuery<any[]>({
    queryKey: ["/api/conciliacao/nfse", pasta],
    queryFn: () => fetch(`/api/conciliacao/nfse?pasta=${pasta}`, { credentials: "include" }).then(r => r.json()),
  });

  const { data: erpData = [] } = useQuery<any[]>({
    queryKey: ["/api/conciliacao/erp", pasta],
    queryFn: () => fetch(`/api/conciliacao/erp?pasta=${pasta}`, { credentials: "include" }).then(r => r.json()),
  });

  const { data: bancoData = [] } = useQuery<any[]>({
    queryKey: ["/api/conciliacao/banco", pasta],
    queryFn: () => fetch(`/api/conciliacao/banco?pasta=${pasta}`, { credentials: "include" }).then(r => r.json()),
  });

  const { data: resumo } = useQuery<any>({
    queryKey: ["/api/conciliacao/resumo", pasta],
    queryFn: () => fetch(`/api/conciliacao/resumo?pasta=${pasta}`, { credentials: "include" }).then(r => r.json()),
  });

  const { data: resultados = [] } = useQuery<any[]>({
    queryKey: ["/api/conciliacao/resultado", pasta],
    queryFn: () => fetch(`/api/conciliacao/resultado?pasta=${pasta}`, { credentials: "include" }).then(r => r.json()),
  });

  const executarMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/conciliacao/executar", { pasta }),
    onSuccess: () => {
      toast({ title: "Conciliacao executada", description: "Cruzamento NFS-e x ERP x Banco concluido", duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/resultado", pasta] });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/resumo", pasta] });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const limparMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/conciliacao/limpar", { pasta }),
    onSuccess: () => {
      toast({ title: "Dados limpos", description: "Todos os registros desta pasta foram removidos" });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/nfse", pasta] });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/erp", pasta] });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/banco", pasta] });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/resultado", pasta] });
      queryClient.invalidateQueries({ queryKey: ["/api/conciliacao/resumo", pasta] });
    },
  });

  const hasData = nfseData.length > 0 || erpData.length > 0 || bancoData.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UploadSection
          title="NFS-e (XML Prefeitura)"
          icon={FileText}
          accept=".xml"
          multiple
          endpoint="/api/conciliacao/nfse/upload"
          pasta={pasta}
          queryKey="/api/conciliacao/nfse"
          description="XML da Prefeitura de Curitiba"
        />
        <UploadSection
          title="ERP / STUR (Relatorio)"
          icon={FileSpreadsheet}
          accept=".csv,.xlsx,.xls"
          endpoint="/api/conciliacao/erp/upload"
          pasta={pasta}
          queryKey="/api/conciliacao/erp"
          description="Exportar do sistema ERP/STUR"
        />
        <UploadSection
          title="Extrato Bancario"
          icon={Landmark}
          accept=".csv,.xlsx,.xls"
          endpoint="/api/conciliacao/banco/upload"
          pasta={pasta}
          queryKey="/api/conciliacao/banco"
          description="Extrato do banco em CSV ou Excel"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" data-testid="text-nfse-count">{resumo?.nfseImportadas ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">NFS-e</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" data-testid="text-erp-count">{resumo?.erpImportados ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">ERP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" data-testid="text-banco-count">{resumo?.bancoImportados ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Banco</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="text-conciliados">{resumo?.conciliados ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Conciliados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600" data-testid="text-divergentes">{resumo?.divergentes ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Divergentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600" data-testid="text-sem-par">{(resumo?.notaSemPagamento ?? 0) + (resumo?.pagamentoSemNota ?? 0)}</p>
            <p className="text-[10px] text-muted-foreground">Sem Par</p>
          </CardContent>
        </Card>
      </div>

      {resumo?.totalValorNotas > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total NFS-e</p>
              <p className="text-xl font-bold" data-testid="text-total-notas">{formatCurrency(String(resumo.totalValorNotas))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total ERP</p>
              <p className="text-xl font-bold" data-testid="text-total-erp">{formatCurrency(String(resumo.totalValorErp))}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => executarMutation.mutate()}
          disabled={!hasData || executarMutation.isPending}
          className="gap-2"
          data-testid="button-executar-conciliacao"
        >
          <Play className="w-4 h-4" />
          {executarMutation.isPending ? "Processando..." : "Executar Conciliacao"}
        </Button>
        <Button
          variant="outline"
          onClick={() => limparMutation.mutate()}
          disabled={!hasData || limparMutation.isPending}
          className="gap-2"
          data-testid="button-limpar-dados"
        >
          <Trash2 className="w-4 h-4" />
          Limpar Dados
        </Button>
      </div>

      {nfseData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              NFS-e Importadas ({nfseData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nota</TableHead>
                    <TableHead>Emissao</TableHead>
                    <TableHead>Prestador</TableHead>
                    <TableHead>CNPJ Prestador</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>ISS</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nfseData.slice(0, 50).map((n: any) => (
                    <TableRow key={n.id} data-testid={`row-nfse-${n.id}`}>
                      <TableCell className="font-mono text-xs">{n.numeroNota || "—"}</TableCell>
                      <TableCell className="text-xs">{formatDate(n.dataEmissao)}</TableCell>
                      <TableCell className="text-xs">{n.razaoSocialPrestador || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{n.cnpjPrestador || "—"}</TableCell>
                      <TableCell className="text-xs font-medium">{formatCurrency(n.valorServico)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(n.valorIss)}</TableCell>
                      <TableCell>
                        <Badge variant={n.statusNota === "cancelada" ? "destructive" : "default"} className="text-[10px]">
                          {n.statusNota}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {erpData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Registros ERP/STUR ({erpData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NF</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Valor Bruto</TableHead>
                    <TableHead>Valor Liquido</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Centro Custo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {erpData.slice(0, 50).map((e: any) => (
                    <TableRow key={e.id} data-testid={`row-erp-${e.id}`}>
                      <TableCell className="font-mono text-xs">{e.numeroNf || "—"}</TableCell>
                      <TableCell className="text-xs">{e.fornecedor || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{e.cnpjFornecedor || "—"}</TableCell>
                      <TableCell className="text-xs font-medium">{formatCurrency(e.valorBruto)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(e.valorLiquido)}</TableCell>
                      <TableCell className="text-xs">{formatDate(e.dataPagamento)}</TableCell>
                      <TableCell className="text-xs">{e.centroCusto || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {bancoData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Extrato Bancario ({bancoData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Doc Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bancoData.slice(0, 50).map((b: any) => (
                    <TableRow key={b.id} data-testid={`row-banco-${b.id}`}>
                      <TableCell className="text-xs">{formatDate(b.dataTransacao)}</TableCell>
                      <TableCell className="text-xs">{b.descricao || "—"}</TableCell>
                      <TableCell className="text-xs font-medium">{formatCurrency(b.valor)}</TableCell>
                      <TableCell>
                        <Badge variant={b.tipo === "credito" ? "default" : "secondary"} className="text-[10px]">
                          {b.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatCurrency(b.saldo)}</TableCell>
                      <TableCell className="font-mono text-xs">{b.documentoRef || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {resultados.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4" />
              Resultado da Conciliacao ({resultados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Nota</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Valor Banco</TableHead>
                    <TableHead>Diferenca</TableHead>
                    <TableHead>Observacao</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultados.map((r: any) => (
                    <TableRow key={r.id} data-testid={`row-resultado-${r.id}`}>
                      <TableCell><StatusBadge status={r.statusConciliacao} /></TableCell>
                      <TableCell className="text-xs font-medium">{formatCurrency(r.valorNota)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(r.valorPago)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(r.valorBanco)}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {r.diferenca && parseFloat(r.diferenca) !== 0 ? (
                          <span className={parseFloat(r.diferenca) > 0 ? "text-red-600" : "text-green-600"}>
                            {formatCurrency(r.diferenca)}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate">{r.observacao || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ConciliarContas() {
  const [activeTab, setActiveTab] = useState<Pasta>("pagar");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
          <Building2 className="w-6 h-6" />
          Conciliar Contas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          NFS-e Prefeitura x Relatorio STUR (ERP) x Extrato Bancario
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Pasta)}>
        <TabsList className="grid w-full max-w-md grid-cols-2" data-testid="tabs-pasta">
          <TabsTrigger value="pagar" data-testid="tab-pagar">
            a) Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="receber" data-testid="tab-receber">
            b) Contas a Receber
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pagar" className="mt-4">
          <PastaContent pasta="pagar" />
        </TabsContent>

        <TabsContent value="receber" className="mt-4">
          <PastaContent pasta="receber" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
