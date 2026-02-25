import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Activity,
  Link2,
  FileText,
  ClipboardList,
  BarChart3,
  Gavel,
  ShieldAlert,
  GraduationCap,
  HeartPulse,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Star,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  icon: typeof Search;
  priority: "P0" | "P1" | "P2" | "P3";
  priorityLabel: string;
  priorityColor: string;
  whyLabel: string;
  description: string;
  items: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: "revisao-tecnica",
    title: "Revisao Tecnica / Auditoria Financeira",
    icon: Search,
    priority: "P0",
    priorityLabel: "Core AuraAudit",
    priorityColor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    whyLabel: "Entrega economia mensuravel e reduz vazamento imediatamente.",
    description: "Auditoria financeira 100% online com conciliacao multi-vias e deteccao de divergencias.",
    items: [
      "Conciliacao 4 vias (PNR/TKT/EMD + fatura + cartao/VCN + expense)",
      "Auditoria de taxas/fees/markups (cobrado vs contratado)",
      "Auditoria de reembolsos/creditos, no-show, cancelamentos",
      "Hotel Folio Audit (reserva vs folio vs politica vs acordo)",
      "Auditoria de eventos (budget vs realizado + pagamentos + documentos)",
    ],
  },
  {
    id: "monitoramento",
    title: "Monitoramento Continuo (Assinatura)",
    icon: Activity,
    priority: "P0",
    priorityLabel: "Core AuraAudit",
    priorityColor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    whyLabel: "Receita recorrente com dependencia operacional (stickiness).",
    description: "Compliance + Savings + Alertas em regime de assinatura recorrente.",
    items: [
      "Auditoria recorrente (mensal/quinzenal/semanal/real time)",
      "Score de compliance + ranking de excecoes",
      "Alertas de divergencia e cobranca indevida",
      "Relatorios executivos + evidence packs",
    ],
  },
  {
    id: "cadeia-custodia",
    title: "Cadeia de Custodia & Rastreabilidade Juridica",
    icon: Link2,
    priority: "P0",
    priorityLabel: "Core AuraAudit",
    priorityColor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    whyLabel: "Diferencial que destrava contratos enterprise e setores regulados.",
    description: "Evidence packs e trilha de auditoria embarcados em todos os servicos (Lei 13.964/2019).",
    items: [
      "Evidence packs por caso/evento (raw + logs + versoes de regras)",
      "Trilha de auditoria de alteracoes (client-controlled)",
      "Dossie auditavel para Compliance, Juridico e auditoria externa",
    ],
  },
  {
    id: "contratos",
    title: "Consultoria de Contratos Tecnicos",
    icon: FileText,
    priority: "P1",
    priorityLabel: "Alta Relevancia",
    priorityColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    whyLabel: "Melhora governanca e evita recorrencia de perdas apos diagnostico.",
    description: "Confeccao e revisao de contratos tecnicos de agenciamento (TMC + Fornecedores).",
    items: [
      "Confeccao/revisao de contrato tecnico de agenciamento",
      "Matriz contratado vs executado + SLAs + faturamento analitico",
      "Clausulas de evidencia, LGPD, governanca e dispute process",
    ],
  },
  {
    id: "politica",
    title: "Politica de Viagens & Workflow de Excecoes",
    icon: ClipboardList,
    priority: "P1",
    priorityLabel: "Alta Relevancia",
    priorityColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    whyLabel: "Maximiza ganhos e reduz ruido operacional com buy-in interno.",
    description: "Ajuste e criacao de politicas de viagens com regras de excecao e alcadas.",
    items: [
      "Ajuste/criacao da policy (classes, tetos, preferenciais, antecedencia)",
      "Regras de excecao (alcadas, justificativas, evidencia obrigatoria)",
      "Medicao continua e revisao trimestral",
    ],
  },
  {
    id: "sla-kpis",
    title: "SLA & KPIs Operacionais",
    icon: BarChart3,
    priority: "P1",
    priorityLabel: "Alta Relevancia",
    priorityColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    whyLabel: "Melhora operacao e experiencia do viajante com dados de tickets e processos.",
    description: "Definicao e mensuracao de SLAs e KPIs para TMC/OBT/atendimento.",
    items: [
      "Definicao e mensuracao de SLAs (emissao, pos-venda, 24/7)",
      "KPIs (FCR, TMA, backlog, reacomodacao, creditos)",
      "Scorecards mensais com plano de acao",
    ],
  },
  {
    id: "concorrencias",
    title: "Execucao de Concorrencias (RFP/RFQ)",
    icon: Gavel,
    priority: "P2",
    priorityLabel: "Relevancia Media",
    priorityColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    whyLabel: "Muito valioso em troca/renegociacao; nao e continuo.",
    description: "Conducao 100% online de processos de concorrencia para fornecedores de viagens.",
    items: [
      "RFP de TMC/OBT/hotel/locadora/eventos",
      "Matriz comparativa + recomendacao",
      "Apoio a negociacao (rodadas remotas)",
    ],
  },
  {
    id: "antifraude",
    title: "Antifraude & Anomalias (Avancado)",
    icon: ShieldAlert,
    priority: "P2",
    priorityLabel: "Relevancia Media",
    priorityColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    whyLabel: "Excelente para grandes contas/regulados; depende de maturidade e dados.",
    description: "Deteccao avancada de padroes de fraude com segregacao de funcoes e investigacao.",
    items: [
      "Regras avancadas e deteccao de padroes",
      "Segregacao de funcoes e alertas por risco",
      "Investigacoes internas com evidence packs",
    ],
  },
  {
    id: "treinamentos",
    title: "Treinamentos (EAD)",
    icon: GraduationCap,
    priority: "P2",
    priorityLabel: "Relevancia Media",
    priorityColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    whyLabel: "Reduz excecoes e retrabalho; complemento, nao motor de savings imediato.",
    description: "Programas de enablement para viajantes, aprovadores, financeiro e eventos.",
    items: [
      "Treinamento de policy, uso do OBT, compliance de eventos, boas praticas",
      "Trilhas por papel (viajante, aprovador, financeiro, eventos)",
    ],
  },
  {
    id: "healthcare",
    title: "Suporte Administrativo Health Care",
    icon: HeartPulse,
    priority: "P3",
    priorityLabel: "Vertical Premium",
    priorityColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    whyLabel: "Altissimo valor em farmaceutica/healthcare; vertical especializada.",
    description: "Fluxo end-to-end para eventos e viagens no setor farmaceutico e healthcare.",
    items: [
      "Agendamento > cadastro > juridico/compliance > pre-evento > pos-evento > pagamento > fechamento > auditoria",
      "Gestao documental e contratos com conformidade (FMV/legislacao)",
      "Dossie para auditoria externa",
    ],
  },
];

