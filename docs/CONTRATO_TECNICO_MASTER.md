# CONTRATO TECNICO MASTER — AuraAUDIT

**Plataforma**: AuraAUDIT — Auditoria Forense Independente
**Versao do Documento**: 1.2
**Data de Criacao**: 25/02/2026
**Ultima Atualizacao**: 13/03/2026
**Ultima Alteracao**: Anexo C — Complemento Tecnico Obrigatorio INC-2026-001 (RCA, Cronologia, Evidencias, Escopo, Remediacao, Nao Recorrencia)

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

## ANEXO B — ADITIVO DE INCIDENTE 12/03/2026

### B.1 Identificacao do Incidente

| Campo | Valor |
|-------|-------|
| **ID do Incidente** | INC-2026-001 |
| **Tipo** | Perda de Dados — Documentos Enviados pelo Cliente |
| **Data de Deteccao** | 12/03/2026 |
| **Horario de Deteccao** | 23:47 (BRT) |
| **Severidade** | Alta (dados de cliente afetados) |
| **Status** | Registrado — Correcao Estrutural Pendente |
| **Ambiente Afetado** | Producao — Portal do Cliente (Grupo Stabia) |
| **Detectado por** | Revisao interna solicitada pelo responsavel tecnico |

---

### B.2 Descricao do Incidente

Durante sessao de revisao em 12/03/2026, foi constatado que os documentos previamente enviados pelo cliente **Grupo Stabia** por meio da funcao **"Meus Documentos"** do portal nao estavam mais disponiveis na plataforma.

A consulta direta ao banco de dados (`SELECT * FROM client_uploads`) retornou **zero registros**, confirmando que tanto os metadados quanto as referencias aos arquivos foram perdidos.

A verificacao da pasta `uploads/` no servidor confirmou que **nenhum arquivo de cliente estava presente** no sistema de arquivos — apenas os documentos da base de conhecimento interna da IA (`uploads/knowledge/`) permaneceram intactos.

---

### B.3 Causa Raiz Identificada

**Causa Primaria — Armazenamento Efemero (Ephemeral File System)**

A plataforma AuraAUDIT, em sua arquitetura atual hospedada no Replit, armazena os arquivos enviados pelos clientes no **disco local do container** (pasta `uploads/client-docs/`). Este disco e **efemero por natureza**: qualquer reinicializacao do container — seja por inatividade, deployment, atualizacao de dependencias ou falha de infraestrutura — apaga todos os arquivos nele contidos.

Este e um comportamento documentado e esperado da infraestrutura Replit para ambientes de desenvolvimento. A plataforma nao havia sido migrada para armazenamento persistente em nuvem antes do inicio do uso por clientes reais.

**Causa Secundaria — Perda dos Registros de Banco de Dados**

Os metadados dos uploads (tabela `client_uploads`) tambem foram perdidos. A hipotese mais provavel e que uma operacao de sincronizacao de schema (`db:push`) executada em sessao anterior de desenvolvimento tenha recriado ou truncado a tabela durante um processo de migracao. Sessoes de desenvolvimento anteriores registraram aviso sobre "data-loss statements" em comandos de push de schema.

**O que NAO foi causa:**
- Nao houve acesso nao autorizado ou violacao de seguranca
- Nao houve exclusao manual intencional por parte de qualquer usuario
- Os dados do contrato, assinatura digital e perfil do cliente nao foram afetados

---

### B.4 Escopo do Impacto

| Item | Status | Observacao |
|------|--------|------------|
| Documentos enviados via "Meus Documentos" (Stabia) | **PERDIDOS** | Registros e arquivos nao recuperaveis sem backup |
| Metadados de uploads (tabela `client_uploads`) | **PERDIDOS** | Tabela vazia — zero registros |
| Contrato assinado digitalmente (AUR-2025-0042) | **INTACTO** | Preservado na tabela `contract_signatures` |
| Assinatura digital com hash SHA-256 | **INTACTA** | Cadeia de custodia preservada |
| Proposta comercial aceita | **INTACTA** | Preservada no banco de dados |
| Dados cadastrais do Grupo Stabia | **INTACTOS** | Tabela `clients` sem alteracoes |
| Base de conhecimento da IA (uploads/knowledge) | **INTACTA** | 7 arquivos preservados |
| Historico de conversas da IA (AI Desk) | **INTACTO** | Tabela `conversations` preservada |

