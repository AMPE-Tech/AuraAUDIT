import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Upload,
  FileText,
  Trash2,
  Loader2,
  Shield,
  Hash,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  FolderOpen,
  Search,
  PenLine,
  Save,
  Lock,
  Info,
} from "lucide-react";

interface KnowledgeDoc {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string | null;
  sha256: string;
  extractedText: string | null;
  isActive: boolean;
  uploadedBy: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  label: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IaKnowledge() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<{ documents: KnowledgeDoc[]; categories: Category[] }>({
    queryKey: ["/api/admin/ia-knowledge"],
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/admin/ia-knowledge/${id}/toggle`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ia-knowledge"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ia-knowledge/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ia-knowledge"] });
      toast({ title: "Documento excluido" });
    },
  });

  const updateTextMutation = useMutation({
    mutationFn: async ({ id, extractedText }: { id: string; extractedText: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/ia-knowledge/${id}/text`, { extractedText });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ia-knowledge"] });
      toast({ title: "Texto atualizado" });
      setShowTextDialog(null);
    },
  });

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !uploadTitle) {
      toast({ title: "Erro", description: "Selecione um arquivo e informe o titulo", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("category", uploadCategory);

      const res = await fetch("/api/admin/ia-knowledge", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro no upload");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/ia-knowledge"] });
      toast({ title: "Documento enviado com sucesso", description: "A IA tera acesso a este conhecimento" });
      setShowUpload(false);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("general");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const documents = data?.documents || [];
  const categories = data?.categories || [];
  const activeCount = documents.filter((d) => d.isActive).length;
  const withTextCount = documents.filter((d) => d.extractedText).length;

  const filteredDocs = documents.filter((d) => {
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase()) && !d.originalName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const textDoc = documents.find((d) => d.id === showTextDialog);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-ia-knowledge-title">
            <Brain className="w-6 h-6 text-primary" />
            Documentos IA — Base de Conhecimento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compartilhe materiais de auditoria para treinar a IA como especialista senior
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowUpload(true)} data-testid="button-upload-knowledge">
          <Upload className="w-4 h-4" />
          Enviar Documento
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Politica de Confidencialidade e Aprendizado</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                  A IA aprende e aplica o conhecimento apenas para clientes da AuraAUDIT
                </li>
                <li className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                  Sigilo total: nomes de clientes e dados confidenciais nunca sao revelados
                </li>
                <li className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-purple-500 shrink-0" />
                  A IA combina seu material + fontes publicas confiaveis para se tornar especialista senior
                </li>
                <li className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  Na duvida, a IA diz que vai consultar um especialista humano — nunca inventa
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Total Documentos</p>
            <p className="text-2xl font-bold" data-testid="text-total-docs">{documents.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Ativos (IA lendo)</p>
            <p className="text-2xl font-bold text-emerald-600" data-testid="text-active-docs">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Com Texto Extraido</p>
            <p className="text-2xl font-bold text-blue-600" data-testid="text-with-text-docs">{withTextCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Categorias</p>
            <p className="text-2xl font-bold">{new Set(documents.map((d) => d.category)).size}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            data-testid="input-search-knowledge"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[260px] h-9" data-testid="select-category-filter">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {documents.length === 0
                  ? "Nenhum documento na base de conhecimento"
                  : "Nenhum documento encontrado com os filtros selecionados"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Envie documentos como relatorios de auditoria, metodologias, cases e benchmarks
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              className={`transition-all hover:shadow-md ${doc.isActive ? "border-emerald-200 dark:border-emerald-900/50" : "border-muted opacity-60"}`}
              data-testid={`card-knowledge-doc-${doc.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${doc.isActive ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"}`}>
                      <FileText className={`w-5 h-5 ${doc.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" data-testid={`text-doc-title-${doc.id}`}>{doc.title}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {categories.find((c) => c.id === doc.category)?.label || doc.category}
                        </Badge>
                        {doc.isActive ? (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                            <Eye className="w-2.5 h-2.5 mr-1" /> Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            <EyeOff className="w-2.5 h-2.5 mr-1" /> Inativo
                          </Badge>
                        )}
                        {doc.extractedText ? (
                          <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0">
                            <Brain className="w-2.5 h-2.5 mr-1" /> Texto indexado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Sem texto
                          </Badge>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" /> {doc.originalName}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>{formatDate(doc.createdAt)}</span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Hash className="w-3 h-3" /> {doc.sha256.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] text-muted-foreground">IA</Label>
                      <Switch
                        checked={doc.isActive}
                        onCheckedChange={() => toggleMutation.mutate(doc.id)}
                        data-testid={`switch-toggle-${doc.id}`}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => {
                        setShowTextDialog(doc.id);
                        setEditText(doc.extractedText || "");
                      }}
                      data-testid={`button-edit-text-${doc.id}`}
                    >
                      <PenLine className="w-3 h-3" />
                      Texto
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => {
                        if (confirm("Excluir este documento da base de conhecimento?")) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Enviar Documento para Base de Conhecimento
            </DialogTitle>
            <DialogDescription>
              A IA vai estudar este material para se tornar especialista no assunto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Titulo do Documento *</Label>
              <Input
                id="upload-title"
                placeholder="Ex: Metodologia de Auditoria de Viagens Corporativas"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                data-testid="input-upload-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Descricao (opcional)</Label>
              <Textarea
                id="upload-description"
                placeholder="Descreva brevemente o conteudo e sua relevancia..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={2}
                data-testid="input-upload-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger data-testid="select-upload-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Arquivo</Label>
              <Input
                type="file"
                ref={fileInputRef}
                accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt,.md,.json,.xml,.pptx,.ppt"
                data-testid="input-upload-file"
              />
              <p className="text-[10px] text-muted-foreground">
                Formatos: PDF, DOC, XLSX, CSV, TXT, MD, JSON, XML, PPTX (max 50MB)
              </p>
            </div>

            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <p className="font-medium">Dica: Texto extraido automaticamente</p>
                  <p>Para arquivos .txt, .md, .csv, .json e .xml, o texto e extraido automaticamente. Para PDFs e DOCs, voce pode colar o texto manualmente clicando em "Texto" apos o upload.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpload(false)} data-testid="button-cancel-upload">
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={uploading} className="gap-2" data-testid="button-confirm-upload">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showTextDialog} onOpenChange={(open) => { if (!open) setShowTextDialog(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Texto Extraido — {textDoc?.title}
            </DialogTitle>
            <DialogDescription>
              Edite ou cole o texto que a IA deve estudar deste documento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-medium">Importante: Anonimize dados sensiveis</p>
                  <p>Substitua nomes de clientes, CNPJs e valores de contratos por referencias genericas antes de salvar. Ex: "Cliente A", "R$ XX milhoes".</p>
                </div>
              </div>
            </div>

            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={16}
              className="font-mono text-xs"
              placeholder="Cole aqui o texto extraido do documento..."
              data-testid="textarea-extracted-text"
            />

            <p className="text-[10px] text-muted-foreground">
              {editText.length.toLocaleString()} caracteres | Maximo: 100.000
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTextDialog(null)} data-testid="button-cancel-text">
                Cancelar
              </Button>
              <Button
                onClick={() => showTextDialog && updateTextMutation.mutate({ id: showTextDialog, extractedText: editText })}
                disabled={updateTextMutation.isPending}
                className="gap-2"
                data-testid="button-save-text"
              >
                {updateTextMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Texto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