const PRIORITY_GROUPS = [
  { key: "P0", label: "Nivel P0 — Core AuraAudit", description: "Maior ROI e demanda, servicos essenciais", color: "text-red-600 dark:text-red-400" },
  { key: "P1", label: "Nivel P1 — Alta Relevancia", description: "Acelera maturidade e reduz risco", color: "text-amber-600 dark:text-amber-400" },
  { key: "P2", label: "Nivel P2 — Relevancia Media", description: "Boa receita, depende de contexto/segmento", color: "text-blue-600 dark:text-blue-400" },
  { key: "P3", label: "Nivel P3 — Vertical Premium", description: "Nicho especializado de alto valor", color: "text-purple-600 dark:text-purple-400" },
];

function ServiceCard({ service }: { service: ServiceItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={() => setExpanded(!expanded)}
      data-testid={`card-service-${service.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <service.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm">{service.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={`text-[10px] ${service.priorityColor}`}>
              {service.priority}
            </Badge>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <Separator className="mb-3" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              {service.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[11px] text-muted-foreground italic">{service.whyLabel}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Services() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" data-testid="services-page">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-services-title">Servicos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Catalogo de servicos AuraAudit organizados por nivel de relevancia, valor economico e aderencia a compliance.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRIORITY_GROUPS.map((pg) => {
          const count = SERVICES.filter((s) => s.priority === pg.key).length;
          return (
            <Card key={pg.key} className="p-3" data-testid={`card-priority-${pg.key.toLowerCase()}`}>
              <div className={`text-lg font-bold ${pg.color}`}>{pg.key}</div>
              <p className="text-xs font-medium mt-0.5">{pg.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{count} servico{count > 1 ? "s" : ""}</p>
            </Card>
          );
        })}
      </div>

      <Separator />

      {PRIORITY_GROUPS.map((pg) => {
        const groupServices = SERVICES.filter((s) => s.priority === pg.key);
        if (groupServices.length === 0) return null;
        return (
          <div key={pg.key} className="space-y-3" data-testid={`section-priority-${pg.key.toLowerCase()}`}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${
                pg.key === "P0" ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" :
                pg.key === "P1" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
                pg.key === "P2" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" :
                "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
              }`}>
                {pg.key}
              </Badge>
              <h2 className="text-sm font-semibold">{pg.label}</h2>
            </div>
            <div className="space-y-2">
              {groupServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        );
      })}

      <Separator />

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2" data-testid="text-sales-order">Ordem Recomendada de Oferta</h3>
          <div className="space-y-2">
            {[
              { step: "1", label: "Revisao Tecnica (Projeto)", desc: "diagnostico + economia + evidencia" },
              { step: "2", label: "Monitoramento Continuo (Assinatura)", desc: "auditoria recorrente + compliance" },
              { step: "3", label: "Cadeia de Custodia (Diferencial)", desc: "juridico/compliance ready" },
              { step: "4", label: "Contratos + Policy + SLA", desc: "governanca e maturidade" },
              { step: "5", label: "RFP + Treinamentos + Antifraude", desc: "programas complementares" },
              { step: "6", label: "Health Care", desc: "vertical premium" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3" data-testid={`sales-step-${item.step}`}>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <span className="text-xs font-medium">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground ml-1.5">— {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