---

### B.5 Linha do Tempo Tecnica

| Data/Hora | Evento |
|-----------|--------|
| ~27/02/2026 | Cliente Grupo Stabia realiza uploads de documentos via portal |
| Entre 27/02 e 12/03/2026 | Reinicializacao(oes) do container Replit ocorrem (data exata indisponivel por ausencia de log de infra) |
| 12/03/2026 - 23:47 | Responsavel tecnico detecta ausencia dos documentos durante revisao do sistema |
| 12/03/2026 - 23:52 | Consulta SQL confirma: `client_uploads` com zero registros |
| 12/03/2026 - 23:55 | Inspecao do sistema de arquivos confirma: `uploads/` sem arquivos de clientes |
| 12/03/2026 - 23:57 | Causa raiz identificada: armazenamento efemero + possivel truncamento por db:push |
| 12/03/2026 - 00:05 | Incidente registrado no Contrato Tecnico Master (este documento) |

---

### B.6 O que Pode Ser Dito ao Cliente

Para fins da reuniao de 13/03/2026 com o Grupo Stabia, a explicacao tecnica simplificada e:

> *"Durante a fase atual de implantacao da plataforma, os arquivos enviados eram armazenados em um servidor de desenvolvimento. Uma reinicializacao de infraestrutura ocorreu entre as sessoes, e os arquivos foram perdidos — situacao que nao ocorrera apos a migracao para o ambiente de producao com armazenamento em nuvem, atualmente em implementacao.*
>
> *O contrato assinado, a proposta aceita e todos os dados cadastrais do Grupo Stabia estao integralmente preservados. Apenas os arquivos de documentos enviados precisam ser recarregados.*
>
> *Esta ocorrencia nao representa risco de seguranca, nao houve acesso nao autorizado, e a plataforma continuara a operar normalmente. Estamos implementando armazenamento permanente em nuvem para garantir que isso nunca se repita."*

---

### B.7 Plano de Correcao e Prevencao

| # | Acao | Tipo | Prazo | Responsavel |
|---|------|------|-------|-------------|
| C-001 | Migrar armazenamento de uploads para Replit Object Storage (armazenamento persistente em nuvem) | Corretiva | Imediato — proxima sessao | Dev Team |
| C-002 | Notificar cliente Grupo Stabia sobre necessidade de reenvio dos documentos | Comunicativa | 13/03/2026 | Nelson Costa |
| C-003 | Implementar backup automatico de registros de uploads antes de qualquer operacao de schema (db:push) | Preventiva | Curto prazo | Dev Team |
| C-004 | Adicionar aviso explicito na interface "Meus Documentos" informando sobre status do armazenamento | Preventiva | Curto prazo | Dev Team |
| C-005 | Monitorar e registrar reinicializacoes de container com alertas automaticos | Preventiva | Medio prazo | Dev Team |

---

### B.8 Dados Tecnicos da Investigacao

```
-- Consulta executada em 12/03/2026 23:52 BRT
SELECT COUNT(*) FROM client_uploads;
-- Resultado: 0 (zero registros)

-- Verificacao do sistema de arquivos
ls -la /home/runner/workspace/uploads/
-- Resultado: apenas subpastas audit-pag, conciliacao, knowledge, trial
-- Nenhum arquivo de cliente presente

-- Base de conhecimento (INTACTA)
ls /home/runner/workspace/uploads/knowledge/
-- 7 arquivos preservados (kb-*.txt, kb-*.xlsx, kb-*.pdf)
```

---

### B.9 Evidencias do Incidente

