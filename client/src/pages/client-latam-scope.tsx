import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Monitor,
  Laptop,
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
  Database,
  ShoppingCart,
  PenTool,
  BarChart3,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LatamCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  description: string;
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
    description:
      "Sistemas globais de distribuicao que centralizam reservas aereas, hoteleiras e de veiculos. Conectam agencias, OBTs e companhias aereas em tempo real.",
    channels: ["API SOAP/REST", "PNR/EDIFACT", "CSV/Flat Files", "Webhooks"],
    auditItems: [
      "PNRs completos e historico de alteracoes",
      "Tarifas aplicadas vs. negociadas (YQ/YR, markup)",
      "Regras de emissao, reemissao e reembolso",
      "Qualidade do PNR (campos obrigatorios, SSR/OSI)",
      "SLA de ticketing e pos-venda",
    ],
    evidenceTypes: ["PNR Logs", "ETKT/EMD Records", "Extratos por PCC/OfficeID", "Fee Tables"],
    providers: ["Amadeus", "Sabre", "Travelport (Galileo/Worldspan)"],
  },
  {
    id: "obt",
    name: "OBT",
    subtitle: "Online Booking Tool / Self-Booking",
    icon: Laptop,
    description:
      "Ferramenta de reserva online usada pelo colaborador para solicitar viagens dentro da politica corporativa, com fluxo de aprovacao integrado.",
    channels: ["API REST", "SSO (SAML/OAuth)", "CSV/SFTP", "Conectores GDS/NDC"],
    auditItems: [
      "Politica aplicada (classe, antecedencia, teto, preferenciais)",
      "Fluxo de aprovacao (alcadas, excecoes, justificativas)",
      "Menor tarifa logica vs. menor disponivel",
      "Aderencia a fornecedores preferenciais",
      "Cancelamentos, no-shows e gestao de credito",
    ],
    evidenceTypes: ["Booking Logs", "Policy Snapshots", "Approval Trails", "Fare Logs"],
    providers: ["Reserve (Reserve Systems)", "Argo (Argo Solutions)", "SAP Concur (Concur Travel)", "Amadeus Cytric", "GetThere (Sabre/Serko)", "Serko (Zeno)", "Neo (Amex GBT, legado KDS)", "Navan (ex-TripActions)", "TravelPerk", "Lemontech", "Onfly", "VOLL"],
  },
  {
    id: "tmc",
    name: "TMC",
    subtitle: "Travel Management Company",
    icon: Building2,
    description:
      "Agencias corporativas que operam reservas, emissoes, pos-venda e faturamento com governanca completa. Modelo ponta-a-ponta.",
    channels: ["API/Conector OBT", "Integracao ERP/AP", "VCN/Cartoes", "Data Feeds BI"],
    auditItems: [
      "Modelo de remuneracao (fee, markup, override, incentivos)",
      "SLA (emissao, urgencias, 24/7, reacomodacao)",
      "Conformidade (politica, LGPD, segregacao de funcoes)",
      "Qualidade de atendimento (FCR, TMA, backlog)",
      "Reconciliacao fatura vs PNR vs cartao vs reembolso",
    ],
    evidenceTypes: ["Contrato + Fee Tables", "Service Reports", "Faturas Detalhadas", "PNR Audit"],
    providers: ["CVC Corp", "Flytour", "BRT Operadora", "Copastur", "Rextur Advance", "Alatur JTB", "Avipam", "Travelcare"],
  },
  {
    id: "midbackoffice",
    name: "Midoffice / Backoffice",
    subtitle: "Conciliacao, faturamento, BI e compliance",
    icon: Server,
    description:
      "Camada financeira e de controle: conciliacao multi-via, billing, impostos, dashboards e deteccao de anomalias.",
    channels: ["SFTP/ETL", "API ERP", "Webhooks", "Conectores SAP/Oracle/Totvs/Benner"],
    auditItems: [
      "Conciliacao 3/4 vias (PNR/TKT vs fatura vs cartao vs reembolso)",
      "Duplicidades e cobrancas indevidas",
      "Integridade dos lancamentos (CC, projeto, conta contabil)",
      "Parametrizacao de impostos e retencoes",
      "Deteccao de padroes de fraude/abuso",
    ],
    evidenceTypes: ["Raw Import Files (hash)", "Reconciliation Rules", "Exception Logs", "AP/GL Trail"],
    providers: ["Wintour", "STUR / STUR Web (STUR CORP)", "SAP S/4FI", "Oracle EBS AP", "TOTVS Protheus", "Microsoft Dynamics", "Benner", "Regente"],
  },
  {
    id: "payments",
    name: "Pagamentos Corporativos",
    subtitle: "Cartoes, VCN, billing central e fintech",
    icon: CreditCard,
    description:
      "Camada de pagamento corporativo: cartao fisico, cartao virtual (VCN), faturamento centralizado e integracoes com ERPs.",
    channels: ["API Emissor/Fintech", "OFX/CSV Extratos", "Integracao OBT/TMC", "Integracao ERP"],
    auditItems: [
      "Politica de pagamento (VCN vs fatura vs reembolso)",
      "Match transacao x reserva x viajante x centro de custo",
      "Split de despesas (hotel, taxa, multa, ancillaries)",
      "Chargebacks e disputas",
      "MCC bloqueados, limites e aprovacoes",
    ],
    evidenceTypes: ["Extratos Raw", "VCN Logs", "Approval Audit", "Chargeback Reports"],
    providers: ["IVT", "Bradesco EBTA", "HCard", "CTA", "CTAH", "Purchasing Card", "VCN", "TAR", "Conferma Pay", "B2 Payments", "WEX", "AirPlus"],
  },
  {
    id: "airlines",
    name: "Companhias Aereas",
    subtitle: "Conteudo direto, NDC e programas corporativos",
    icon: Plane,
    description:
      "Fornecedores finais de transporte aereo com contratos corporativos, negociacao de tarifas, NDC e gestao de ADM/ACM.",
    channels: ["NDC (direto/agregador)", "GDS", "APIs/Portais Corporativos", "Data Feeds ADM/ACM"],
    auditItems: [
      "Acordo corporativo (discount, rebate, targets)",
      "ADMs/ACMs (cobrancas pos-viagem)",
      "Ancillaries (bagagem, assento, prioridade)",
      "Regras de remarcacao e cancelamento",
      "Emissao correta (tarifa vs acordo negociado)",
    ],
    evidenceTypes: ["E-tickets/EMDs", "BSP Reports", "Flown Revenue", "ADM/ACM Docs"],
    providers: ["LATAM Airlines", "GOL Linhas Aereas", "Azul", "American Airlines", "United Airlines", "Copa Airlines", "Avianca", "Aeromexico", "JetSmart", "BSPlink (IATA)"],
  },
  {
    id: "hotels",
    name: "Hotelaria Corporativa",
    subtitle: "Redes, tarifas negociadas e conectividade",
    icon: Hotel,
    description:
      "Hospedagem corporativa com rate agreements, last-room-availability, RFP e auditoria de folios detalhados.",
    channels: ["GDS/Channel/CRS", "APIs/Conectores B2B", "RFP Sourcing", "Feeds (folios/no-show)"],
    auditItems: [
      "Tarifa negociada vs. tarifa publica (paridade)",
      "Inclusoes (cafe, wi-fi, estacionamento)",
      "Politica de cancelamento e no-show",
      "Conformidade com preferenciais e teto",
      "Taxas extras e cobrancas indevidas (folios)",
    ],
    evidenceTypes: ["Rate Sheets/Contratos", "Folios Detalhados", "No-show Logs", "Availability Logs"],
    providers: ["Accor", "Atlantica Hotels", "Marriott", "Hilton", "IHG", "Wyndham", "Blue Tree", "Nacional Inn", "Windsor", "Bourbon"],
  },
  {
    id: "carrental",
    name: "Locadoras / Car Rental",
    subtitle: "Locacao e mobilidade corporativa",
    icon: Car,
    description:
      "Aluguel de veiculos e mobilidade corporativa com auditoria de categorias, seguros, extras e integracao com politica.",
    channels: ["GDS/OBT Conector", "APIs Diretas", "Faturamento/Extratos", "Integracao Politica"],
    auditItems: [
      "Categoria reservada vs entregue (upsell)",
      "Seguros, waivers e franquias",
      "Combustivel, pedagios, multas e extras",
      "No-show e cancelamentos",
      "Diarias e taxas acessorias",
    ],
    evidenceTypes: ["Contrato Corporativo", "Vouchers", "Faturas Detalhadas", "Reservation Logs"],
    providers: ["Localiza Hertz", "Movida", "Unidas", "Foco Aluguel", "Avis", "Budget", "Enterprise", "National"],
  },
  {
    id: "insurance",
    name: "Seguradoras / Assistencia Viagem",
    subtitle: "Apolices corporativas e assistencia",
    icon: Shield,
    description:
      "Cobertura medica, assistencia viagem, apolices anuais e vouchers por viagem com auditoria de elegibilidade e sinistralidade.",
    channels: ["API (vouchers/elegibilidade)", "Arquivos (sinistros)", "Portais Corporativos", "Integracao OBT/TMC"],
    auditItems: [
      "Elegibilidade por perfil, pais e risco",
      "Cobertura contratada vs. emitida",
      "SLA de atendimento e rede credenciada",
      "Sinistralidade e reembolsos",
      "Cobrancas duplicadas",
    ],
    evidenceTypes: ["Apolice + Endossos", "Vouchers Emitidos", "Sinistro Reports", "Billing Trails"],
    providers: ["Porto Seguro Viagem", "Allianz Travel", "Assist Card", "Travel Ace", "GTA", "Affinity Seguro", "Coris", "April Brasil"],
  },
  {
    id: "mice",
    name: "Eventos Corporativos (MICE)",
    subtitle: "Meetings, Incentives, Conferences & Exhibitions",
    icon: CalendarDays,
    description:
      "Cadeia completa de eventos: sourcing de venues, inscricoes, fornecedores, A&B, A/V, hospedagem de grupo e compliance de contratacao.",
    channels: ["RFP/Sourcing", "APIs de Credenciamento", "Integracao Pagamentos", "Export Listas/NF"],
    auditItems: [
      "Comparacao de cotacoes (min. 3 fornecedores)",
      "Compliance de contratacao (PO, SLA, clausulas)",
      "Orcamento vs. realizado (variacoes e aditivos)",
      "Reembolsos, cancelamentos e multas",
      "Split de custos por centro de custo/projeto",
    ],
    evidenceTypes: ["RFPs + Propostas", "Contratos + Aditivos", "NFs/Faturas", "Attendance Records"],
    providers: ["MCI Group", "GL Events", "Grupo Embratur", "InEvent", "Sympla Business", "Eventbrite Corporate", "Cvent"],
  },
  {
    id: "bsm",
    name: "BSM",
    subtitle: "Business Spend Management",
    icon: ShoppingCart,
    description:
      "Plataformas de gestao de gastos corporativos que centralizam procurement, travel, invoices e compliance em um unico ecossistema.",
    channels: ["API REST", "Integracao ERP", "SSO/SAML", "Conectores TMC/OBT"],
    auditItems: [
      "Politicas de gastos e workflows de aprovacao",
      "Compliance de procurement e sourcing",
      "Invoices vs. contratos vs. POs",
      "Segregacao de funcoes e limites de alcada",
      "Reconciliacao de settlement e billing",
    ],
    evidenceTypes: ["Approval Trails", "Invoice Matching", "PO Logs", "Policy Reports"],
    providers: ["Coupa", "Concur", "Cvent", "Veeva", "BSPlink", "Conferma", "B2B", "Paytrack", "Mobi"],
  },
  {
    id: "esign",
    name: "eSIGN",
    subtitle: "Assinatura Digital e Eletronica",
    icon: PenTool,
    description:
      "Plataformas de assinatura digital para contratos, aditivos, SLAs e termos — com validade juridica e rastreabilidade completa.",
    channels: ["API REST", "Webhook/Notificacoes", "Integracao ERP/CRM", "Portal Web"],
    auditItems: [
      "Validade juridica das assinaturas (ICP-Brasil, certificado A1/A3)",
      "Trilha de assinaturas (quem, quando, IP, geolocalizacao)",
      "Versionamento de documentos e aditivos",
      "Conformidade com LGPD e retencao documental",
      "Integridade do documento pos-assinatura (hash)",
    ],
    evidenceTypes: ["Certificados Digitais", "Audit Trails", "Hash SHA-256", "Logs de Assinatura"],
    providers: ["DocuSign", "Effect", "AdobeSign", "D4Sign", "ClickSign"],
  },
  {
    id: "bi",
    name: "Business Intelligence",
    subtitle: "Dashboards, Analytics e Reporting",
    icon: BarChart3,
    description:
      "Ferramentas de BI para visualizacao de dados, dashboards executivos, KPIs de auditoria e analises preditivas de gastos.",
    channels: ["Conectores SQL/API", "ODBC/JDBC", "REST API", "Embedded Analytics"],
    auditItems: [
      "Integridade dos dados consumidos (fonte vs. dashboard)",
      "Logica de calculo de KPIs e metricas",
      "Governanca de acesso e permissoes",
      "Frequencia de atualizacao e SLA de dados",
      "Consistencia cross-report",
    ],
    evidenceTypes: ["Data Lineage", "Dashboard Snapshots", "Refresh Logs", "Access Logs"],
    providers: ["Power BI", "QlikView", "Tableau", "Cognos"],
  },
  {
    id: "others",
    name: "Outros Sistemas",
    subtitle: "Sistemas legados e especificos do mercado",
    icon: Wrench,
    description:
      "Sistemas complementares, legados ou especificos de determinados segmentos que participam do ecossistema de viagens e despesas corporativas.",
    channels: ["SFTP/CSV", "API proprietaria", "Integracao batch", "Portal Web"],
    auditItems: [
      "Qualidade e formato dos dados exportados",
      "Integracao com sistemas principais (ERP, OBT, BSM)",
      "Consistencia de dados entre sistemas",
      "Logs de operacao e rastreabilidade",
      "Conformidade com padroes de mercado",
    ],
    evidenceTypes: ["Export Files", "Integration Logs", "Data Quality Reports", "System Configs"],
    providers: ["AZB", "LOS", "MDGx", "Espider", "Webuy", "Cora", "ICE", "Selas", "Certis", "CSM"],
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
              <CardTitle className="text-base" data-testid={`text-category-name-${category.id}`}>
                {category.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{category.subtitle}</p>
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
        <p className="text-sm text-muted-foreground" data-testid={`text-category-desc-${category.id}`}>
          {category.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {category.channels.map((ch) => (
            <Badge key={ch} variant="secondary" className="text-[10px]">
              {ch}
            </Badge>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Fornecedores
          </p>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Itens Auditaveis
              </p>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Tipos de Evidencia
              </p>
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
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-latam-scope-title">
          Ecossistema LATAM
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cobertura completa do ecossistema corporativo de despesas auditado pela AuraAUDIT
        </p>
      </div>

      <Card data-testid="card-latam-coverage">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
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
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold" data-testid="text-categories-section-title">
          15 Categorias do Ecossistema
        </h2>
        <Badge variant="secondary" className="text-xs">15 categorias</Badge>
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
