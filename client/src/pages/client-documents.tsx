import { useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FolderOpen,
  Shield,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Upload,
  Download,
  Target,
  ListChecks,
  AlertCircle,
  Info,
  File,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const SCOPE_ITEMS = [
  { item: "Auditoria forense completa em despesas de viagens corporativas e eventos", status: "combinado" },
  { item: "Analise de conformidade com politicas internas de viagens", status: "combinado" },
  { item: "Reconciliacao entre sistemas OBT e Backoffice", status: "combinado" },
  { item: "Identificacao de anomalias, duplicidades e fraudes potenciais", status: "combinado" },
  { item: "Cruzamento de dados com fontes externas (cias aereas, agencias, cartoes)", status: "combinado" },
  { item: "Avaliacao de eficiencia operacional e oportunidades de economia", status: "combinado" },
  { item: "Verificacao de aderencia a Lei 13.964/2019 e normas anticorrupcao", status: "combinado" },
];

const DELIVERABLES = [
  { name: "Relatorio executivo consolidado", deadline: "A cada fase concluida", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Relatorio tecnico detalhado com achados, evidencias e analises", deadline: "Ao final do projeto", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Mapeamento de riscos e vulnerabilidades", deadline: "Fase 03 — Reconciliacao", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Recomendacoes praticas para correcao e melhoria", deadline: "Fase 04 — Apresentacao", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Plano de acao sugerido, priorizado por impacto e risco", deadline: "Fase 05 — Ajustes", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Dashboard Interativo de Resultados (tempo real via plataforma AuraAUDIT)", deadline: "Disponivel em tempo real", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Cadeia de Custodia Digital Completa (continuo)", deadline: "Continuo durante o projeto", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
];

const EXPECTED_DOCUMENTS = [
  { key: "contratos-prestadores", name: "7.1 Contratos com prestadores e clientes", responsible: "Cliente", formats: ".pdf, .doc, .docx" },
  { key: "backoffice-agencia", name: "7.2 Back office da agencia", responsible: "Cliente", formats: ".csv, .xlsx" },
  { key: "admin-bsplink-cias", name: "7.3 Administracao BSPLink e cias aereas integradas", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "portais-hoteleiros", name: "7.4 Portais administrativos de redes hoteleiras, operadores e consolidadores", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "acordos-corporativos", name: "7.5 Todos os acordos corporativos (cias aereas, hotelaria, banco, etc.)", responsible: "Cliente", formats: ".pdf, .doc, .docx" },
  { key: "obt-gds", name: "7.6 Sistema de OBTs e GDSs", responsible: "Cliente", formats: ".csv, .xlsx" },
  { key: "reembolso-credito", name: "7.7 Controle de reembolso e credito conciliados", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "pgtos-realizados", name: "7.8 Relatorios gerenciais de pagamentos realizados e pendentes", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "receitas-recebidas", name: "7.9 Relatorios gerenciais de receitas recebidas e pendentes", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "extratos-cartoes", name: "7.10 Extratos originais dos cartoes de credito utilizados", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "reservas-hospedagem", name: "7.11 Reservas originais e faturas de hospedagens pagas", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
  { key: "fee-rebate-comissoes", name: "7.12 Relatorio de cobranca de FEE, Rebate, Comissoes e Incentivos", responsible: "Cliente", formats: ".csv, .xlsx, .pdf" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "entregue":
      return <Badge className="text-[10px] bg-emerald-600">Entregue</Badge>;
    case "em_andamento":
      return <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Em andamento</Badge>;
    case "aguardando_dados":
      return <Badge variant="outline" className="text-[10px] gap-1"><AlertCircle className="w-2.5 h-2.5" />Aguardando dados</Badge>;
    case "pendente":
      return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
    case "combinado":
      return <Badge variant="outline" className="text-[10px] gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-primary" />Combinado</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function DocumentUploadRow({ doc, uploads, onUpload, onCheck, onDelete, uploadingKey }: {
  doc: typeof EXPECTED_DOCUMENTS[0];
  uploads: any[];
  onUpload: (key: string, file: globalThis.File) => void;
  onCheck: (uploadId: string, checked: boolean) => void;
  onDelete: (uploadId: string) => void;
  uploadingKey: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const docUploads = uploads.filter((u: any) => u.documentKey === doc.key);
  const hasUpload = docUploads.length > 0;
  const latestUpload = docUploads[0];
  const isUploading = uploadingKey === doc.key;

  const getDocStatus = () => {
    if (!hasUpload) return "pendente";
    if (latestUpload.status === "aguardando_validacao") return "aguardando_validacao";
    if (latestUpload.status === "validado") return "validado";
    return "uploaded";
  };

  const status = getDocStatus();

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border/50 transition-colors" data-testid={`doc-row-${doc.key}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {status === "validado" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : status === "aguardando_validacao" ? (
            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          ) : hasUpload ? (
            <File className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">{doc.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Responsavel: {doc.responsible} · Formatos: {doc.formats}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === "aguardando_validacao" && (
            <Badge variant="outline" className="text-[9px] gap-1 text-amber-600 border-amber-300 dark:border-amber-700 dark:text-amber-400">
              <Clock className="w-2.5 h-2.5" />
              Aguardando validacao
            </Badge>
          )}
          {status === "validado" && (
            <Badge className="text-[9px] bg-emerald-600">Validado</Badge>
          )}
          {status === "pendente" && (
            <Badge variant="outline" className="text-[9px]">Pendente</Badge>
          )}
          {status === "uploaded" && (
            <Badge variant="outline" className="text-[9px] text-blue-600 border-blue-300 dark:border-blue-700 dark:text-blue-400">
              Arquivo carregado
            </Badge>
          )}
        </div>
      </div>

      {hasUpload && (
        <div className="mt-2.5 ml-6 space-y-2">
          {docUploads.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-background border" data-testid={`upload-item-${u.id}`}>
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium truncate">{u.originalName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(u.fileSize)} · {new Date(u.uploadedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id={`check-${u.id}`}
                    checked={u.clientChecked}
                    onCheckedChange={(checked) => onCheck(u.id, checked === true)}
                    data-testid={`checkbox-validate-${u.id}`}
                  />
                  <label htmlFor={`check-${u.id}`} className="text-[10px] text-muted-foreground cursor-pointer select-none">
                    Dados conferidos
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(u.id)}
                  data-testid={`button-delete-${u.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 ml-6">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.json,.xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(doc.key, file);
            e.target.value = "";
          }}
          data-testid={`input-file-${doc.key}`}
        />
        <Button
          variant="outline"
          size="sm"
          className="text-[11px] h-7 gap-1.5"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          data-testid={`button-upload-${doc.key}`}
        >
          {isUploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {hasUpload ? "Enviar outro arquivo" : "Enviar arquivo"}
        </Button>
      </div>
    </div>
  );
}

export default function ClientDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const { data: uploadsData, isLoading } = useQuery<{ uploads: any[] }>({
    queryKey: ["/api/uploads"],
  });

  const uploads = uploadsData?.uploads || [];

  const uploadMutation = useMutation({
    mutationFn: async ({ key, file }: { key: string; file: globalThis.File }) => {
      setUploadingKey(key);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentKey", key);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha no upload");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      setUploadingKey(null);
      toast({ title: "Arquivo enviado", description: "Marque como conferido quando estiver pronto" });
    },
    onError: (error: any) => {
      setUploadingKey(null);
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    },
  });

  const checkMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const res = await apiRequest("PATCH", `/api/uploads/${id}/check`, { checked });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar status", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/uploads/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({ title: "Arquivo removido" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao remover arquivo", variant: "destructive" });
    },
  });

  const totalDocs = EXPECTED_DOCUMENTS.length;
  const uploadedDocs = EXPECTED_DOCUMENTS.filter((d) =>
    uploads.some((u: any) => u.documentKey === d.key)
  ).length;
  const validatedDocs = EXPECTED_DOCUMENTS.filter((d) =>
    uploads.some((u: any) => u.documentKey === d.key && u.status === "aguardando_validacao")
  ).length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-documents-title">
            Meus Documentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documentos do projeto, entregaveis e acompanhamento | {user?.fullName}
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Lei 13.964/2019
        </Badge>
      </div>

      <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Aguardando documentos do cliente</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mt-0.5">
                Envie os arquivos abaixo e marque como "conferidos" para confirmar. Nossa equipe validara tudo de uma vez antes de iniciar as analises.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 ml-8">
            <div className="text-[11px] text-amber-700 dark:text-amber-400">
              <span className="font-semibold">{uploadedDocs}/{totalDocs}</span> enviados
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400">
              <span className="font-semibold">{validatedDocs}</span> aguardando validacao
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Escopo do Contrato
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Itens combinados na proposta comercial</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SCOPE_ITEMS.map((item) => (
              <div key={item.item} className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50" data-testid={`scope-item-${item.item.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-xs">{item.item}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Documentos Esperados do Cliente
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Envie os arquivos e marque o checklist "Dados conferidos" quando estiver pronto
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {EXPECTED_DOCUMENTS.map((doc) => (
                <DocumentUploadRow
                  key={doc.key}
                  doc={doc}
                  uploads={uploads}
                  onUpload={(key, file) => uploadMutation.mutate({ key, file })}
                  onCheck={(id, checked) => checkMutation.mutate({ id, checked })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  uploadingKey={uploadingKey}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Entregaveis da Auditoria
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Documentos e relatorios a serem produzidos pela AuraAUDIT</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground">Entregavel</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Prazo</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Dados do Cliente</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Auditoria AuraAUDIT</th>
                </tr>
              </thead>
              <tbody>
                {DELIVERABLES.map((d) => (
                  <tr key={d.name} className="border-b last:border-0" data-testid={`deliverable-row-${d.name.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-2 text-muted-foreground">{d.deadline}</td>
                    <td className="p-2 text-center">{getStatusBadge(d.clientStatus)}</td>
                    <td className="p-2 text-center">{getStatusBadge(d.auditStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            Relatorios e Arquivos Produzidos
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Documentos gerados durante a auditoria</p>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
            <FolderOpen className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhum documento produzido ainda</p>
            <p className="text-[11px] mt-1">Os relatorios serao disponibilizados aqui conforme as analises forem concluidas</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital — AuraDue</span>
        </div>
        <span>AuraAUDIT — Due Diligence Platform</span>
      </div>
    </div>
  );
}