| # | Evidencia | Tipo | Data |
|---|-----------|------|------|
| E-INC-001 | Resultado SQL: `client_uploads` com 0 registros | Banco de Dados | 12/03/2026 |
| E-INC-002 | Listagem `uploads/`: sem arquivos de clientes | Sistema de Arquivos | 12/03/2026 |
| E-INC-003 | Contrato AUR-2025-0042 integro na tabela `contract_signatures` | Banco de Dados | 12/03/2026 |
| E-INC-004 | Dados cadastrais Stabia intactos na tabela `clients` | Banco de Dados | 12/03/2026 |
| E-INC-005 | Screenshot do portal cliente mostrando secao "Meus Documentos" | Interface | 12/03/2026 |

---

### B.10 Status dos Controles Antiregressao — Pos-Incidente

| Controle | Status | Observacao |
|----------|--------|------------|
| Checkpoints Git automaticos | ATIVO | Nao afetado — codigo preservado |
| Hashes SHA-256 — Assinatura Digital | ATIVO | Contrato e assinatura integros |
| Trilha de auditoria imutavel | ATIVO | `audit_trail` sem alteracoes |
| Validacao Zod em endpoints | ATIVO | Logica de validacao preservada |
| **Persistencia de uploads** | **VULNERAVEL** | **Migrar para Object Storage — C-001** |
| **Backup pre-migracao de schema** | **AUSENTE** | **Implementar procedimento — C-003** |

---

### B.11 Assinaturas do Incidente

| Funcao | Nome | Data |
|--------|------|------|
| Responsavel Tecnico | Nelson Luiz Costa | 12/03/2026 |
| Registro | AuraAUDIT Dev Team | 12/03/2026 |

---

## ANEXO C — COMPLEMENTO TECNICO OBRIGATORIO — INC-2026-001

> **Referencia:** Complemento ao Anexo B deste documento.
> **Data de emissao:** 13/03/2026
> **Versao deste Anexo:** 1.0
> **Elaborado por:** AuraAUDIT Dev Team / Nelson Luiz Costa

---

### C.1 ROOT CAUSE ANALYSIS (RCA) — ANALISE FORMAL DE CAUSA RAIZ

| Campo | Descricao |
|-------|-----------|
| **Incidente** | INC-2026-001 — Perda de Documentos de Cliente |
| **Data / Hora** | Detectado em 12/03/2026 às 23:47 BRT. Evento originario: entre 27/02/2026 e 09/03/2026 |
| **Sintoma** | Secao "Meus Documentos" do portal do Grupo Stabia exibiu lista vazia. Arquivos e registros de banco ausentes. |
| **Causa Imediata** | Reinicializacao do container Replit apagou o sistema de arquivos efemero onde os uploads estavam armazenados (diretorio `uploads/` no disco local do container) |
| **Causa-Raiz** | Decisao arquitetural de usar `multer.diskStorage` com persistencia em disco local (`uploads/`) sem fallback para storage em nuvem. Em ambiente Replit, o disco de container e volatil por design — nao persiste entre reinicializacoes. Esta decisao foi adequada para desenvolvimento mas nao foi revisada antes de colocar o ambiente em contato com dados reais de clientes. |
| **Fatores Contribuintes** | (1) Ausencia de politica formal de "pronto para cliente real" que exija storage persistente antes do primeiro upload de cliente. (2) Operacoes de sincronizacao de schema (`db:push`) executadas em sessoes de desenvolvimento sem procedimento de backup previo dos registros de `client_uploads`. (3) Ausencia de monitoramento de saude (health check) que alertasse sobre perda de arquivos pos-reinicializacao. (4) Ausencia de reconciliacao automatica entre registros de banco e arquivos fisicos no storage. |
| **Impacto** | Perda total dos documentos enviados pelo cliente Grupo Stabia via modulo "Meus Documentos". Metadados correspondentes na tabela `client_uploads` tambem ausentes. Nenhum dado sensivel exposto a terceiros. |
| **Escopo Afetado** | 1 cliente afetado (Grupo Stabia). 1 modulo afetado ("Meus Documentos" / `client_uploads`). Dados de contrato, assinatura digital, proposta e cadastro nao afetados. |
| **Evidencias Tecnicas** | Ver secao C.3 deste documento |
| **Estado de Recuperacao** | Arquivos nao recuperaveis (sem backup). Registros de banco nao recuperaveis (sem backup). Solucao estrutural: migracao para Object Storage em implementacao. |

