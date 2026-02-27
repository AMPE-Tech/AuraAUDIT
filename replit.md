# Aura Audit - Auditoria Forense

## Overview
Aura Audit is a forensic audit platform for corporate travel and event expenses, built for Grupo Stabia's audit project covering 2024 (R$ 51.3M) and 2025 (R$ 39.6M). It follows the Digital Chain of Custody principles established by Brazilian Law 13.964/2019 (Pacote Anticrime).

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Recharts
- **Backend**: Express.js + Node.js
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express routes (backend)
- **State Management**: TanStack React Query

## Key Features
- Home page with 8 audit category cards (Viagens/Eventos, Despesas, Contratos, Agencias, Telecom, Frota, Beneficios, Suprimentos), performance metrics, cases, methodology stages
- Dashboard with KPI metrics, systems overview (OBT/Backoffice), financial volumes, 15-day chronogram, audit scope areas
- Client registration (travel agencies and corporate companies) with CNPJ, contacts, status management
- Data source integrations hub: Banco Bradesco EBTA, travel agencies, airlines, hotel chains, car rentals, insurers, GDS Sabre, GDS Amadeus, BSPlink
- Expense management (travel, hotels, events) with CRUD, filters, risk levels
- Data reconciliation across OBT (Reserve, Argo), Backoffice (Wintour, Stur), billing, and virtual credit cards
- Audit case management with methodology, scope, findings, recommendations
- Anomaly detection and resolution workflow
- Immutable audit trail with deterministic SHA-256 integrity hashes
- Structured audit reports matching proposal deliverables (executive report, technical report, risk mapping, action plan)

## Project Structure
```
client/src/
  pages/         - Home, Dashboard, Expenses, Reconciliation, AuditCases, Anomalies, AuditTrail, Reports, Clients, Integrations
  components/    - AppSidebar, ThemeProvider, ThemeToggle, UI components
  lib/           - formatters, queryClient, utils
shared/
  schema.ts      - Drizzle schema definitions and Zod validators
server/
  routes.ts      - API endpoints with Zod validation on all POST/PATCH routes
  storage.ts     - Database storage layer
  db.ts          - Database connection
  seed.ts        - Seed data with realistic Brazilian corporate expense scenarios
```

## Database Tables
- users, expenses, audit_cases, anomalies, audit_trail, clients, data_sources, conversations, messages
- wallets, wallet_ledger, ai_services, ai_jobs, ai_job_quotes, ai_job_outputs, audit_envelopes
- client_uploads (document uploads with SHA-256, checklist, validation status)

## API Endpoints
- GET/POST /api/expenses, PATCH /api/expenses/:id
- GET/POST /api/audit-cases, PATCH /api/audit-cases/:id
- GET/POST /api/anomalies, PATCH /api/anomalies/:id
- GET/POST /api/clients, GET /api/clients/:id, GET /api/clients/type/:type, PATCH /api/clients/:id
- GET/POST /api/data-sources, GET /api/data-sources/:id, GET /api/data-sources/client/:clientId, PATCH /api/data-sources/:id
- POST /api/trial/analyze (public, no auth — free trial diagnostic with file upload + AI analysis)
- GET /api/audit-trail
- GET/POST /api/uploads, PATCH /api/uploads/:id/check, DELETE /api/uploads/:id
- GET/POST /api/ai/conversations, GET/DELETE /api/ai/conversations/:id, POST /api/ai/conversations/:id/messages (SSE streaming)
- GET /api/wallet, POST /api/wallet/topup, GET /api/wallet/ledger, POST /api/wallet/credit
- GET /api/ai-desk/services, POST /api/ai-desk/jobs, GET /api/ai-desk/jobs, GET /api/ai-desk/jobs/:id
- POST /api/ai-desk/jobs/:id/quote, POST /api/ai-desk/jobs/:id/approve, POST /api/ai-desk/jobs/:id/run

## Data Source Integration Types
- **bradesco_ebta**: Banco Bradesco EBTA corporate credit card data
- **travel_agency**: Travel agency monthly management files (CVC, Flytour, BRT)
- **airline**: Airlines ticket data (LATAM, GOL, Azul)
- **hotel_chain**: Hotel chains reservations/billing (Accor, Atlantica)
- **car_rental**: Car rental companies (Localiza, Movida)
- **insurer**: Travel insurance providers (Porto Seguro)
- **gds_sabre**: GDS Sabre PNR/reservation data
- **gds_amadeus**: GDS Amadeus PNR/reservation data
- **bsplink**: IATA BSP billing and settlement data

## Audit Scope (Grupo Stabia)
- Systems: OBT (Reserve, Argo), Backoffice (Wintour 2024, Stur 2025)
- Analysis areas: Policy compliance, governance, data integrity, contract adherence, controls/approvals, operational failures, financial vulnerabilities, risk assessment, optimization opportunities
- Reconciliation: OBT vs Backoffice, credit cards vs reservations, BSP vs airlines, hotel vs invoices, fee/rebate divergences

