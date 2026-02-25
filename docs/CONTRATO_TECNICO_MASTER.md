# CONTRATO TECNICO MASTER — AuraAUDIT

**Plataforma**: AuraAUDIT — Auditoria Forense Independente
**Versao do Documento**: 1.0
**Data de Criacao**: 25/02/2026
**Ultima Atualizacao**: 25/02/2026

---

## 1. OBJETO

Desenvolvimento e manutencao da plataforma AuraAUDIT, sistema de auditoria forense online para despesas corporativas, com cadeia de custodia digital, rastreabilidade juridica conforme Lei 13.964/2019 (Pacote Anticrime), e assistente generativo especializado.

## 2. ARQUITETURA TECNICA

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite + TailwindCSS + shadcn/ui + Recharts |
| Backend | Express.js + Node.js |
| Banco de Dados | PostgreSQL + Drizzle ORM |
| AI | OpenAI via Replit AI Integrations (GPT-5.2) |
| Roteamento Frontend | wouter |
| Estado | TanStack React Query |
| Autenticacao | express-session + bcrypt + connect-pg-simple |

## 3. ESTRUTURA DE ACESSO

### 3.1 Visao Publica (sem login)
- `/` — Landing page institucional
- `/login` — Tela de autenticacao

### 3.2 Visao Admin (acesso completo)
- `/dashboard` — Dashboard com KPIs do projeto
- `/expenses` — Gestao de despesas
- `/reconciliation` — Reconciliacao multi-sistema
- `/cases` — Casos de auditoria
- `/anomalies` — Deteccao de anomalias
- `/services` — Catalogo de servicos (P0-P3)
- `/clients` — Cadastro de clientes
- `/integrations` — Hub de integracoes
- `/admin` — Painel administrativo
- `/audit-trail` — Trilha de auditoria imutavel
- `/reports` — Relatorios estruturados

### 3.3 Portal do Cliente
- `/dashboard` — Dashboard do projeto
- `/project-panel` — Painel detalhado
- `/systems` — Sistemas utilizados
- `/expense-types` — Tipos de despesa
- `/integrations` — Integracoes
- `/products` — Produtos & Servicos
- `/contract` — Contrato
- `/latam-scope` — Ecossistema LATAM

## 4. CREDENCIAIS DE ACESSO

| Perfil | Usuario | Senha | Acesso |
|--------|---------|-------|--------|
| Admin | nml.costa@gmail.com | aura2025! | Plataforma completa |
| Cliente | stabia | stabia2025! | Portal Grupo Stabia |

## 5. TABELAS DO BANCO DE DADOS

- `users` — Usuarios e autenticacao
- `expenses` — Despesas corporativas
- `audit_cases` — Casos de auditoria
- `anomalies` — Anomalias detectadas
- `audit_trail` — Trilha imutavel (SHA-256)
- `clients` — Cadastro de clientes
- `data_sources` — Fontes de dados / integracoes
- `conversations` — Conversas do assistente AI
- `messages` — Mensagens do assistente AI
- `proposals` — Propostas comerciais e contratos

## 6. SISTEMA ANTIREGRESSAO

### 6.1 Controles Ativos
- **Checkpoints automaticos**: Git commit a cada entrega com mensagem descritiva
- **Cadeia de custodia digital**: Hashes SHA-256 deterministicos em todas as operacoes de auditoria
- **Trilha de auditoria imutavel**: Registro de todas as acoes com timestamp, usuario, dados antes/depois
- **Validacao Zod**: Todos os endpoints POST/PATCH validados com schemas Zod antes de persistir
- **Integridade referencial**: Chaves estrangeiras e constraints no PostgreSQL

### 6.2 Controles Antialucinacao
- **Dados reais**: Sistema utiliza dados seed realistas baseados em cenarios corporativos brasileiros
- **Assistente AI contextualizado**: GPT-5.2 com system prompt especializado em T&E, compliance e metodologia de auditoria
- **Validacao de entrada**: Schemas Drizzle-Zod garantem tipos e formatos corretos
- **Sem fallbacks silenciosos**: Erros sao explicitos, nao mascarados
- **Lei 13.964/2019**: Referencia legislativa mantida em toda a plataforma

## 7. ENDPOINTS DA API

### Despesas
- `GET /api/expenses` | `POST /api/expenses` | `PATCH /api/expenses/:id` | `DELETE /api/expenses/:id`

