import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, ArrowLeft } from "lucide-react";

export default function CompliancePolicyPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/landingpage-test")} data-testid="logo-auratech-policy">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AuraTECH</h1>
              <p className="text-[10px] text-muted-foreground">Trust Infrastructure Platform</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/landingpage-test")} data-testid="button-back-home">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="p-6 max-w-[1000px] mx-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Politica de Compliance, Privacidade e Protecao de Dados</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            A AuraTECH mantem um compromisso institucional com etica, conformidade, governanca e protecao de dados em todas as atividades da plataforma e de seus modulos.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">1. Compromisso institucional</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">A AuraTECH estrutura seus processos com foco em:</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground pl-4">
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Integridade e conformidade</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Protecao de dados pessoais</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Seguranca da informacao</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Rastreabilidade de evidencias</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Cadeia de custodia</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Transparencia e responsabilizacao</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">2. Protecao de dados e LGPD</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O tratamento de dados pessoais realizado no contexto da plataforma busca observar os principios aplicaveis da Lei Geral de Protecao de Dados Pessoais (LGPD), incluindo:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Finalidade", "Adequacao", "Necessidade", "Livre acesso", "Qualidade dos dados", "Transparencia", "Seguranca", "Prevencao", "Nao discriminacao", "Responsabilizacao e prestacao de contas"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">3. Governanca e controles</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A AuraTECH adota medidas tecnicas, organizacionais e administrativas proporcionais para:
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground pl-4">
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Proteger dados e informacoes sob sua custodia</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Restringir acessos conforme necessidade e perfil de uso</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Reforcar a integridade de registros e evidencias</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Manter trilhas de auditoria e rastreabilidade</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span> Apoiar a prevencao de uso indevido, perda, alteracao ou acesso nao autorizado</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">4. Cadeia de custodia e evidencias</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sempre que aplicavel ao contexto do modulo, a plataforma pode empregar mecanismos de cadeia de custodia, registro de integridade, versionamento, trilhas de processamento e monitoramento de evidencias, com o objetivo de reforcar confiabilidade, verificabilidade e governanca operacional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">5. Bases legais e finalidade</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A coleta e o tratamento de dados devem estar vinculados a finalidades legitimas, especificas e compativeis com o contexto de uso da plataforma, observadas as bases legais aplicaveis e o principio da minimizacao.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">6. Direitos dos titulares</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A AuraTECH busca oferecer meios adequados para atendimento de solicitacoes relacionadas aos direitos dos titulares, na forma da legislacao aplicavel e conforme a natureza da relacao juridica e operacional existente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">7. Agentes de tratamento e responsabilizacao</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As responsabilidades relacionadas ao tratamento de dados sao definidas conforme o papel exercido em cada operacao, observadas as diretrizes legais e regulatorias aplicaveis, bem como as orientacoes da ANPD.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">8. Atualizacao e aprimoramento</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esta politica podera ser atualizada para refletir evolucao regulatoria, aprimoramento de governanca, mudancas operacionais ou novas exigencias legais e de seguranca.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-sm font-semibold">9. Contato</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Questoes relacionadas a compliance, privacidade, protecao de dados ou exercicio de direitos poderao ser encaminhadas pelos canais institucionais:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a href="mailto:suporte@auradue.com" className="inline-flex items-center gap-2 text-xs text-primary hover:underline" data-testid="link-policy-support">
                  suporte@auradue.com
                </a>
                <a href="mailto:privacidade@auradue.com" className="inline-flex items-center gap-2 text-xs text-primary hover:underline" data-testid="link-policy-privacy">
                  privacidade@auradue.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-6 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>Cadeia de Custodia Digital — Lei 13.964/2019</span>
          </div>
          <span>© 2025 AuraTECH. Todos os direitos reservados.</span>
        </div>
      </div>
    </div>
  );
}
