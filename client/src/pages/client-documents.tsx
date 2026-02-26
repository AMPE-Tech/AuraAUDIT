import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FolderOpen,
  Shield,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Upload,
  Download,
  Target,
  ListChecks,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const SCOPE_ITEMS = [
  { item: "Auditoria forense completa em despesas de viagens corporativas e eventos", status: "combinado" },
  { item: "Analise de conformidade com politicas internas de viagens", status: "combinado" },
  { item: "Reconciliacao entre sistemas OBT (Reserve, Argo) e Backoffice (Wintour, Stur)", status: "combinado" },
  { item: "Identificacao de anomalias, duplicidades e fraudes potenciais", status: "combinado" },
  { item: "Cruzamento de dados com fontes externas (cias aereas, agencias, EBTA)", status: "combinado" },
  { item: "Avaliacao de eficiencia operacional e oportunidades de economia", status: "combinado" },
  { item: "Verificacao de aderencia a Lei 13.964/2019 e normas anticorrupcao", status: "combinado" },
];

const DELIVERABLES = [
  { name: "Relatorio Executivo de Auditoria", deadline: "A cada fase concluida", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Relatorio Tecnico Detalhado", deadline: "Ao final do projeto", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Matriz de Riscos e Anomalias", deadline: "Fase 03 — Reconciliacao", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Parecer de Conformidade Legal", deadline: "Fase 04 — Apresentacao", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Plano de Recomendacoes e Acoes Corretivas", deadline: "Fase 05 — Ajustes", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Dashboard Interativo de Resultados", deadline: "Disponivel em tempo real", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
  { name: "Cadeia de Custodia Digital Completa", deadline: "Continuo durante o projeto", clientStatus: "aguardando_dados", auditStatus: "aguardando_dados" },
];

const EXPECTED_DOCUMENTS = [
  { name: "Extratos OBT Reserve (reservas e PNRs)", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Extratos OBT Argo (reservas e PNRs)", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Base Backoffice Wintour (emissoes 2024)", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Base Backoffice Stur (emissoes 2025)", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Extratos Bradesco EBTA (cartoes corporativos)", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Dados GDS Sabre / Amadeus", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Faturamento BSPlink", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Management files agencias (CVC, Flytour, BRT)", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Politica de viagens vigente", responsible: "Grupo Stabia", status: "pendente" },
  { name: "Tabela de aprovadores e limites", responsible: "Grupo Stabia", status: "pendente" },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "entregue":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    case "em_andamento":
      return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    case "pendente":
    case "aguardando_dados":
      return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "entregue":
      return <Badge className="text-[10px] bg-emerald-600">Entregue</Badge>;
    case "em_andamento":
      return <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Em andamento</Badge>;
    case "aguardando_dados":
      return <Badge variant="outline" className="text-[10px] gap-1"><AlertCircle className="w-2.5 h-2.5" />Aguardando dados</Badge>;
    case "pendente":
      return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
    case "combinado":
      return <Badge variant="outline" className="text-[10px] gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-primary" />Combinado</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

export default function ClientDocuments() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-documents-title">
            Meus Documentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documentos do projeto, entregaveis e acompanhamento | {user?.fullName}
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Lei 13.964/2019
        </Badge>
      </div>

      <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Aguardando documentos do cliente</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mt-0.5">
                Os documentos e bases de dados listados abaixo sao necessarios para iniciar as analises. 
                Apos o recebimento, os entregaveis da auditoria serao produzidos e disponibilizados aqui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Escopo do Contrato
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Itens combinados na proposta comercial</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SCOPE_ITEMS.map((item) => (
              <div key={item.item} className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50" data-testid={`scope-item-${item.item.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-xs">{item.item}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Documentos Esperados do Cliente
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Bases de dados e documentos necessarios para iniciar as analises</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {EXPECTED_DOCUMENTS.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50" data-testid={`doc-expected-${doc.name.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  {getStatusIcon(doc.status)}
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">Responsavel: {doc.responsible}</p>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Entregaveis da Auditoria
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Documentos e relatorios a serem produzidos pela AuraAUDIT</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground">Entregavel</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Prazo</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Dados do Cliente</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Auditoria AuraAUDIT</th>
                </tr>
              </thead>
              <tbody>
                {DELIVERABLES.map((d) => (
                  <tr key={d.name} className="border-b last:border-0" data-testid={`deliverable-row-${d.name.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-2 text-muted-foreground">{d.deadline}</td>
                    <td className="p-2 text-center">{getStatusBadge(d.clientStatus)}</td>
                    <td className="p-2 text-center">{getStatusBadge(d.auditStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            Relatorios e Arquivos Produzidos
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Documentos gerados durante a auditoria</p>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
            <FolderOpen className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhum documento produzido ainda</p>
            <p className="text-[11px] mt-1">Os relatorios serao disponibilizados aqui conforme as analises forem concluidas</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital — AuraDue</span>
        </div>
        <span>AuraAUDIT — Auditoria Forense Independente</span>
      </div>
    </div>
  );
}