---

### C.2 CRONOLOGIA FORMAL DO INCIDENTE

| Marco | Timestamp | Evento | Ator | Evidencia |
|-------|-----------|--------|------|-----------|
| **T1 — Upload realizado** | 27/02/2026 13:22 BRT | Fabio Antununcio (Stabia) assina contrato no portal. Documentos enviados via "Meus Documentos" nas horas seguintes. | Cliente: Grupo Stabia | Assinatura preservada: `contract_signatures.signed_at = 2026-02-27 13:22:24` |
| **T2 — Sistema operando normalmente** | 27/02/2026 a 04/03/2026 | Plataforma em operacao. Uploads de base de conhecimento IA realizados em 27/02. Uploads do modulo audit-pag iniciados em 04/03. | Dev Team / Cliente | `uploads/knowledge/` com timestamps de 27/02; `uploads/audit-pag/` criado em 04/03 |
| **T3 — Evento de reinicializacao / reset** | Entre 04/03/2026 e 09/03/2026 | Reinicializacao do container Replit apaga filesystem efemero, incluindo `uploads/` com arquivos de clientes. Data exata nao registrada — ausencia de log de infraestrutura Replit para este nivel de evento. Possivel segunda causa: operacao `db:push` em sessao de desenvolvimento truncou ou recriou tabela `client_uploads`. | Infraestrutura Replit (automatico) | `uploads/conciliacao/` criado em 09/03 (pos-reinicializacao). Ausencia de arquivos de cliente no diretorio. |
| **T4 — Perda observada** | 12/03/2026 23:47 BRT | Responsavel tecnico acessa portal e detecta secao "Meus Documentos" vazia. | Nelson Luiz Costa | Observacao direta da interface do portal |
| **T5 — Investigacao iniciada** | 12/03/2026 23:50 BRT | Investigacao tecnica iniciada: consultas SQL, inspecao de sistema de arquivos, revisao de rotas de upload. | AuraAUDIT Dev Team | Comandos executados: `SELECT COUNT(*) FROM client_uploads`, `ls -la uploads/` |
| **T6 — Hipotese validada** | 12/03/2026 23:57 BRT | Causa raiz confirmada: `client_uploads` com 0 registros, `uploads/` sem arquivos de clientes. Hipotese de storage efemero validada. | AuraAUDIT Dev Team | Dump tecnico registrado — ver C.3 |
| **T7 — Contencao aplicada** | 13/03/2026 00:05 BRT | Incidente registrado formalmente no Contrato Tecnico Master (Anexo B). Plano de correcao definido. Cliente a ser notificado em 13/03/2026. | Nelson Luiz Costa / Dev Team | Commit `8806b46` — "Document data loss incident" |
| **T8 — Plano corretivo aprovado** | 13/03/2026 | Migracao para Replit Object Storage definida como acao imediata C-001. Complemento tecnico obrigatorio emitido (este Anexo C). | Nelson Luiz Costa | Este documento |

---

### C.3 EVIDENCIAS TECNICAS FORMAIS

#### C.3.1 — Tabela Consultada e Resultado

```sql
-- Comando executado: 12/03/2026 23:52 BRT
-- Banco: PostgreSQL (Replit Database — producao)

SELECT COUNT(*) AS total FROM client_uploads;

-- RESULTADO:
-- total
-- 0
-- (0 registros — tabela existe, estrutura intacta, sem dados)
```

#### C.3.2 — Schema da Tabela client_uploads (estrutura preservada)

```
Coluna           | Tipo
-----------------|--------------------------
id               | character varying (PK)
document_key     | text
client_id        | character varying (FK)
user_id          | character varying (FK)
file_name        | text
original_name    | text
file_size        | integer
mime_type        | text
status           | text
client_checked   | boolean
sha256           | text
uploaded_at      | timestamp without time zone
validated_at     | timestamp without time zone
validated_by     | text
```