### Casos de Auditoria
- `GET /api/audit-cases` | `POST /api/audit-cases` | `PATCH /api/audit-cases/:id`

### Anomalias
- `GET /api/anomalies` | `POST /api/anomalies` | `PATCH /api/anomalies/:id`

### Clientes
- `GET /api/clients` | `POST /api/clients` | `GET /api/clients/:id` | `GET /api/clients/type/:type` | `PATCH /api/clients/:id` | `DELETE /api/clients/:id`

### Fontes de Dados
- `GET /api/data-sources` | `POST /api/data-sources` | `GET /api/data-sources/:id` | `GET /api/data-sources/client/:clientId` | `PATCH /api/data-sources/:id` | `DELETE /api/data-sources/:id`

### Propostas/Contratos
- `GET /api/proposals` | `POST /api/proposals` | `GET /api/proposals/:id` | `PATCH /api/proposals/:id`

### Trilha de Auditoria
- `GET /api/audit-trail`

### Admin
- `GET /api/admin/stats`

### AI (SSE Streaming)
- `GET /api/ai/conversations` | `POST /api/ai/conversations` | `GET /api/ai/conversations/:id` | `DELETE /api/ai/conversations/:id` | `POST /api/ai/conversations/:id/messages`

---

## ANEXO A — ADITIVO DE SESSAO 25/02/2026

### A.1 Resumo da Sessao

Sessao de ajustes na landing page publica, catalogo de produtos, tipografia e sistema de propostas/contratos.

### A.2 Alteracoes Realizadas

#### ALT-001: Remocao do segundo logotipo da landing page
- **Commit**: `6fe7b39`
- **Descricao**: Removido bloco duplicado de logotipo ("AuraAudit / Servicos de Auditoria em Viagens e Eventos Corporativos") que aparecia antes do card "O que fazemos"
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-002: Atualizacao do texto "O que fazemos"
- **Commit**: `6fe7b39`
- **Descricao**: Texto atualizado para: "Uma plataforma forense de auditoria online que detecta desconformidades e desperdicios em despesas corporativas, automatiza a coleta e a conciliacao de evidencias e entrega trilhas auditaveis, alertas em tempo real, cadeia de custodia e rastreabilidade juridica, com dashboards executivos e monitoramento continuo — no padrao que Compliance exige."
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-003: Ajuste do card de performance "+448 MI"
- **Commit**: `595be63`
- **Descricao**: Texto alterado de "Recuperados / em economia e recuperacao" para "Economizados / media do total revisado"
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-004: Generalizacao de textos da landing page
- **Commit**: `adce6bd`
- **Descricao**: Removidas todas as referencias exclusivas a "viagens e eventos" nos textos genericos. Ajustados:
  - "Para Empresas": subtitulo generico ("despesas corporativas recorrentes")
  - Auditoria Financeira: descricao e checklist genericos
  - Auditoria de Politica: "politicas corporativas vigentes"
  - Antifraude: "por categoria e perfil", "por unidade/centro de custo"
  - "Para Fornecedores": subtitulo generico ("fornecedores corporativos")
  - Secao MICE: removida da landing page (mantida na pagina dedicada)
  - Cobertura LATAM: texto simplificado
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-005: Substituicao de nomes de empresas por segmentos
- **Commit**: `72c10ce`
- **Descricao**: Secao "Principais Cases" agora mostra 15 segmentos de atuacao em vez de nomes de empresas: Farmaceutica, Cosmeticos, Alimentos & Bebidas, Tecnologia, Servicos, Energia & Oil & Gas, Automotivo, Siderurgia & Mineracao, Quimica & Agro, Bancos & Financeiro, Varejo & E-commerce, Saude & Hospitalar, Engenharia & Construcao, Seguros, Telecomunicacoes. Subtitulo: "+300 cases em praticamente todos os segmentos"
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-006: Catalogo de Produtos na landing page
- **Commit**: `b51972a`
- **Descricao**: Adicionados 8 cards de produtos/servicos na landing page com "Saiba mais" expansivel:
  1. Viagens e Eventos
  2. Despesas Corporativas
  3. Contratos com Terceiros
  4. Telecomunicacoes
  5. Frota e Logistica
  6. Beneficios e RH
  7. Suprimentos e Compras
  8. Monitoramento Continuo
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-007: Reorganizacao de secoes da landing page
- **Commit**: `410fff4`
- **Descricao**: Catalogo de produtos movido para logo apos "O que fazemos" e antes de "Performance". Ordem: O que fazemos → Categorias Auditaveis → Performance
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-008: CTAs na landing page
- **Commit**: `565e3aa` + `8708766`
- **Descricao**: Adicionados botoes "Ver como funciona" (scroll para metodologia) e "Solicitar diagnostico" (scroll para CTA final). Movidos para dentro do card "O que fazemos", abaixo da descricao. H1 removido.
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-009: Titulo "Categorias Auditaveis"
- **Commit**: `287d5fe`
- **Descricao**: Secao renomeada de "Auditoria Forense e Independente em:" para "Categorias Auditaveis". Texto explicativo removido.
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-010: Ajuste tipografico minimalista
- **Commit**: `656c6e7`
- **Descricao**: Reducao proporcional de toda a tipografia da landing page para harmonizar com o header/topbar:
  - Titulos de secao: text-lg → text-sm
  - Icones de secao: w-5 h-5 → w-4 h-4
  - Textos descritivos: text-sm → text-xs
  - Numeros de performance: text-3xl → text-xl
  - Icones de performance: w-12/w-6 → w-9/w-4
  - Cards de produto: icones e padding reduzidos
  - CTAs: size="sm" + text-xs
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-011: CTA final encurtado e generico
- **Commit**: `1b7d1a1`
- **Descricao**: Titulo: "Quer ver o AuraAudit no seu cenario?" / Texto: "Envie uma amostra de dados e receba um diagnostico com divergencias, oportunidades e evidencias rastreaveis."
- **Arquivo**: `client/src/pages/home.tsx`

