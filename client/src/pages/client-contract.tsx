import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Shield,
  CalendarDays,
  CheckCircle,
  Clock,
  Target,
  Scale,
  PenTool,
  Lock,
  AlertTriangle,
  ListChecks,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const CONTRACT_DATA = {
  number: "AUR-2025-0042",
  status: "Ativo",
  client: "Grupo Stabia",
  startDate: "2025-01-15",
  endDate: "2025-12-31",
  signedDate: "2025-01-10",
  type: "Auditoria Forense em Viagens e Eventos",
  scope: [
    "Auditoria forense completa em despesas de viagens corporativas e eventos",
    "Analise de conformidade com politicas internas de viagens",
    "Reconciliacao entre sistemas OBT (Reserve, Argo) e Backoffice (Wintour, Stur)",
    "Identificacao de anomalias, duplicidades e fraudes potenciais",
    "Cruzamento de dados com fontes externas (companhias aereas, agencias, EBTA)",
    "Avaliacao de eficiencia operacional e oportunidades de economia",
    "Verificacao de aderencia a Lei 13.964/2019 e normas anticorrupcao",
  ],
  deliverables: [
    { name: "Relatorio Executivo de Auditoria", deadline: "A cada fase concluida", status: "pendente" },
    { name: "Relatorio Tecnico Detalhado", deadline: "Ao final do projeto", status: "pendente" },
    { name: "Matriz de Riscos e Anomalias", deadline: "Fase 03 — Reconciliacao", status: "pendente" },
    { name: "Parecer de Conformidade Legal", deadline: "Fase 04 — Apresentacao", status: "pendente" },
    { name: "Plano de Recomendacoes e Acoes Corretivas", deadline: "Fase 05 — Ajustes", status: "pendente" },
    { name: "Dashboard Interativo de Resultados", deadline: "Disponivel em tempo real", status: "pendente" },
    { name: "Cadeia de Custodia Digital Completa", deadline: "Continuo durante o projeto", status: "pendente" },
  ],
  sla: [
    { metric: "Tempo de Resposta a Incidentes Criticos", value: "Ate 4 horas uteis" },
    { metric: "Atualizacao de Status do Projeto", value: "Diariamente via dashboard" },
    { metric: "Entrega de Relatorios Parciais", value: "Ate 48 horas apos cada fase" },
    { metric: "Entrega do Relatorio Final", value: "Ate 5 dias uteis apos conclusao" },
    { metric: "Reunioes de Alinhamento", value: "Semanalmente ou sob demanda" },
    { metric: "Disponibilidade da Equipe", value: "Dias uteis, 08h as 18h" },
  ],
  terms: [
    { title: "Confidencialidade", description: "Todas as informacoes compartilhadas durante a auditoria sao tratadas como confidenciais e protegidas por NDA assinado entre as partes." },
    { title: "Cadeia de Custodia", description: "Todos os dados e evidencias sao mantidos em cadeia de custodia digital certificada, garantindo integridade e rastreabilidade conforme a Lei 13.964/2019." },
    { title: "Propriedade Intelectual", description: "Os relatorios e analises produzidos sao de propriedade do contratante. A metodologia e ferramentas de auditoria permanecem propriedade da AuraAUDIT." },
    { title: "Protecao de Dados", description: "O tratamento de dados pessoais segue rigorosamente a LGPD (Lei 13.709/2018), com medidas tecnicas e administrativas de seguranca." },
    { title: "Independencia", description: "A equipe de auditoria mantem total independencia e imparcialidade durante todo o processo, sem vinculo com as areas auditadas." },
    { title: "Rescisao", description: "O contrato pode ser rescindido por qualquer das partes com aviso previo de 30 dias, resguardados os direitos sobre trabalhos ja realizados." },
  ],
};

function getDeliverableStatusBadge(status: string) {
  switch (status) {
    case "concluido":
      return <Badge variant="default" className="text-[10px]">Concluido</Badge>;
    case "em_andamento":
      return <Badge variant="secondary" className="text-[10px]">Em Andamento</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
  }
}

export default function ClientContract() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-contract-title">
            Contrato
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detalhes do contrato de auditoria entre AuraAUDIT e {user?.fullName || CONTRACT_DATA.client}
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Lei 13.964/2019
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-contract-number">Contrato {CONTRACT_DATA.number}</h2>
            <Badge variant="default" className="text-[10px]" data-testid="badge-contract-status">{CONTRACT_DATA.status}</Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Cliente</p>
              <p className="text-sm font-medium" data-testid="text-contract-client">{CONTRACT_DATA.client}</p>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Tipo de Servico</p>
              <p className="text-sm font-medium" data-testid="text-contract-type">{CONTRACT_DATA.type}</p>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Inicio</p>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium" data-testid="text-contract-start">15/01/2025</p>
              </div>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Termino</p>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium" data-testid="text-contract-end">31/12/2025</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Escopo do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTRACT_DATA.scope.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/50" data-testid={`text-scope-item-${index}`}>
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              Entregaveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTRACT_DATA.deliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50" data-testid={`card-deliverable-${index}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.deadline}</p>
                  </div>
                  {getDeliverableStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            SLA - Acordo de Nivel de Servico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {CONTRACT_DATA.sla.map((item, index) => (
              <div key={index} className="p-3 rounded-md bg-muted/50" data-testid={`card-sla-${index}`}>
                <p className="text-xs text-muted-foreground mb-1">{item.metric}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Termos e Condicoes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTRACT_DATA.terms.map((term, index) => (
              <div key={index} className="p-3 rounded-md bg-muted/50" data-testid={`card-term-${index}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-sm font-semibold">{term.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{term.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PenTool className="w-4 h-4 text-primary" />
            Assinatura Digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-md bg-muted/50 space-y-4" data-testid="section-digital-signature">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-background/60">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Contratante</p>
                <p className="text-sm font-medium" data-testid="text-signee-client">{CONTRACT_DATA.client}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-600 dark:text-green-400">Assinado em 10/01/2025</p>
                </div>
              </div>
              <div className="p-3 rounded-md bg-background/60">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Contratada</p>
                <p className="text-sm font-medium" data-testid="text-signee-aura">AuraAUDIT - AuraDue Tecnologia</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-600 dark:text-green-400">Assinado em 10/01/2025</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-semibold">Nota:</span> As assinaturas digitais sao certificadas e possuem validade juridica conforme a Medida Provisoria 2.200-2/2001 e a Lei 14.063/2020. A integridade dos documentos e garantida por hash criptografico SHA-256.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - AuraDue</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}