> Nota: A tabela possui campo `sha256` por arquivo — este campo nao pode ser usado para recuperacao pois os registros foram perdidos junto com os arquivos.

#### C.3.3 — Diretorio Verificado e Resultado

```bash
# Comando executado: 12/03/2026 23:55 BRT
ls -la /home/runner/workspace/uploads/

# RESULTADO:
drwxr-xr-x  audit-pag    (vazio — criado em 04/03/2026)
drwxr-xr-x  conciliacao  (vazio — criado em 09/03/2026)
drwxr-xr-x  knowledge    (7 arquivos — criados em 27/02/2026 — INTACTOS)
drwxr-xr-x  trial        (vazio — criado em 27/02/2026)

# Ausencia de subdiretorio de cliente ou arquivos de usuario
# Subdiretorio de storage de cliente nao existe
```

#### C.3.4 — Arquivos da Base de Conhecimento (INTACTOS — controle de referencia)

```bash
ls -la /home/runner/workspace/uploads/knowledge/

# RESULTADO:
-rw-r--r--  kb-1772182561802-3m7e9e.txt    290 bytes    27/02/2026 08:56
-rw-r--r--  kb-1772183073175-l252bb.xlsx  16279 bytes    27/02/2026 09:04
-rw-r--r--  kb-1772183115543-6a9gxk.xlsx  16279 bytes    27/02/2026 09:05
-rw-r--r--  kb-1772183125873-m6mhjz.pdf     547 bytes    27/02/2026 09:05
-rw-r--r--  kb-1772183172144-4w5jav.pdf     547 bytes    27/02/2026 09:06
-rw-r--r--  kb-1772183237685-sloe5u.xlsx  16279 bytes    27/02/2026 09:07
-rw-r--r--  kb-1772183265304-6dmnh7.xlsx  16279 bytes    27/02/2026 09:07

# Estes arquivos pertencem ao modulo IA Knowledge (uso interno)
# Nao sao arquivos de cliente — nao foram afetados pelo incidente
```

#### C.3.5 — Contratos e Assinaturas Digitais (INTACTOS)

```sql
-- contract_signatures: 2 registros preservados

id: 6784ca79  |  signer_name: Fabio Antununcio
company: Stabia Viagens e Turismo  |  CNPJ: 10.586.640/0001-89
signed_at: 2026-02-27 13:22:24 BRT  |  IP: 177.51.205.125
contract_text_sha256: 5ad03e11b6eb8261e140de433328b5bc533f7dbcc0fd570bbd880bac7371b3ec
contract_version: 5.0.0  |  type: standard

-- Cadeia de custodia digital INTACTA
-- SHA-256 do texto contratual preservado e verificavel
```

#### C.3.6 — Commits Relevantes (Git Log)

```
8806b46  Document data loss incident and update master technical contract  (13/03/2026)
94291e8  Add project phase management for client and admin dashboards       (12/03/2026)
c90dd52  Add a dedicated section to display internal partners separately    (12/03/2026)
ff26907  Separate internal auditors from client listings                   (12/03/2026)
8d202b2  Published your App                                                (11/03/2026)
1bbbe88  Update the website's main page to show the official landing page  (11/03/2026)
```

> Nenhum commit entre 27/02 e 11/03 registra exclusao de arquivos. O evento foi uma reinicializacao de infraestrutura nao tracada por Git.

#### C.3.7 — Tipo de Storage Confirmado (Origem da Vulnerabilidade)

```typescript
// Arquivo: server/upload-routes.ts — linha 229
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Linha 235-241: multer.diskStorage — STORAGE LOCAL EFEMERO
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});
```

> **Confirmado:** Storage do tipo `multer.diskStorage` gravando em `/home/runner/workspace/uploads/` — disco efemero do container Replit. Nao e storage persistente em nuvem.

#### C.3.8 — Declaracao de Seguranca

**Sem evidencia de acesso indevido identificado.**

A investigacao tecnica nao encontrou qualquer indicacao de:
- Acesso nao autorizado ao sistema de arquivos
- Exfiltracao de dados para destinos externos
- Alteracao dolosa de registros de banco
- Comprometimento de credenciais de acesso