#### ALT-012: Tabela de propostas/contratos
- **Commit**: `91dee6e`
- **Descricao**: Criada tabela `proposals` no banco de dados e camada de storage para gestao de propostas comerciais e contratos (sob medida e adesao online). Campos: clientId, clientName, clientCnpj, clientEmail, type, status, services (JSONB), totalValue, paymentTerms, validUntil, scope, notes, contractUrl, signedAt, signedBy, createdBy
- **Arquivos**: `shared/schema.ts`, `server/storage.ts`

### A.3 Evidencias

| # | Evidencia | Commit | Verificacao |
|---|-----------|--------|-------------|
| E-001 | Landing page sem segundo logotipo | 6fe7b39 | Inspecao visual da pagina `/` |
| E-002 | Texto "O que fazemos" atualizado | 6fe7b39 | Conteudo do card na pagina `/` |
| E-003 | Card "+448 MI Economizados" | 595be63 | Secao Performance na pagina `/` |
| E-004 | Textos genericos (sem ref. viagens) | adce6bd | Secoes Para Empresas, Servicos, Antifraude |
| E-005 | 15 segmentos em vez de empresas | 72c10ce | Secao Principais Cases |
| E-006 | 8 cards de Categorias Auditaveis | b51972a | Secao apos "O que fazemos" |
| E-007 | CTAs funcionais com scroll suave | 8708766 | Botoes dentro do card "O que fazemos" |
| E-008 | Tipografia minimalista harmonizada | 656c6e7 | Toda a landing page |
| E-009 | CTA generico e curto | 1b7d1a1 | Final da landing page |
| E-010 | Tabela proposals criada no BD | 91dee6e | `SELECT * FROM proposals` no PostgreSQL |
| E-011 | Sistema antiregressao ativo | Todos | Checkpoints Git, SHA-256, Zod, audit_trail |

### A.4 Status do Sistema Antiregressao

| Controle | Status | Verificacao |
|----------|--------|-------------|
| Checkpoints Git automaticos | ATIVO | 12 commits nesta sessao |
| Hashes SHA-256 deterministicos | ATIVO | audit_trail com integrityHash |
| Validacao Zod em endpoints | ATIVO | Todos os POST/PATCH validados |
| Trilha de auditoria imutavel | ATIVO | Tabela audit_trail operacional |
| Lei 13.964/2019 referenciada | ATIVO | Footer e sidebar da plataforma |
| Dados seed realistas | ATIVO | Cenarios corporativos brasileiros |
| AI contextualizada (antialucinacao) | ATIVO | System prompt especializado T&E |

### A.5 Assinaturas

| Funcao | Nome | Data |
|--------|------|------|
| Desenvolvedor | AuraAUDIT Dev Team | 25/02/2026 |
| Solicitante | _________________ | ___/___/2026 |

---

*Documento gerado automaticamente pela plataforma AuraAUDIT.*
*Cadeia de Custodia Digital — Lei 13.964/2019*