## Routes (Public)
- `/` - Home publica (site institucional, servicos, diferenciais, LATAM, metodologia, pricing, CTA)
- `/login` - Tela de login (admin ou client)
- `/teste-agora` - Teste gratuito (upload ate 3 arquivos + IA gera relatorio basico com cadeia de custodia)

## Routes (Admin)
- `/dashboard` - Dashboard (project KPIs, online audit timeline, scope areas)
- `/expenses` - Expense management
- `/reconciliation` - Cross-system data reconciliation
- `/cases` - Audit case management
- `/anomalies` - Anomaly detection
- `/audit-trail` - Immutable audit trail
- `/reports` - Structured audit reports
- `/clients` - Client registration
- `/contracts` - Contract management (view all, check signatures, send via WhatsApp)
- `/integrations` - Data source integrations hub
- `/services` - Service catalog (P0-P3 priority levels)
- `/ai-desk` - AI Desk catalog (4 services, job creation/quote/approval/execution)
- `/wallet` - Wallet de Créditos (balance, top-up, ledger)
- `/admin` - Admin panel (stats, expense/client/integration management, activity log)

## Routes (Client Portal)
- `/dashboard` - Client project dashboard (volumes, metrics, charts, anomalies)
- `/systems` - Systems used in the project (OBT/Backoffice)
- `/expense-types` - Expense types offered vs contracted
- `/integrations` - Integrations offered vs used in project
- `/products` - Products & services catalog with contracted highlights
- `/contract` - Contract summary, scope, deliverables, SLA, terms
- `/ai-desk` - AI Desk catalog (same as admin)
- `/wallet` - Wallet de Créditos (same as admin)

## Authentication
- Admin: `nml.costa@gmail.com` / `aura2025!` — full platform access
- Client: `stabia` / `stabia2025!` — Grupo Stabia client portal
- Backend: express-session + bcrypt + connect-pg-simple
- Auth context: client/src/lib/auth.tsx
- Server auth: server/auth.ts (setupAuth, requireAuth, requireAdmin)

## Client Portal Sidebar Sections
- **Projeto**: Dashboard, Painel do Projeto, Sistemas, Meus Documentos
- **Auditoria**: Tipos de Despesas, Integracoes
- **Comercial**: Produtos & Servicos, Contrato, Ecossistema LATAM

## LATAM Ecosystem Categories (10 primary)
GDS (Amadeus, Sabre, Travelport), OBT (Reserve, Argo, Concur, Cytric, Navan, TravelPerk, Onfly, VOLL), TMC (CVC Corp, Flytour, BRT, Copastur, Rextur, Alatur JTB), Midoffice/Backoffice (Wintour, Stur, SAP S/4FI, Oracle EBS, TOTVS, Benner), Pagamentos (Bradesco EBTA, IVT, HCard, Conferma Pay, WEX, AirPlus), Cias Aereas (LATAM, GOL, Azul, AA, United, Copa), Hotelaria (Accor, Atlantica, Marriott, Hilton, IHG, Blue Tree), Car Rental (Localiza Hertz, Movida, Unidas, Avis, Budget, Enterprise), Seguros (Porto Seguro, Allianz, Assist Card, Travel Ace, GTA), MICE (MCI Group, GL Events, InEvent, Sympla, Cvent)

## Subscription System (AuraAudit Pass)
- **Plan**: AuraAudit Pass — single plan, self-service subscription
- **Pricing**: US$ 99/month fixed + progressive rate on VAM excess above US$ 10,000/month, CAP US$ 3,000/month
- **Rate tiers (continuous)**: VAM<=100k: 0.30%, <=300k: 0.28%, <=600k: 0.26%, <=800k: 0.24%, <=1M: 0.22%, >1M: 0.20%
- **Formula**: `min(3000, 99 + rateForVam(VAM) * max(0, VAM - 10000))`
- **Terms version**: 1.2.0
- **Checkout**: Stripe integration with terms acceptance (SHA-256 hash, IP, user-agent)
- **Tables**: `terms_acceptance`, `monthly_consumption`, `billing_runs` (+ stripe schema managed by stripe-replit-sync)
- **Routes**: `/subscription` (pricing + checkout), `/subscription/success`, `/subscription/cancel`
- **API**: `GET /api/stripe/pricing`, `GET /api/stripe/terms`, `POST /api/stripe/checkout`, `POST /api/stripe/simulate-vam`, `GET /api/stripe/billing`, `GET /api/stripe/terms-accepted`
- **Files**: `server/stripeClient.ts`, `server/webhookHandlers.ts`, `server/stripe-routes.ts`, `client/src/pages/subscription.tsx`, `client/src/pages/subscription-success.tsx`, `client/src/pages/subscription-cancel.tsx`

## Shared Utilities
- `shared/validators.ts` — CNPJ/CPF mathematical validation (checksum algorithm), document type detection, formatting

