import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Lock, Upload, FileText, Trash2, ArrowRight, ArrowLeft,
  CheckCircle2, Loader2, AlertTriangle, Zap, Globe, Hash, Ban,
  BarChart3
} from "lucide-react";

interface FileDetail {
  originalName: string;
  size: number;
  format: string;
  sha256: string;
}

interface AuditEnvelope {
  envelopeId: string;
  type: string;
  inputs: {
    files: FileDetail[];
    description: string;
    descriptionHash: string;
  };
  processing: {
    model: string;
    startedAt: string;
    completedAt: string;
  };
  output: {
    reportHash: string;
  };
  envelopeSha256: string;
}

interface TrialStatus {
  used: number;
  remaining: number;
  limit: number;
}

interface AnalysisResult {
  report: string;
  envelope: AuditEnvelope;
  files: FileDetail[];
  trialStatus?: TrialStatus;
}

export default function TrialPage() {
  const [, navigate] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: trialStatus, refetch: refetchStatus } = useQuery<TrialStatus>({
    queryKey: ["/api/trial/status"],
  });

  const remaining = trialStatus?.remaining ?? 3;
  const used = trialStatus?.used ?? 0;
  const limit = trialStatus?.limit ?? 3;
  const isBlocked = remaining <= 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const total = files.length + selected.length;
    if (total > 3) {
      setError("Maximo de 3 arquivos permitidos no teste gratuito.");
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Envie pelo menos 1 arquivo.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Descreva o que deseja analisar (minimo 10 caracteres).");
      return;
    }
    setIsAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("description", description);
      const response = await fetch("/api/trial/analyze", { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 429) refetchStatus();
        throw new Error(errData.error || "Erro ao processar.");
      }
      const data = await response.json();
      setResult(data);
      refetchStatus();
    } catch (err: any) {
      setError(err.message || "Erro ao processar analise.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/landingpage-test")}>
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AuraTECH</h1>
              <p className="text-[10px] text-muted-foreground">Trust Infrastructure Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/landingpage-test")} data-testid="button-back-landing">
              <ArrowLeft className="w-3 h-3 mr-1" />
              Voltar
            </Button>
            <Button size="sm" className="text-xs" onClick={() => navigate("/login")} data-testid="button-header-login">
              Acessar Plataforma
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
        <div className="space-y-6" data-testid="section-trial">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Teste Gratuito</h2>
            </div>
            <p className="text-xs text-muted-foreground">Diagnostico com Cadeia de Custodia</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Envie ate 3 arquivos e descreva o que deseja analisar. Nossa IA gera um relatorio de diagnostico com cadeia de custodia digital — SHA-256, timestamps e rastreabilidade completa.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Lock className="w-3 h-3" /> Dados nao armazenados</span>
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400"><Shield className="w-3 h-3" /> Cadeia de custodia inclusa</span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><Zap className="w-3 h-3" /> Resultado em segundos</span>
          </div>

          {isBlocked && !result ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Ban className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold" data-testid="text-trial-blocked">Seus testes gratuitos acabaram</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Voce utilizou todos os {limit} diagnosticos gratuitos disponiveis. Ative a plataforma completa para continuar.
                </p>
              </div>
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-center">Continue com a Plataforma AuraTECH</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Integracao API em Tempo Real</p>
                        <p className="text-[10px] text-muted-foreground">OBT, Backoffice, GDS, BSP, cartoes corporativos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Dashboard Interativo</p>
                        <p className="text-[10px] text-muted-foreground">KPIs, alertas e controles em tempo real</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Conciliacao Multi-vias</p>
                        <p className="text-[10px] text-muted-foreground">PNR/TKT/EMD + fatura + cartao + expense</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Cadeia de Custodia Certificada</p>
                        <p className="text-[10px] text-muted-foreground">SHA-256, Lei 13.964/2019</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button onClick={() => navigate("/subscription")} data-testid="button-blocked-subscribe">
                      Plataforma Completa — US$ 99/mes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/login")} data-testid="button-blocked-login">
                      Ja tenho conta — Entrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !result ? (
            <div className="space-y-4">
              {trialStatus && (
                <Card className={remaining === 1 ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" data-testid="text-trial-counter">
                        {remaining === 1
                          ? "Ultimo teste gratuito disponivel"
                          : `${remaining} de ${limit} testes restantes`}
                      </span>
                      <Badge variant={remaining === 1 ? "destructive" : "secondary"} className="text-[10px]">
                        {used}/{limit} usados
                      </Badge>
                    </div>
                    <Progress value={(used / limit) * 100} className="h-1.5" />
                    {remaining === 1 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
                        Aproveite! Apos este teste, continue com a plataforma AuraTECH completa.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    1. Envie seus arquivos
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ate 3 arquivos (CSV, XLSX, PDF, TXT, JSON, XML) — max 10 MB cada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="dropzone-files"
                  >
                    <Upload className="w-8 h-8 mx-auto text-primary/60 mb-2" />
                    <p className="text-sm text-foreground font-medium">Clique para selecionar arquivos</p>
                    <p className="text-xs text-muted-foreground mt-1">ou arraste e solte aqui</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.xlsx,.xls,.pdf,.txt,.json,.xml"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-files"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium" data-testid={`text-filename-${i}`}>{f.name}</span>
                            <span className="text-xs text-muted-foreground">({formatFileSize(f.size)})</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(i)} data-testid={`button-remove-file-${i}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">{files.length}/3 arquivos selecionados</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    2. Descreva sua intencao
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Explique o que voce quer analisar, conciliar ou verificar com esses arquivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ex: Quero conciliar os bilhetes aereos emitidos pela agencia com as faturas do cartao corporativo para identificar divergencias de valores e possiveis cobrancas duplicadas no periodo de outubro a dezembro de 2025..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-sm"
                    data-testid="input-description"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{description.length} caracteres</p>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || files.length === 0 || description.trim().length < 10}
                data-testid="button-analyze"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando com IA... aguarde
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar Diagnostico Gratuito
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {result.trialStatus && (
                <Card className={result.trialStatus.remaining === 0 ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" data-testid="text-trial-result-counter">
                        {result.trialStatus.remaining === 0
                          ? "Voce utilizou todos os seus testes gratuitos"
                          : result.trialStatus.remaining === 1
                            ? "Voce ainda tem 1 teste gratuito restante"
                            : `Voce ainda tem ${result.trialStatus.remaining} testes gratuitos restantes`}
                      </span>
                      <Badge variant={result.trialStatus.remaining === 0 ? "destructive" : "secondary"} className="text-[10px]">
                        {result.trialStatus.used}/{result.trialStatus.limit}
                      </Badge>
                    </div>
                    <Progress value={(result.trialStatus.used / result.trialStatus.limit) * 100} className="h-1.5" />
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Relatorio de Diagnostico
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">Teste Gratuito</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-sm"
                    data-testid="text-report"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(result.report) }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Cadeia de Custodia Digital
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Rastreabilidade completa conforme Lei 13.964/2019 (Pacote Anticrime)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Envelope ID</p>
                      <p className="text-xs font-mono" data-testid="text-envelope-id">{result.envelope.envelopeId}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Modelo IA</p>
                      <p className="text-xs font-mono">{result.envelope.processing.model}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Inicio</p>
                      <p className="text-xs font-mono">{result.envelope.processing.startedAt}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Conclusao</p>
                      <p className="text-xs font-mono">{result.envelope.processing.completedAt}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium">Arquivos analisados (SHA-256)</p>
                    {result.files.map((f, i) => (
                      <div key={i} className="bg-muted/50 rounded-md p-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium">{f.originalName}</span>
                          <Badge variant="outline" className="text-[10px]">{f.format.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-muted-foreground" />
                          <code className="text-[10px] text-muted-foreground font-mono break-all" data-testid={`text-file-hash-${i}`}>
                            {f.sha256}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded-md p-2 space-y-1">
                      <p className="text-xs font-medium">Hash do Relatorio (SHA-256)</p>
                      <code className="text-[10px] text-muted-foreground font-mono break-all" data-testid="text-report-hash">
                        {result.envelope.output.reportHash}
                      </code>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-2 space-y-1">
                      <p className="text-xs font-medium text-primary">Envelope SHA-256</p>
                      <code className="text-[10px] font-mono break-all" data-testid="text-envelope-hash">
                        {result.envelope.envelopeSha256}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-center">
                    {result.trialStatus?.remaining === 0
                      ? "Seus testes gratuitos acabaram — continue com o plano completo"
                      : "Quer ir alem do diagnostico?"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Integracao API em Tempo Real</p>
                        <p className="text-[10px] text-muted-foreground">Conecte OBT, Backoffice, GDS, BSP e cartoes corporativos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Dashboard Interativo</p>
                        <p className="text-[10px] text-muted-foreground">KPIs, alertas, cronograma e controles em tempo real</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Conciliacao Multi-vias</p>
                        <p className="text-[10px] text-muted-foreground">PNR/TKT/EMD + fatura + cartao/VCN + expense — automatizado com IA</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Cadeia de Custodia Certificada</p>
                        <p className="text-[10px] text-muted-foreground">SHA-256, trilha imutavel, Lei 13.964/2019</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button onClick={() => navigate("/subscription")} data-testid="button-trial-subscribe">
                      AuraTECH Pass — US$ 99/mes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/login")} data-testid="button-trial-login">
                      Acessar Plataforma
                    </Button>
                    {result.trialStatus && result.trialStatus.remaining > 0 && (
                      <Button variant="ghost" onClick={() => { setResult(null); setFiles([]); setDescription(""); }} data-testid="button-trial-new">
                        Novo Teste ({result.trialStatus.remaining} restante{result.trialStatus.remaining > 1 ? "s" : ""})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground pb-4" data-testid="section-footer">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>Cadeia de Custodia Digital - Lei 13.964/2019</span>
          </div>
          <span>AuraTECH — Trust Infrastructure Platform</span>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-sm">$1. $2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