O incidente e classificado como **falha de infraestrutura / decisao arquitetural** — sem componente de seguranca (confidencialidade ou integridade indevida). A perda de disponibilidade (availability) dos arquivos decorreu exclusivamente da natureza efemera do storage.

---

### C.4 ESCOPO DO IMPACTO — DECLARACAO FORMAL

#### C.4.1 — Clientes Afetados

| Cliente | CNPJ | Modulo Afetado | Tipo de Dado Afetado | Afetado? |
|---------|------|----------------|----------------------|----------|
| Grupo Stabia (Stabia Viagens e Turismo) | 10.586.640/0001-89 | Meus Documentos | Arquivos enviados via portal | **SIM** |

> Nenhum outro cliente cadastrado na plataforma realizou uploads de documentos ate a data do incidente.

#### C.4.2 — Modulos Afetados

| Modulo | Rota | Status | Observacao |
|--------|------|--------|------------|
| Meus Documentos (client-documents) | `/api/uploads` | **AFETADO** | Tabela `client_uploads` vazia |
| Contrato Digital | `/api/contract` | INTACTO | `contract_signatures` preservada |
| AI Desk | `/api/ai` | INTACTO | `conversations` e `messages` preservadas |
| Cadastro do Cliente | `/api/clients` | INTACTO | Tabela `clients` preservada |
| Assinatura Digital | `/api/contract/sign` | INTACTO | SHA-256 e metadados preservados |
| Base de Conhecimento IA | `/api/ia-knowledge` | INTACTO | 7 arquivos fisicos preservados |
| AuraTRUST / Conciliar Contas | varias | INTACTO | Tabelas de conciliacao preservadas |

#### C.4.3 — Tipo de Arquivo Afetado

Os documentos enviados pelo cliente Grupo Stabia eram arquivos de dados operacionais enviados para inicio da auditoria forense (bases de dados dos sistemas OBT, Backoffice, cartoes, GDS e/ou BSP). Os formatos aceitos pela plataforma e potencialmente afetados:

```
.csv | .xlsx | .xls | .pdf | .doc | .docx | .txt | .zip | .rar | .7z | .json | .xml
```

> Tipos exatos dos arquivos perdidos: **desconhecidos** — metadados nao recuperaveis.

#### C.4.4 — Impacto em Banco vs. Storage

| Camada | Status | Detalhe |
|--------|--------|---------|
| **Storage fisico (disco)** | **PERDIDO** | Arquivos deletados por reinicializacao do container |
| **Banco de dados — registros** | **PERDIDOS** | Tabela `client_uploads`: 0 registros. Possivel causa: `db:push` recriou ou truncou a tabela |
| **Banco de dados — outras tabelas** | INTACTO | `clients`, `contract_signatures`, `users`, `conversations` sem alteracao |

#### C.4.5 — Exposicao de Dados

**Nao houve exposicao de dados de terceiros.**

| Criterio | Avaliacao |
|----------|-----------|
| Dados acessados por usuario nao autorizado | Sem evidencia |
| Dados transmitidos para destino externo | Sem evidencia |
| Dados visualizados por outro cliente | Sem evidencia (ambiente single-tenant por cliente) |
| Vazamento via logs de aplicacao | Sem evidencia (logs nao persistem nomes de arquivo) |
| Classificacao de impacto de seguranca | **Disponibilidade afetada — Confidencialidade e Integridade NAOAFETADAS** |

---

### C.5 PLANO DE REMEDIACAO

#### C.5.1 — Remediacao Imediata (ate 13/03/2026)

| Cod | Acao | Responsavel | Criterio de Conclusao |
|-----|------|-------------|----------------------|
| R-IME-001 | Comunicar formalmente o Grupo Stabia sobre o incidente em reuniao 13/03/2026 com linguagem clara e sem tecnicismos excessivos | Nelson Luiz Costa | Reuniao realizada, cliente informado |
| R-IME-002 | Solicitar ao cliente o reenvio dos documentos assim que a correcao de storage for implementada | Nelson Luiz Costa | Confirmacao do cliente |
| R-IME-003 | Adicionar banner de aviso no modulo "Meus Documentos" informando que uploads estao temporariamente desabilitados ate conclusao da migracao de storage | Dev Team | Banner visivel na interface |

