import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ScrollText,
  Search,
  Shield,
  Hash,
  User,
  Clock,
  FileText,
  Lock,
  Eye,
} from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import type { AuditTrail } from "@shared/schema";

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: "Criacao",
    update: "Atualizacao",
    delete: "Exclusao",
    approve: "Aprovacao",
    reject: "Rejeicao",
    flag: "Sinalizacao",
    resolve: "Resolucao",
    view: "Visualizacao",
  };
  return labels[action] || action;
}

function getEntityLabel(entity: string): string {
  const labels: Record<string, string> = {
    expense: "Despesa",
    audit_case: "Caso de Auditoria",
    anomaly: "Anomalia",
    user: "Usuario",
  };
  return labels[entity] || entity;
}

function getActionColor(action: string): "default" | "secondary" | "destructive" | "outline" {
  switch (action) {
    case "create": return "default";
    case "update": return "secondary";
    case "delete": return "destructive";
    case "flag": return "destructive";
    case "approve": return "outline";
    default: return "secondary";
  }
}

export default function AuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditTrail | null>(null);

  const { data: trail, isLoading } = useQuery<AuditTrail[]>({
    queryKey: ["/api/audit-trail"],
  });

  const filtered = trail?.filter((entry) => {
    const matchSearch =
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEntity = entityFilter === "all" || entry.entityType === entityFilter;
    return matchSearch && matchEntity;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-trail-title">
          Trilha de Auditoria
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registro imutavel de todas as operacoes - Cadeia de Custodia Digital (Lei 13.964/2019)
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Integridade Garantida</p>
            <p className="text-xs text-muted-foreground">
              Todos os registros possuem hash de integridade SHA-256 e sao imutaveis
            </p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {trail?.length || 0} registros
          </Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-trail"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-entity">
            <SelectValue placeholder="Entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Entidades</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="audit_case">Casos</SelectItem>
            <SelectItem value="anomaly">Anomalias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Card
              key={entry.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
              data-testid={`card-trail-${entry.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
                      <ScrollText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getActionColor(entry.action)} className="text-[10px]">
                          {getActionLabel(entry.action)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {getEntityLabel(entry.entityType)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{entry.userId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[80px]">
                        {entry.integrityHash.substring(0, 12)}...
                      </span>
                    </div>
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <ScrollText className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Nenhum registro encontrado</p>
            <p className="text-xs mt-1">A trilha de auditoria sera populada conforme operacoes forem realizadas</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Registro de Auditoria
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getActionColor(selectedEntry.action)}>
                    {getActionLabel(selectedEntry.action)}
                  </Badge>
                  <Badge variant="outline">
                    {getEntityLabel(selectedEntry.entityType)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Usuario</h4>
                    <p className="text-sm">{selectedEntry.userId}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Data/Hora</h4>
                    <p className="text-sm">{formatDateTime(selectedEntry.timestamp)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">ID da Entidade</h4>
                  <p className="text-sm font-mono">{selectedEntry.entityId}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Hash de Integridade (SHA-256)</h4>
                  <p className="text-xs font-mono break-all bg-background p-2 rounded-md border">
                    {selectedEntry.integrityHash}
                  </p>
                </div>
                {selectedEntry.ipAddress && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Endereco IP</h4>
                    <p className="text-sm font-mono">{selectedEntry.ipAddress}</p>
                  </div>
                )}
                {selectedEntry.dataBefore && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Dados Anteriores</h4>
                    <pre className="text-xs font-mono bg-background p-2 rounded-md border overflow-x-auto max-h-32">
                      {JSON.stringify(selectedEntry.dataBefore, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedEntry.dataAfter && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Dados Posteriores</h4>
                    <pre className="text-xs font-mono bg-background p-2 rounded-md border overflow-x-auto max-h-32">
                      {JSON.stringify(selectedEntry.dataAfter, null, 2)}
                    </pre>
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
