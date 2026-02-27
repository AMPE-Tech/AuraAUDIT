import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  PieChart,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  Award,
  BarChart,
  CheckCircle,
  X,
  Pencil,
  LayoutDashboard,
} from "lucide-react";

type Widget = {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultConfig: Record<string, unknown>;
};

type DashboardView = {
  id: number;
  createdByUserId: string;
  name: string;
  description: string | null;
  layoutJson: unknown;
  filtersJson: unknown;
  widgetsJson: unknown;
  tags: string[] | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type PlacedWidget = {
  widgetId: string;
  name: string;
  icon: string;
};

const ICON_MAP: Record<string, typeof PieChart> = {
  PieChart,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  Award,
  BarChart,
  CheckCircle,
};

function getIconComponent(iconName: string) {
  return ICON_MAP[iconName] || BarChart;
}

export default function DashboardStudio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const [placedWidgets, setPlacedWidgets] = useState<PlacedWidget[]>([]);
  const [filterPeriodo, setFilterPeriodo] = useState("ultimo-mes");
  const [filterDepartamento, setFilterDepartamento] = useState("");
  const [filterFornecedor, setFilterFornecedor] = useState("");

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [saveTags, setSaveTags] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<DashboardView | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");

  const { data: widgets, isLoading: widgetsLoading } = useQuery<Widget[]>({
    queryKey: ["/api/dashboard/widgets"],
  });

  const { data: views, isLoading: viewsLoading } = useQuery<DashboardView[]>({
    queryKey: ["/api/dashboard/views"],
  });

  const createViewMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      widgetsJson: PlacedWidget[];
      filtersJson: Record<string, string>;
      tags: string[];
    }) => {
      const res = await apiRequest("POST", "/api/dashboard/views", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/views"] });
      setSaveDialogOpen(false);
      setSaveName("");
      setSaveDescription("");
      setSaveTags("");
      toast({ title: "View salva com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar view", variant: "destructive" });
    },
  });

  const updateViewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const res = await apiRequest("PUT", `/api/dashboard/views/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/views"] });
      setEditDialogOpen(false);
      setEditingView(null);
      toast({ title: "View atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar view", variant: "destructive" });
    },
  });

  const deleteViewMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/dashboard/views/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/views"] });
      toast({ title: "View removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover view", variant: "destructive" });
    },
  });

  const publishViewMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/dashboard/views/${id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/views"] });
      toast({ title: "Status de publicacao atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao publicar view", variant: "destructive" });
    },
  });

  function addWidget(widget: Widget) {
    setPlacedWidgets((prev) => [
      ...prev,
      { widgetId: widget.id, name: widget.name, icon: widget.icon },
    ]);
  }

  function removeWidget(index: number) {
    setPlacedWidgets((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!saveName.trim()) return;
    createViewMutation.mutate({
      name: saveName.trim(),
      description: saveDescription.trim(),
      widgetsJson: placedWidgets,
      filtersJson: {
        periodo: filterPeriodo,
        departamento: filterDepartamento,
        fornecedor: filterFornecedor,
      },
      tags: saveTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  function handleEditOpen(view: DashboardView) {
    setEditingView(view);
    setEditName(view.name);
    setEditDescription(view.description || "");
    setEditTags(view.tags?.join(", ") || "");
    setEditDialogOpen(true);
  }

  function handleEditSave() {
    if (!editingView || !editName.trim()) return;
    updateViewMutation.mutate({
      id: editingView.id,
      data: {
        name: editName.trim(),
        description: editDescription.trim(),
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    });
  }

  function loadView(view: DashboardView) {
    const w = view.widgetsJson as PlacedWidget[] | null;
    if (w && Array.isArray(w)) {
      setPlacedWidgets(w);
    }
    const f = view.filtersJson as Record<string, string> | null;
    if (f) {
      if (f.periodo) setFilterPeriodo(f.periodo);
      if (f.departamento) setFilterDepartamento(f.departamento);
      if (f.fornecedor) setFilterFornecedor(f.fornecedor);
    }
    toast({ title: `View "${view.name}" carregada` });
  }

  const myViews = views?.filter((v) => v.createdByUserId === user?.id) || [];
  const publishedViews = views?.filter((v) => v.isPublished) || [];

  return (
    <div className="flex h-full">
      <div className="w-64 border-r p-4 flex flex-col gap-4 overflow-auto">
        <h2 className="text-sm font-semibold" data-testid="text-widget-library-title">
          Biblioteca de Widgets
        </h2>
        {widgetsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {widgets?.map((widget) => {
              const IconComp = getIconComponent(widget.icon);
              return (
                <Card key={widget.id} className="p-3" data-testid={`card-widget-${widget.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <IconComp className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-tight">{widget.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => addWidget(widget)}
                      data-testid={`button-add-widget-${widget.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b p-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Dashboard Studio</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
              <SelectTrigger className="w-[140px]" data-testid="select-periodo">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ultimo-mes">Ultimo Mes</SelectItem>
                <SelectItem value="ultimo-trimestre">Ultimo Trimestre</SelectItem>
                <SelectItem value="ultimo-semestre">Ultimo Semestre</SelectItem>
                <SelectItem value="ultimo-ano">Ultimo Ano</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Departamento"
              value={filterDepartamento}
              onChange={(e) => setFilterDepartamento(e.target.value)}
              className="w-[140px]"
              data-testid="input-departamento"
            />
            <Input
              placeholder="Fornecedor"
              value={filterFornecedor}
              onChange={(e) => setFilterFornecedor(e.target.value)}
              className="w-[140px]"
              data-testid="input-fornecedor"
            />
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-open-save-dialog">
                  <Save className="w-4 h-4 mr-1" />
                  Salvar View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Dashboard View</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Input
                    placeholder="Nome da view"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    data-testid="input-save-name"
                  />
                  <Textarea
                    placeholder="Descricao (opcional)"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    className="resize-none"
                    data-testid="input-save-description"
                  />
                  <Input
                    placeholder="Tags (separadas por virgula)"
                    value={saveTags}
                    onChange={(e) => setSaveTags(e.target.value)}
                    data-testid="input-save-tags"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSave}
                    disabled={!saveName.trim() || createViewMutation.isPending}
                    data-testid="button-save-view"
                  >
                    {createViewMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {placedWidgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <LayoutDashboard className="w-10 h-10" />
              <p className="text-sm" data-testid="text-empty-canvas">
                Adicione widgets da biblioteca para montar seu dashboard
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {placedWidgets.map((pw, index) => {
                const IconComp = getIconComponent(pw.icon);
                return (
                  <Card key={index} data-testid={`card-placed-widget-${index}`}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <IconComp className="w-4 h-4 text-muted-foreground" />
                        {pw.name}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeWidget(index)}
                        data-testid={`button-remove-widget-${index}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 rounded-md bg-muted/50 flex items-center justify-center">
                        <IconComp className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <Tabs defaultValue="minhas" className="w-full">
            <TabsList data-testid="tabs-views">
              <TabsTrigger value="minhas" data-testid="tab-minhas-views">
                Minhas Views
              </TabsTrigger>
              <TabsTrigger value="publicadas" data-testid="tab-views-publicadas">
                Views Publicadas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="minhas">
              {viewsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : myViews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3" data-testid="text-no-my-views">
                  Nenhuma view salva ainda
                </p>
              ) : (
                <div className="space-y-2 mt-2 max-h-48 overflow-auto">
                  {myViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md border"
                      data-testid={`card-my-view-${view.id}`}
                    >
                      <div
                        className="min-w-0 cursor-pointer flex-1"
                        onClick={() => loadView(view)}
                        data-testid={`button-load-view-${view.id}`}
                      >
                        <p className="text-sm font-medium truncate">{view.name}</p>
                        {view.description && (
                          <p className="text-xs text-muted-foreground truncate">{view.description}</p>
                        )}
                        {view.tags && view.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {view.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {view.isPublished && (
                          <Badge variant="outline" className="text-[10px]">
                            <Eye className="w-3 h-3 mr-1" />
                            Publicada
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditOpen(view)}
                          data-testid={`button-edit-view-${view.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => publishViewMutation.mutate(view.id)}
                            data-testid={`button-publish-view-${view.id}`}
                          >
                            {view.isPublished ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteViewMutation.mutate(view.id)}
                          data-testid={`button-delete-view-${view.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="publicadas">
              {viewsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : publishedViews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3" data-testid="text-no-published-views">
                  Nenhuma view publicada
                </p>
              ) : (
                <div className="space-y-2 mt-2 max-h-48 overflow-auto">
                  {publishedViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md border"
                      data-testid={`card-published-view-${view.id}`}
                    >
                      <div
                        className="min-w-0 cursor-pointer flex-1"
                        onClick={() => loadView(view)}
                        data-testid={`button-load-published-view-${view.id}`}
                      >
                        <p className="text-sm font-medium truncate">{view.name}</p>
                        {view.description && (
                          <p className="text-xs text-muted-foreground truncate">{view.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          <Eye className="w-3 h-3 mr-1" />
                          Publicada
                        </Badge>
                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => publishViewMutation.mutate(view.id)}
                            data-testid={`button-unpublish-view-${view.id}`}
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar View</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Nome da view"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              data-testid="input-edit-name"
            />
            <Textarea
              placeholder="Descricao (opcional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="resize-none"
              data-testid="input-edit-description"
            />
            <Input
              placeholder="Tags (separadas por virgula)"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              data-testid="input-edit-tags"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditSave}
              disabled={!editName.trim() || updateViewMutation.isPending}
              data-testid="button-update-view"
            >
              {updateViewMutation.isPending ? "Salvando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
