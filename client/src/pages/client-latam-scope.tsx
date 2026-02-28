import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Monitor,
  Building2,
  Server,
  CreditCard,
  Plane,
  Hotel,
  Car,
  Shield,
  CalendarDays,
  CheckSquare,
  FileText,
  ChevronDown,
  ChevronRight,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LatamCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  whatItIs: string;
  channels: string[];
  auditItems: string[];
  evidenceTypes: string[];
  providers: string[];
}

const LATAM_COUNTRIES = [
  { name: "Brasil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "Colombia", code: "CO" },
  { name: "Chile", code: "CL" },
  { name: "Argentina", code: "AR" },
  { name: "Peru", code: "PE" },
];

const CATEGORIES: LatamCategory[] = [
  {
    id: "gds",
    name: "GDS",
    subtitle: "Global Distribution Systems",
    icon: Globe,
    whatItIs: "Sistemas globais que centralizam reservas de aereo, hotel e carro. Conectam agencias e OBTs as companhias aereas e fornecedores em tempo real.",
    channels: ["API", "PNR/EDIFACT", "CSV", "Portal"],
    auditItems: [
      "PNRs completos e historico de alteracoes",
      "Tarifas aplicadas vs. negociadas",
      "Regras de emissao e reembolso",
      "Qualidade do PNR (campos obrigatorios)",
      "SLA de ticketing e pos-venda",
    ],
    evidenceTypes: ["PNR Logs", "ETKT/EMD Records", "Extratos por PCC", "Fee Tables"],
    providers: ["Amadeus", "Sabre", "Travelport"],
  },
  {
    id: "obt",
    name: "OBT",
    subtitle: "Online Booking Tool",
    icon: Monitor,
    whatItIs: "Ferramenta de reserva online usada pelo colaborador para solicitar viagens dentro da politica corporativa, com aprovacao integrada.",
    channels: ["API", "SSO", "CSV/SFTP", "GDS/NDC"],
    auditItems: [
      "Politica aplicada (classe, antecedencia, teto)",
      "Fluxo de aprovacao e excecoes",
      "Menor tarifa logica vs. disponivel",
      "Aderencia a fornecedores preferenciais",
      "Cancelamentos e gestao de credito",
    ],
    evidenceTypes: ["Booking Logs", "Policy Snapshots", "Approval Trails", "Fare Logs"],
    providers: ["Reserve", "Argo Solutions", "SAP Concur", "Cytric", "Navan", "TravelPerk", "Onfly", "VOLL"],
  },
  {
    id: "tmc",
    name: "TMC",
    subtitle: "Travel Management Company",
    icon: Building2,
    whatItIs: "Agencias corporativas que operam reservas, emissoes, pos-venda e faturamento. Modelo ponta-a-ponta com governanca completa.",
    channels: ["API/OBT", "ERP", "VCN/Cartoes", "Data Feeds"],
    auditItems: [
      "Modelo de remuneracao (fee, markup, incentivos)",
      "SLA de emissao, urgencias e reacomodacao",
      "Conformidade com politica e LGPD",
      "Qualidade de atendimento (FCR, TMA)",
      "Reconciliacao fatura vs PNR vs cartao",
    ],
    evidenceTypes: ["Contrato + Fees", "Service Reports", "Faturas Detalhadas", "PNR Audit"],
    providers: [],
  },
  {
    id: "midbackoffice",
    name: "Midoffice / Backoffice",
    subtitle: "Conciliacao, faturamento e compliance",
    icon: Server,
    whatItIs: "Camada financeira e de controle onde acontecem conciliacao multi-via, billing, deteccao de anomalias e gestao de impostos.",
    channels: ["SFTP/ETL", "API ERP", "Portal", "Conectores SAP/Oracle"],
    auditItems: [
      "Conciliacao 3/4 vias (PNR vs fatura vs cartao)",
      "Duplicidades e cobrancas indevidas",
      "Integridade dos lancamentos contabeis",
      "Parametrizacao de impostos e retencoes",
    ],
    evidenceTypes: ["Raw Files (hash)", "Reconciliation Rules", "Exception Logs", "AP/GL Trail"],
    providers: ["Wintour", "Stur", "SAP S/4FI", "Oracle EBS", "TOTVS Protheus", "Benner"],
  },
  {
    id: "payments",
    name: "Pagamentos Corporativos",
    subtitle: "Cartoes, VCN e faturamento centralizado",
    icon: CreditCard,
    whatItIs: "Camada de pagamento: cartao fisico, cartao virtual (VCN), faturamento centralizado e integracoes com ERPs para controle total.",
    channels: ["API", "CSV/OFX", "OBT/TMC", "ERP"],
    auditItems: [
      "Politica de pagamento (VCN vs fatura vs reembolso)",
      "Match transacao x reserva x viajante",
      "Split de despesas e ancillaries",
      "Chargebacks e disputas",
    ],
    evidenceTypes: ["Extratos Raw", "VCN Logs", "Approval Audit", "Chargeback Reports"],
    providers: [],
  },
  {
    id: "airlines",
    name: "Companhias Aereas",
    subtitle: "Conteudo direto, NDC e programas corporativos",
    icon: Plane,
    whatItIs: "Fornecedores de transporte aereo com contratos corporativos, negociacao de tarifas, NDC e gestao de ADM/ACM.",
    channels: ["NDC", "GDS", "API/Portal", "Data Feeds"],
    auditItems: [
      "Acordo corporativo (discount, rebate, targets)",
      "ADMs/ACMs (cobrancas pos-viagem)",
      "Ancillaries (bagagem, assento)",
      "Regras de remarcacao e cancelamento",
      "Emissao conforme acordo negociado",
    ],
    evidenceTypes: ["E-tickets/EMDs", "BSP Reports", "Flown Revenue", "ADM/ACM Docs"],
    providers: [],
  },
  {
    id: "hotels",
    name: "Hotelaria Corporativa",
    subtitle: "Redes, tarifas negociadas e folios",
    icon: Hotel,
    whatItIs: "Hospedagem corporativa com rate agreements, LRA e auditoria de folios detalhados para garantir tarifas negociadas.",
    channels: ["GDS/CRS", "API B2B", "RFP", "CSV"],
    auditItems: [
      "Tarifa negociada vs. tarifa publica",
      "Inclusoes (cafe, wi-fi, estacionamento)",
      "Politica de cancelamento e no-show",
      "Taxas extras e cobrancas indevidas",
    ],
    evidenceTypes: ["Rate Sheets", "Folios Detalhados", "No-show Logs", "Availability Logs"],
    providers: [],
  },
  {
    id: "carrental",
    name: "Locadoras / Car Rental",
    subtitle: "Locacao e mobilidade corporativa",
    icon: Car,
    whatItIs: "Aluguel de veiculos e mobilidade corporativa com auditoria de categorias, seguros, extras e conformidade com politica.",
    channels: ["GDS/OBT", "API", "Faturamento", "Portal"],
    auditItems: [
      "Categoria reservada vs entregue (upsell)",
      "Seguros, waivers e franquias",
      "Combustivel, pedagios e extras",
      "No-show e cancelamentos",
    ],
    evidenceTypes: ["Contrato Corporativo", "Vouchers", "Faturas Detalhadas", "Reservation Logs"],
    providers: [],
  },
  {
    id: "insurance",
    name: "Seguradoras / Assistencia Viagem",
    subtitle: "Apolices corporativas e assistencia",
    icon: Shield,
    whatItIs: "Cobertura medica e assistencia viagem com apolices anuais ou por viagem. Auditoria de elegibilidade e sinistralidade.",
    channels: ["API", "CSV", "Portal", "OBT/TMC"],
    auditItems: [
      "Elegibilidade por perfil e destino",
      "Cobertura contratada vs. emitida",
      "SLA de atendimento e rede credenciada",
      "Cobrancas duplicadas",
    ],
    evidenceTypes: ["Apolice + Endossos", "Vouchers Emitidos", "Sinistro Reports", "Billing Trails"],
    providers: [],
  },
  {
    id: "mice",
    name: "Eventos Corporativos (MICE)",
    subtitle: "Meetings, Incentives, Conferences & Exhibitions",
    icon: CalendarDays,
    whatItIs: "Cadeia completa de eventos: sourcing de venues, inscricoes, fornecedores, A&B, hospedagem de grupo e compliance de contratacao.",
    channels: ["RFP/Sourcing", "API", "Portal", "CSV/NF"],
    auditItems: [
      "Comparacao de cotacoes (min. 3 fornecedores)",
      "Compliance de contratacao (PO, SLA)",
      "Orcamento vs. realizado (variacoes e aditivos)",
      "Reembolsos, cancelamentos e multas",
      "Split de custos por centro de custo",
    ],
    evidenceTypes: ["RFPs + Propostas", "Contratos + Aditivos", "NFs/Faturas", "Attendance Records"],
    providers: [],
  },
];

function CategoryCard({ category }: { category: LatamCategory }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  return (
    <Card data-testid={`card-category-${category.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm" data-testid={`text-category-name-${category.id}`}>
                {category.name}
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">{category.subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-expand-${category.id}`}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">O que e</p>
          <p className="text-xs text-foreground leading-relaxed" data-testid={`text-category-desc-${category.id}`}>
            {category.whatItIs}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {category.channels.map((ch) => (
            <Badge key={ch} variant="secondary" className="text-[10px]">
              {ch}
            </Badge>
          ))}
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">Fornecedores</p>
          <div className="flex flex-wrap gap-1.5">
            {category.providers.map((provider) => (
              <Badge key={provider} className="text-[10px] bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" variant="outline">
                {provider}
              </Badge>
            ))}
          </div>
        </div>
        {expanded && (
          <div className="space-y-3 pt-1">
            <Separator />
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Itens Auditaveis</p>
              <div className="space-y-1.5">
                {category.auditItems.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Tipos de Evidencia</p>
              <div className="flex flex-wrap gap-1.5">
                {category.evidenceTypes.map((ev) => (
                  <Badge key={ev} variant="outline" className="text-[10px]">
                    <FileText className="w-3 h-3 mr-1" />
                    {ev}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ClientLatamScope() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-latam-scope-title">
          Ecossistema LATAM
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Cobertura completa do ecossistema corporativo de despesas auditado pela AuraAUDIT
        </p>
      </div>

      <Card data-testid="card-latam-coverage">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Cobertura LATAM</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {LATAM_COUNTRIES.map((country) => (
              <Badge
                key={country.code}
                variant="outline"
                className="text-xs gap-1.5"
                data-testid={`badge-country-${country.code}`}
              >
                <span className="font-semibold text-primary">{country.code}</span>
                {country.name}
              </Badge>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Cobertura completa do ecossistema corporativo de despesas, desde GDS e OBTs ate eventos corporativos (MICE), com atuacao em toda a America Latina. Referencias de mercado: ABRACORP e ALAGEV.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold" data-testid="text-categories-section-title">
          10 Categorias Primarias
        </h2>
        <Badge variant="secondary" className="text-[10px]">10 categorias</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - AuraDue</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}