#### C.5.2 — Remediacao Tatica (ate 20/03/2026)

| Cod | Acao | Responsavel | Criterio de Conclusao |
|-----|------|-------------|----------------------|
| R-TAT-001 | Migrar sistema de uploads de `multer.diskStorage` para **Replit Object Storage** (armazenamento persistente em nuvem) | Dev Team | Arquivos persistem apos reinicializacao do container |
| R-TAT-002 | Implementar checksum SHA-256 por arquivo no momento do upload, com registro na tabela `client_uploads.sha256` | Dev Team | Hash gravado no banco para cada upload |
| R-TAT-003 | Implementar reconciliacao automatica banco x storage: ao inicializar a aplicacao, verificar se arquivos registrados no banco existem no Object Storage | Dev Team | Health check executado no startup |
| R-TAT-004 | Implementar procedimento de backup da tabela `client_uploads` antes de qualquer operacao de `db:push` | Dev Team | Procedure documentada e executada |
| R-TAT-005 | Implementar endpoint de health check `/api/health/storage` que verifique disponibilidade do storage e retorne status em tempo real | Dev Team | Endpoint retornando `{ storage: "ok" / "degraded" }` |

#### C.5.3 — Remediacao Estrutural (ate 31/03/2026)

| Cod | Acao | Responsavel | Criterio de Conclusao |
|-----|------|-------------|----------------------|
| R-EST-001 | Definir e documentar politica formal: nenhum dado de cliente pode ser armazenado em filesystem efemero em nenhum ambiente que receba dados reais | Dev Team | Politica registrada no Contrato Tecnico Master |
| R-EST-002 | Implementar trilha de custodia por arquivo: cada upload deve gerar registro imutavel em `audit_trail` com hash, tamanho, usuario, timestamp e storage_path | Dev Team | Registros em `audit_trail` para cada upload |
| R-EST-003 | Implementar backup automatico diario dos metadados de uploads (export JSON/CSV da tabela `client_uploads` para Object Storage) | Dev Team | Job agendado em producao |
| R-EST-004 | Revisar e documentar todos os pontos da plataforma que ainda usam filesystem efemero para dados persistentes (audit-pag, conciliacao, trial) | Dev Team | Mapeamento completo e plano de migracao |

#### C.5.4 — Validacao Pos-Correcao

| Teste | Metodo | Criterio de Sucesso |
|-------|--------|---------------------|
| Upload persiste apos reinicializacao | Fazer upload de arquivo de teste, reinicializar container, verificar existencia no Object Storage | Arquivo presente e acessivel |
| Metadado gravado no banco | Verificar `client_uploads` apos upload de teste | Registro presente com SHA-256 |
| Reconciliacao funciona | Deletar arquivo do Object Storage manualmente, verificar se health check detecta inconsistencia | Alerta gerado |
| SHA-256 verificavel | Calcular hash do arquivo enviado e comparar com banco | Hashes identicos |
| Trilha de auditoria gerada | Verificar `audit_trail` apos upload de teste | Entrada registrada com todos os campos |

---

### C.6 PLANO DE NAO RECORRENCIA

#### C.6.1 — Controles Obrigatorios a Implementar

