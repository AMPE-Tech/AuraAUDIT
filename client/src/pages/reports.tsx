import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileBarChart,
  Download,
  Plus,
  ShieldCheck,
  Zap,
  Bot,
  ArrowRight,
  Hash,
  Calendar,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Artifact } from "@shared/schema";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  reviewed: { label: "Revisado", variant: "default" },
  approved: { label: "Aprovado", variant: "outline" },
};

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileBarChart }> = {
  official: { label: "Oficial", icon: ShieldCheck },
  quick: { label: "Rápido", icon: Zap },
  ai_output: { label: "AI Output", icon: Bot },
};

function ArtifactList({ type }: { type: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const { data: artifacts, isLoading } = useQuery<Artifact[]>({
    queryKey: ["/api/reports/artifacts", `?type=${type}`],
  });

  const advanceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/reports/artifacts/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/artifacts"] });
      toast({ title: "Status atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  const handleDownload = async (artifact: Artifact) => {
    try {
      const res = await fetch(`/api/reports/artifacts/${artifact.id}/download`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Download failed");

      const sha256 = res.headers.get("X-SHA256") || "";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${artifact.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Download concluído", description: `SHA-256: ${sha256.substring(0, 16)}...` });
    } catch {
      toast({ title: "Erro no download", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-1/3 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!artifacts || artifacts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileBarChart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground" data-testid="text-no-artifacts">
            Nenhum artefato encontrado nesta categoria
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {artifacts.map((artifact) => {
        const statusCfg = STATUS_CONFIG[artifact.status] || STATUS_CONFIG.draft;
        const typeCfg = TYPE_CONFIG[artifact.type] || TYPE_CONFIG.official;
        const TypeIcon = typeCfg.icon;
        const nextStatus = artifact.status === "draft" ? "reviewed" : artifact.status === "reviewed" ? "approved" : null;

        return (
          <Card key={artifact.id} data-testid={`card-artifact-${artifact.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <TypeIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`text-artifact-title-${artifact.id}`}>
                      {artifact.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]" data-testid={`badge-artifact-type-${artifact.id}`}>
                        {typeCfg.label}
                      </Badge>
                      <Badge variant={statusCfg.variant} className="text-[10px]" data-testid={`badge-artifact-status-${artifact.id}`}>
                        {statusCfg.label}
                      </Badge>
                    </div>
                    {artifact.sha256 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 mt-1.5 cursor-default">
                            <Hash className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-mono" data-testid={`text-artifact-sha-${artifact.id}`}>
                              {artifact.sha256.substring(0, 16)}...
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs break-all max-w-[300px]">SHA-256: {artifact.sha256}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground" data-testid={`text-artifact-date-${artifact.id}`}>
                        {new Date(artifact.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {artifact.content && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(artifact)}
                          data-testid={`button-download-artifact-${artifact.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download (SHA-256 no header)</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isAdmin && nextStatus && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => advanceStatusMutation.mutate({ id: artifact.id, status: nextStatus })}
                      disabled={advanceStatusMutation.isPending}
                      data-testid={`button-advance-status-${artifact.id}`}
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      {nextStatus === "reviewed" ? "Revisar" : "Aprovar"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [newType, setNewType] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reports/artifacts", {
        type: newType,
        title: newTitle,
        content: newContent || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/artifacts"] });
      toast({ title: "Artefato criado com sucesso" });
      setCreateOpen(false);
      setNewType("");
      setNewTitle("");
      setNewContent("");
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar artefato", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reports-title">
            Biblioteca de Relatórios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Artefatos oficiais, relatórios rápidos e outputs de IA
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-artifact">
              <Plus className="w-4 h-4 mr-2" />
              Novo Artefato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Artefato</DialogTitle>
              <DialogDescription>Adicione um novo artefato à biblioteca de relatórios.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="artifact-type">Tipo</Label>
                <Select value={newType} onValueChange={setNewType} data-testid="select-artifact-type">
                  <SelectTrigger id="artifact-type" data-testid="select-trigger-artifact-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official" data-testid="select-item-official">Oficial</SelectItem>
                    <SelectItem value="quick" data-testid="select-item-quick">Rápido</SelectItem>
                    <SelectItem value="ai_output" data-testid="select-item-ai-output">AI Output</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="artifact-title">Título</Label>
                <Input
                  id="artifact-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Título do artefato"
                  data-testid="input-artifact-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artifact-content">Conteúdo</Label>
                <Textarea
                  id="artifact-content"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Conteúdo do artefato (opcional)"
                  rows={6}
                  data-testid="input-artifact-content"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!newType || !newTitle.trim() || createMutation.isPending}
                data-testid="button-submit-artifact"
              >
                {createMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="official" data-testid="tabs-reports">
        <TabsList data-testid="tabs-list-reports">
          <TabsTrigger value="official" data-testid="tab-official">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Oficiais
          </TabsTrigger>
          <TabsTrigger value="quick" data-testid="tab-quick">
            <Zap className="w-4 h-4 mr-1.5" />
            Rápidos
          </TabsTrigger>
          <TabsTrigger value="ai_output" data-testid="tab-ai-output">
            <Bot className="w-4 h-4 mr-1.5" />
            AI Outputs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="official" className="mt-4">
          <ArtifactList type="official" />
        </TabsContent>
        <TabsContent value="quick" className="mt-4">
          <ArtifactList type="quick" />
        </TabsContent>
        <TabsContent value="ai_output" className="mt-4">
          <ArtifactList type="ai_output" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