## CNPJ/CPF Validation
- **Mathematical validation**: Checksum algorithm validates digits before any API call
- **Receita Federal lookup**: `GET /api/cnpj/:cnpj` queries BrasilAPI for company data (name, address, phone, email, partners)
- **Document validation**: `GET /api/validate-document/:doc` validates CNPJ (14 digits) or CPF (11 digits) mathematically
- **Enforcement points**: Client creation (POST /api/clients), contract signing (POST /api/contract/sign), CNPJ lookup, profile updates
- **Frontend integration**: "Buscar" button on CNPJ fields in clients.tsx, company-profile.tsx, client-profile.tsx auto-fills all form fields from Receita Federal

## Recent Changes
- 2026-02-27: Added "Teste Agora" free trial page (/teste-agora): upload up to 3 files, describe intent, AI generates basic diagnostic report with full chain of custody (SHA-256 hashes, audit envelope), CTA for subscription
- 2026-02-26: Upgraded to Contrato Tecnico Master v2.1.0: added clause 22 (Canais de Assinatura e Distribuicao — offline/online/email/WhatsApp), evidences E9-E12, Anexo II (Aditivo de 26/02/2026), 22 clauses total
- 2026-02-26: Upgraded to Contrato Tecnico Master v2.0.0: full service catalog (P0-P3), digital modules (Pass/AI Desk/Wallet), anti-regression system, anti-hallucination system, evidence annex (E1-E8), 21 clauses
- 2026-02-26: Contract signing CPF of legal representative is optional; validated mathematically when provided, shown masked in signature proof
- 2026-02-26: Added CNPJ/CPF validation (mathematical + Receita Federal lookup), auto-fill on client/company registration, backend enforcement on all write endpoints
- 2026-02-26: Added company profiles (admin: /company-profile, client: /my-profile), dynamic contract text from DB, sidebar navigation updates
- 2026-02-25: Implemented Wallet de Créditos + AI Desk (4 services, job lifecycle: create→quote→approve→run), audit envelope with SHA-256, sidebar integration, landing page "Módulos & Add-ons" section
- 2026-02-25: Updated AuraAudit Pass pricing to progressive rate tiers (0.30%-0.20% by VAM), updated terms v1.1.0, added discrete CTAs throughout landing page, updated subscription page with tier table and examples
- 2026-02-25: Simplified LATAM ecosystem from 15 to 10 primary categories (GDS, OBT, TMC, Midoffice/Backoffice, Pagamentos, Cias Aereas, Hotelaria, Car Rental, Seguros, MICE)
- 2026-02-25: Implemented AuraAudit Pass subscription system with Stripe checkout, terms acceptance, VAM simulator, billing dashboard (CAP US$ 3,000)
- 2026-02-25: Added Servicos page with DPO-spec service catalog (P0-P3 priority levels, 10 services, recommended sales order)
- 2026-02-25: Moved AuraAI assistant to floating widget (bottom-right button) — available on every page for both admin and client, removed from sidebars
- 2026-02-25: Added AuraAI generative assistant (GPT-5.2) specialized in T&E audit, compliance, methodology
- 2026-02-25: Added BI dashboard hero banner on Home page with area/bar/pie/radar charts
- 2026-02-25: Added visual chain of custody section with UUID, SHA-256 hash, timestamp examples
- 2026-02-25: Restructured Home page per DPO spec: O que fazemos, Cadeia de Custodia, 5 corporate services, 4 TMC services, MICE audit, methodology, deliverables, pricing, FAQ, CTA
- 2026-02-25: Added Painel do Projeto page with rich dashboard panels (area chart, radar, bar, pie, progress bars, vendor grid)
- 2026-02-25: Added LATAM Scope page with 10 ecosystem categories, 80+ providers, expandable cards with audit items and evidence types
- 2026-02-25: Added Cobertura Nacional e LATAM section to Home page (6 countries, 10 categories grid)
- 2026-02-25: Built full client portal with sidebar, 6 pages (dashboard, systems, expense types, integrations, products, contract)
- 2026-02-25: Added authentication (login/logout/session) with role-based routing (admin vs client)
- 2026-02-25: Redesigned dashboard cronograma as online audit timeline (~45 min process)
- 2026-02-25: Restructured Home page: general audit intro at top, category-specific content on card click
- 2026-02-25: Added Home page with 8 audit categories, performance metrics (16%, R$2.8BI, R$448MI), cases, methodology stages
- 2026-02-25: Added client registration module (travel agencies + corporate companies)
- 2026-02-25: Added data source integrations hub (Bradesco EBTA, travel agencies, airlines, hotels, car rentals, insurers, GDS Sabre/Amadeus, BSPlink)
- 2026-02-25: All modules include AuraDue chain of custody (SHA-256 hashing, audit trail logging per Lei 13.964/2019)
- 2026-02-17: Added Reconciliation page for cross-system data analysis
- 2026-02-17: Updated Reports with full proposal deliverables structure
- 2026-02-17: Enforced Zod validation on all write endpoints
- 2026-02-17: Made integrity hashes deterministic using ISO timestamps