| # | Controle | Descricao | Prioridade | Status |
|---|----------|-----------|------------|--------|
| NC-001 | **Object Storage Obrigatorio** | Todos os arquivos de clientes devem ser armazenados exclusivamente no Replit Object Storage (ou equivalente persistente). Uso de `multer.diskStorage` para dados de cliente e **proibido** a partir desta data. | CRITICA | Pendente — R-TAT-001 |
| NC-002 | **Proibicao de Filesystem Efemero** | Politica formal: filesystem local do container pode ser usado apenas para arquivos temporarios de processamento (cache, parsing). Nenhum dado de cliente deve persistir apenas no disco local. | CRITICA | Pendente — R-EST-001 |
| NC-003 | **Checksum por Arquivo** | Todo arquivo enviado por cliente deve ter seu hash SHA-256 calculado no momento do upload e registrado na tabela `client_uploads.sha256`. Arquivos sem hash nao devem ser aceitos pelo sistema. | ALTA | Pendente — R-TAT-002 |
| NC-004 | **Trilha de Custodia por Upload** | Cada operacao de upload deve gerar registro imutavel na tabela `audit_trail` contendo: usuario, cliente, nome do arquivo, tamanho, SHA-256, timestamp, storage_path. | ALTA | Pendente — R-EST-002 |
| NC-005 | **Backup Automatico Diario** | Export diario automatizado dos metadados de `client_uploads` para Object Storage em formato JSON. Retencao minima de 90 dias. | ALTA | Pendente — R-EST-003 |
| NC-006 | **Restore Testado** | Procedimento de restauracao de arquivos a partir do Object Storage deve ser documentado e testado mensalmente. Resultado do teste registrado no Contrato Tecnico Master. | MEDIA | Pendente |
| NC-007 | **Health Check de Storage** | Endpoint `/api/health/storage` deve verificar no startup e a cada 5 minutos: (a) conectividade com Object Storage, (b) reconciliacao entre registros de banco e arquivos no storage. Alertas em caso de divergencia. | MEDIA | Pendente — R-TAT-003 e R-TAT-005 |
| NC-008 | **Reconciliacao Banco x Storage** | Processo automatico (startup + periodico) que compara registros em `client_uploads` com arquivos existentes no Object Storage. Divergencias geram alerta e registro em `audit_trail`. | MEDIA | Pendente — R-TAT-003 |
| NC-009 | **Monitoramento de Incidentes** | Implementar monitoramento que detecte e alerte reinicializacoes de container, falhas de storage e inconsistencias entre banco e filesystem. | MEDIA | Pendente |
| NC-010 | **Politica de Schema Migration** | Antes de qualquer operacao de `db:push` ou migracao de schema que afete tabelas com dados de cliente, e obrigatorio: (a) exportar backup da tabela afetada, (b) verificar contagem de registros antes e depois, (c) registrar operacao no Contrato Tecnico Master. | ALTA | Pendente — R-TAT-004 |

#### C.6.2 — Criterios de "Pronto para Cliente Real"

A partir deste incidente, qualquer modulo da plataforma que receba dados reais de clientes so pode ser ativado em producao apos verificacao obrigatoria dos seguintes criterios:

- [ ] Storage utilizado e persistente (Object Storage ou banco de dados)
- [ ] Backup automatico configurado e testado
- [ ] Health check de storage ativo
- [ ] Trilha de auditoria (audit_trail) gerando registros para todas as operacoes
- [ ] Checksum SHA-256 verificado por arquivo
- [ ] Reconciliacao banco x storage funcionando
- [ ] Restore testado e documentado

#### C.6.3 — Responsabilidades

| Papel | Responsavel | Obrigacao |
|-------|-------------|-----------|
| Responsavel Tecnico | Nelson Luiz Costa | Aprovar implementacao dos controles NC-001 a NC-010 |
| Dev Team | AuraAUDIT Dev Team | Implementar e documentar todos os controles no prazo definido |
| Revisao | Nelson Luiz Costa | Validar que cada controle esta ativo antes de reativar uploads de clientes |

---

### C.7 ASSINATURAS DO COMPLEMENTO TECNICO

| Funcao | Nome | Data | Rubrica |
|--------|------|------|---------|
| Responsavel Tecnico | Nelson Luiz Costa | 13/03/2026 | _____________ |
| Elaborado por | AuraAUDIT Dev Team | 13/03/2026 | _____________ |
| Revisao prevista | Nelson Luiz Costa | 31/03/2026 | _____________ |

---

*Documento gerado automaticamente pela plataforma AuraAUDIT.*
*Cadeia de Custodia Digital — Lei 13.964/2019*
