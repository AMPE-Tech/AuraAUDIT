import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FolderSearch,
  CheckCircle2,
  Search,
  AlertCircle,
  Circle,
  File,
  Shield,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Filter,
} from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "auditado":
      return <Badge className="text-[10px] bg-emerald-600">Auditado</Badge>;
    case "reprovado":
      return <Badge className="text-[10px] bg-red-600">Reprovado</Badge>;
    case "em_analise":
      return <Badge className="text-[10px] bg-amber-500 text-amber-950">Em analise</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
  }
}

function getCardClass(status: string) {
  switch (status) {
    case "auditado":
      return "p-4 rounded-lg border border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/20";
    case "reprovado":
      return "p-4 rounded-lg border border-red-400/60 bg-red-50/40 dark:bg-red-950/20";
    case "em_analise":
      return "p-4 rounded-lg border border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20";
    default:
      return "p-4 rounded-lg border border-border/50 bg-muted/20";
  }
}

export default function AdminDocuments() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery<{ uploads: any[] }>({
    queryKey: ["/api/admin/uploads"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/uploads/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/uploads"] });
      const label = variables.status === "auditado" ? "Auditado" : variables.status === "reprovado" ? "Reprovado" : "Em analise";
      toast({ title: `Status atualizado para: ${label}` });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const uploads = data?.uploads || [];
  const filtered = statusFilter === "all" ? uploads : uploads.filter((u: any) => u.status === statusFilter);

  const counts = {
    all: uploads.length,
    em_analise: uploads.filter((u: any) => u.status === "em_analise" || u.status === "uploaded" || u.status === "aguardando_validacao").length,
    auditado: uploads.filter((u: any) => u.status === "auditado" || u.status === "validado").length,
    reprovado: uploads.filter((u: any) => u.status === "reprovado").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-docs-title">
            Documentos do Cliente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revisar, aprovar ou reprovar documentos enviados pelos clientes
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Admin
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => setStatusFilter("all")}
          data-testid="filter-all"
        >
          Todos ({counts.all})
        </Button>
        <Button
          variant={statusFilter === "em_analise" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => setStatusFilter("em_analise")}
          data-testid="filter-em-analise"
        >
          Em analise ({counts.em_analise})
        </Button>
        <Button
          variant={statusFilter === "auditado" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => setStatusFilter("auditado")}
          data-testid="filter-auditado"
        >
          Auditado ({counts.auditado})
        </Button>
        <Button
          variant={statusFilter === "reprovado" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => setStatusFilter("reprovado")}
          data-testid="filter-reprovado"
        >
          Reprovado ({counts.reprovado})
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderSearch className="w-4 h-4 text-primary" />
            Documentos Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
              <FolderSearch className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u: any) => {
                const effectiveStatus =
                  u.status === "validado" ? "auditado" :
                  u.status === "aguardando_validacao" || u.status === "uploaded" ? "em_analise" :
                  u.status;

                return (
                  <div key={u.id} className={getCardClass(effectiveStatus)} data-testid={`admin-doc-${u.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {effectiveStatus === "auditado" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : effectiveStatus === "reprovado" ? (
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        ) : effectiveStatus === "em_analise" ? (
                          <Search className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{u.documentKey}</p>
                            {getStatusBadge(effectiveStatus)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <File className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[11px] text-muted-foreground truncate">{u.originalName}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatFileSize(u.fileSize)} · {new Date(u.uploadedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            {u.sha256 && ` · SHA-256: ${u.sha256.substring(0, 16)}...`}
                          </p>
                          {u.clientChecked && (
                            <Badge variant="outline" className="text-[9px] mt-1 gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Cliente confirmou dados
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {effectiveStatus !== "auditado" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            onClick={() => statusMutation.mutate({ id: u.id, status: "auditado" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-approve-${u.id}`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Aprovar
                          </Button>
                        )}
                        {effectiveStatus !== "reprovado" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 gap-1.5 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => statusMutation.mutate({ id: u.id, status: "reprovado" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-reject-${u.id}`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Reprovar
                          </Button>
                        )}
                        {(effectiveStatus === "auditado" || effectiveStatus === "reprovado") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 gap-1.5"
                            onClick={() => statusMutation.mutate({ id: u.id, status: "em_analise" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-revert-${u.id}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
