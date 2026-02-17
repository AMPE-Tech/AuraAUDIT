import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  FileBarChart,
  Printer,
  Shield,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Receipt,
  FolderSearch,
  Monitor,
  Database,
  CreditCard,
  Scale,
  Lock,
  Eye,
  FileSearch,
  Lightbulb,
  Target,
  ClipboardList,
} from "lucide-react";
import { formatCurrency, formatDate, getCategoryLabel, getStatusLabel, getSeverityLabel, getAnomalyTypeLabel } from "@/lib/formatters";
import type { Expense, AuditCase, Anomaly, AuditTrail } from "@shared/schema";

export default function Reports() {
  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });
  const { data: cases, isLoading: loadingCases } = useQuery<AuditCase[]>({
    queryKey: ["/api/audit-cases"],
  });
  const { data: anomalies, isLoading: loadingAnomalies } = useQuery<Anomaly[]>({
    queryKey: ["/api/anomalies"],
  });
  const { data: trail, isLoading: loadingTrail } = useQuery<AuditTrail[]>({
    queryKey: ["/api/audit-trail"],
  });

  const isLoading = loadingExpenses || loadingCases || loadingAnomalies || loadingTrail;

  const totalExpenses = expenses?.reduce((s, e) => s + parseFloat(e.amount), 0) || 0;
  const totalSavings = cases?.reduce((s, c) => s + parseFloat(c.savingsIdentified || "0"), 0) || 0;
  const unresolvedAnomalies = anomalies?.filter((a) => !a.resolved).length || 0;
  const flaggedExpenses = expenses?.filter((e) => e.status === "flagged" || e.riskLevel === "high" || e.riskLevel === "critical") || [];

  const categoryBreakdown = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = getCategoryLabel(e.category);
          if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
          acc[cat].total += parseFloat(e.amount);
          acc[cat].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>)
      )
    : [];

  const departmentBreakdown = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          if (!acc[e.department]) acc[e.department] = { total: 0, count: 0 };
          acc[e.department].total += parseFloat(e.amount);
          acc[e.department].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>)
      ).sort((a, b) => b[1].total - a[1].total)
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reports-title">
            Relatorio de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Relatorio executivo e tecnico consolidado - Grupo Stabia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} data-testid="button-print-report">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4 print:space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold">Aura Audit - Relatorio de Auditoria Forense</h2>
                  <p className="text-xs text-muted-foreground">
                    Viagens Corporativas - Exercicios 2024 e 2025 | Grupo Stabia
                  </p>
                </div>
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Data do Relatorio</p>
                  <p className="text-sm font-medium">{formatDate(new Date())}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Periodo Analisado</p>
                  <p className="text-sm font-medium">2024 - 2025</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Volume 2024</p>
                  <p className="text-sm font-medium">R$ 51.327.894,23</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Volume 2025</p>
                  <p className="text-sm font-medium">R$ 39.639.788,66</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Despesas Analisadas</p>
                  <p className="text-sm font-medium">{expenses?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Casos de Auditoria</p>
                  <p className="text-sm font-medium">{cases?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Anomalias Detectadas</p>
                  <p className="text-sm font-medium">{anomalies?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Registros na Trilha</p>
                  <p className="text-sm font-medium">{trail?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-primary" />
                1. Sumario Executivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Este relatorio apresenta os resultados da auditoria forense realizada sobre as despesas de
                viagens corporativas do Grupo Stabia, abrangendo os exercicios de 2024 e 2025 com volume
                financeiro total de R$ 90.967.682,89. A auditoria foi conduzida de forma independente, tecnica
                e estruturada, contemplando conformidade com politicas internas, governanca dos processos,
                integridade dos dados entre sistemas OBT e Backoffice, aderencia contratual e identificacao
                de vulnerabilidades financeiras e sistemicas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium uppercase tracking-wide">Total Analisado (Amostra)</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{expenses?.length || 0} despesas na amostra</p>
                </div>
                <div className="p-4 rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium uppercase tracking-wide">Economia Identificada</p>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalSavings)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">oportunidades de savings</p>
                </div>
                <div className="p-4 rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-xs font-medium uppercase tracking-wide">Anomalias Pendentes</p>
                  </div>
                  <p className="text-xl font-bold">{unresolvedAnomalies}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    de {anomalies?.length || 0} detectadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                2. Ambientes e Sistemas Analisados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-background">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Online Booking Tool (OBT)</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">Reserve</span>
                      <Badge variant="outline" className="text-[10px]">2024</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">Argo</span>
                      <Badge variant="outline" className="text-[10px]">2025</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-md bg-background">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Backoffice</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">Wintour</span>
                      <Badge variant="outline" className="text-[10px]">2024</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">Stur</span>
                      <Badge variant="outline" className="text-[10px]">2025</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Adicionalmente foram analisados: BSPLink, portais administrativos de companhias aereas (GOL, Azul),
                redes hoteleiras, operadores, consolidadores, GDS, e extratos de cartoes de credito virtuais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                3. Metodologia de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { step: "i", title: "Diagnostico Inicial e Entendimento do Ambiente", description: "Revisao do escopo, alinhamento de objetivos e validacao de premissas" },
                  { step: "ii", title: "Coleta, Consolidacao e Cruzamento de Dados", description: "Extracoes dos sistemas OBT, Backoffice, relatorios financeiros e operacionais" },
                  { step: "iii", title: "Analise Tecnica, Financeira e Operacional", description: "Cruzamento e reconciliacao, identificacao de inconsistencias e vulnerabilidades" },
                  { step: "iv", title: "Identificacao de Falhas, Riscos e Vulnerabilidades", description: "Mapeamento de falhas operacionais, riscos financeiros e exposicoes indevidas" },
                  { step: "v", title: "Validacao de Achados", description: "Validacao preliminar dos resultados com as areas envolvidas" },
                  { step: "vi", title: "Elaboracao de Relatorio Executivo e Tecnico", description: "Consolidacao dos achados com evidencias e analises detalhadas" },
                  { step: "vii", title: "Apresentacao dos Resultados e Recomendacoes", description: "Apresentacao formal e encaminhamento de proximos passos" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-3 rounded-md bg-background">
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0 mt-0.5">{item.step}</Badge>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                4. Analise por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {categoryBreakdown.map(([cat, data]) => (
                    <div key={cat} className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
                      <div>
                        <p className="text-sm font-medium">{cat}</p>
                        <p className="text-xs text-muted-foreground">{data.count} despesas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(data.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((data.total / totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum dado disponivel</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                5. Analise por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departmentBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {departmentBreakdown.map(([dept, data]) => (
                    <div key={dept} className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
                      <div>
                        <p className="text-sm font-medium">{dept}</p>
                        <p className="text-xs text-muted-foreground">{data.count} despesas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(data.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((data.total / totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum dado disponivel</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                6. Achados e Despesas Sinalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedExpenses.length > 0 ? (
                <div className="space-y-3">
                  {flaggedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.employee} | {expense.vendor} | {formatDate(expense.date)}
                        </p>
                        {expense.notes && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{expense.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                        <Badge variant="destructive" className="text-[10px]">
                          {expense.riskLevel === "critical" ? "Critico" : "Alto Risco"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Nenhuma despesa sinalizada neste periodo
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderSearch className="w-5 h-5 text-primary" />
                7. Casos de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cases && cases.length > 0 ? (
                <div className="space-y-3">
                  {cases.map((c) => (
                    <div key={c.id} className="p-3 rounded-md bg-background">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <p className="text-sm font-medium">{c.title}</p>
                        <Badge variant={c.status === "open" ? "default" : "secondary"} className="text-[10px]">
                          {getStatusLabel(c.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                      {c.findings && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Achados:</span> {c.findings}
                        </p>
                      )}
                      {c.recommendations && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Recomendacoes:</span> {c.recommendations}
                        </p>
                      )}
                      {parseFloat(c.savingsIdentified || "0") > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Economia: {formatCurrency(c.savingsIdentified || "0")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum caso registrado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                8. Mapeamento de Riscos e Vulnerabilidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { risk: "Emissao duplicada de bilhetes aereos", level: "Critico", impact: "Perda financeira direta com pagamento em duplicidade", recommendation: "Implementar controle preventivo de emissoes duplicadas no OBT" },
                { risk: "Hospedagem acima da politica corporativa", level: "Alto", impact: "Exposicao financeira por descumprimento de limites", recommendation: "Revisar limites da politica de hospedagem e automatizar bloqueio" },
                { risk: "Despesas sem comprovante fiscal", level: "Alto", impact: "Risco fiscal e impossibilidade de deducao tributaria", recommendation: "Exigir upload obrigatorio de NF antes da aprovacao" },
                { risk: "Divergencia entre OBT e Backoffice", level: "Medio", impact: "Inconsistencia de dados e falhas no controle financeiro", recommendation: "Automatizar integracao entre sistemas para reconciliacao em tempo real" },
                { risk: "Passagens internacionais sem aprovacao previa", level: "Medio", impact: "Descumprimento de politica interna e governanca", recommendation: "Implementar workflow de aprovacao previa para viagens internacionais" },
                { risk: "Divergencias em cartoes de credito virtuais", level: "Medio", impact: "Risco de fraude e conciliacao incorreta", recommendation: "Automatizar reconciliacao de cartoes virtuais com reservas" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-md bg-background">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <p className="text-sm font-medium">{item.risk}</p>
                    <Badge
                      variant={item.level === "Critico" ? "destructive" : item.level === "Alto" ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Impacto:</span> {item.impact}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium">Recomendacao:</span> {item.recommendation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                9. Recomendacoes e Plano de Acao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { priority: "Alta", action: "Implementar controle preventivo contra emissoes duplicadas de bilhetes aereos", timeline: "Imediato", responsible: "TI + Compliance" },
                  { priority: "Alta", action: "Revisar e atualizar politica de hospedagem com limites por cidade e cargo", timeline: "30 dias", responsible: "RH + Financeiro" },
                  { priority: "Alta", action: "Automatizar reconciliacao de cartoes de credito virtuais com reservas e faturas", timeline: "60 dias", responsible: "TI + Financeiro" },
                  { priority: "Media", action: "Estabelecer teto para despesas com alimentacao por tipo de refeicao", timeline: "30 dias", responsible: "RH" },
                  { priority: "Media", action: "Implementar integracao automatica entre OBT e Backoffice", timeline: "90 dias", responsible: "TI" },
                  { priority: "Media", action: "Criar workflow de aprovacao previa para viagens internacionais", timeline: "45 dias", responsible: "Compliance" },
                  { priority: "Baixa", action: "Revisar acordos corporativos com companhias aereas e redes hoteleiras", timeline: "90 dias", responsible: "Compras + Comercial" },
                  { priority: "Baixa", action: "Capacitar gestores sobre politicas de viagens e uso dos sistemas", timeline: "60 dias", responsible: "RH + Treinamento" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-background">
                    <Badge
                      variant={item.priority === "Alta" ? "destructive" : item.priority === "Media" ? "secondary" : "outline"}
                      className="text-[10px] shrink-0 mt-0.5"
                    >
                      {item.priority}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">Prazo: {item.timeline}</span>
                        <span className="text-xs text-muted-foreground">Responsavel: {item.responsible}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold">Governanca, Confidencialidade e Independencia</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {[
                  { icon: Lock, title: "Confidencialidade", desc: "Todas as informacoes tratadas com sigilo absoluto conforme acordo de confidencialidade" },
                  { icon: Scale, title: "Independencia Tecnica", desc: "Auditoria conduzida de forma independente, sem vinculo com areas auditadas" },
                  { icon: FileSearch, title: "Rastreabilidade Juridica", desc: "Dados analisados com rastreabilidade completa para fins juridicos" },
                  { icon: Eye, title: "Transparencia Metodologica", desc: "Metodologia documentada e transparente em todas as etapas" },
                  { icon: Shield, title: "Cadeia de Custodia", desc: "Preservacao digital conforme Lei 13.964/2019 (Pacote Anticrime)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-md bg-background">
                    <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="mb-3" />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Este relatorio foi gerado em conformidade com a Lei 13.964/2019 (Pacote Anticrime),
                  observando os principios da Cadeia de Custodia Digital. Todas as operacoes foram
                  registradas na trilha de auditoria com hash de integridade SHA-256.
                </p>
                <p>
                  A metodologia aplicada segue padroes utilizados em projetos de auditoria corporativa
                  de grande porte, garantindo preservacao probatoria e rastreabilidade completa,
                  em formato compativel com utilizacao em procedimentos administrativos e judiciais.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
