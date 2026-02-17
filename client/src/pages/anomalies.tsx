import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Search,
  CheckCircle,
  ShieldAlert,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { formatDateTime, getAnomalyTypeLabel, getSeverityLabel, getRiskBadgeVariant } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Anomaly } from "@shared/schema";

export default function Anomalies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [resolvedFilter, setResolvedFilter] = useState("all");
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [resolution, setResolution] = useState("");
  const { toast } = useToast();

  const { data: anomalies, isLoading } = useQuery<Anomaly[]>({
    queryKey: ["/api/anomalies"],
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => {
      const res = await apiRequest("PATCH", `/api/anomalies/${id}`, {
        resolved: true,
        resolvedBy: "Auditor",
        resolution,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anomalies"] });
      toast({ title: "Anomalia resolvida com sucesso" });
      setSelectedAnomaly(null);
      setResolution("");
    },
    onError: () => {
      toast({ title: "Erro ao resolver anomalia", variant: "destructive" });
    },
  });

  const filtered = anomalies?.filter((a) => {
    const matchSearch = a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = severityFilter === "all" || a.severity === severityFilter;
    const matchResolved =
      resolvedFilter === "all" ||
      (resolvedFilter === "resolved" && a.resolved) ||
      (resolvedFilter === "unresolved" && !a.resolved);
    return matchSearch && matchSeverity && matchResolved;
  });

  const unresolvedCount = anomalies?.filter((a) => !a.resolved).length || 0;
  const criticalCount = anomalies?.filter((a) => a.severity === "critical" && !a.resolved).length || 0;

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "high": return <ShieldAlert className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default: return <Eye className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-anomalies-title">
          Deteccao de Anomalias
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Padroes suspeitos e inconsistencias identificadas nas despesas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-yellow-500/10">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Anomalias</p>
              <p className="text-xl font-bold">{anomalies?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-red-500/10">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nao Resolvidas</p>
              <p className="text-xl font-bold">{unresolvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Criticas Pendentes</p>
              <p className="text-xl font-bold">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anomalias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-anomalies"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-severity">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Critico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-resolved">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unresolved">Nao Resolvidas</SelectItem>
            <SelectItem value="resolved">Resolvidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((anomaly) => (
            <Card
              key={anomaly.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedAnomaly(anomaly)}
              data-testid={`card-anomaly-${anomaly.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {severityIcon(anomaly.severity)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{anomaly.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">
                          {getAnomalyTypeLabel(anomaly.type)}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDateTime(anomaly.detectedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getRiskBadgeVariant(anomaly.severity)} className="text-[10px]">
                      {getSeverityLabel(anomaly.severity)}
                    </Badge>
                    {anomaly.resolved ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle className="w-10 h-10 mb-3 text-green-500" />
            <p className="text-sm font-medium">Nenhuma anomalia encontrada</p>
            <p className="text-xs mt-1">O sistema esta monitorando as despesas</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedAnomaly} onOpenChange={() => setSelectedAnomaly(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedAnomaly && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {severityIcon(selectedAnomaly.severity)}
                  Detalhes da Anomalia
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getRiskBadgeVariant(selectedAnomaly.severity)}>
                    {getSeverityLabel(selectedAnomaly.severity)}
                  </Badge>
                  <Badge variant="secondary">
                    {getAnomalyTypeLabel(selectedAnomaly.type)}
                  </Badge>
                  <Badge variant={selectedAnomaly.resolved ? "outline" : "default"}>
                    {selectedAnomaly.resolved ? "Resolvida" : "Pendente"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Descricao</h4>
                  <p className="text-sm">{selectedAnomaly.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Detectada em</h4>
                  <p className="text-sm">{formatDateTime(selectedAnomaly.detectedAt)}</p>
                </div>
                {selectedAnomaly.resolved && selectedAnomaly.resolution && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Resolucao</h4>
                    <p className="text-sm">{selectedAnomaly.resolution}</p>
                    {selectedAnomaly.resolvedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolvida por: {selectedAnomaly.resolvedBy}
                      </p>
                    )}
                  </div>
                )}
                {!selectedAnomaly.resolved && (
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Resolucao</h4>
                      <Textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Descreva a resolucao da anomalia..."
                        data-testid="input-anomaly-resolution"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        resolveMutation.mutate({
                          id: selectedAnomaly.id,
                          resolution,
                        })
                      }
                      disabled={!resolution.trim() || resolveMutation.isPending}
                      className="w-full"
                      data-testid="button-resolve-anomaly"
                    >
                      {resolveMutation.isPending ? "Resolvendo..." : "Marcar como Resolvida"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
