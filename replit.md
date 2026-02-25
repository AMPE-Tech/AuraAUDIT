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

## API Endpoints
- GET/POST /api/expenses, PATCH /api/expenses/:id
- GET/POST /api/audit-cases, PATCH /api/audit-cases/:id
- GET/POST /api/anomalies, PATCH /api/anomalies/:id
- GET/POST /api/clients, GET /api/clients/:id, GET /api/clients/type/:type, PATCH /api/clients/:id
- GET/POST /api/data-sources, GET /api/data-sources/:id, GET /api/data-sources/client/:clientId, PATCH /api/data-sources/:id
- GET /api/audit-trail
- GET/POST /api/ai/conversations, GET/DELETE /api/ai/conversations/:id, POST /api/ai/conversations/:id/messages (SSE streaming)

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

## Routes (Admin)
- `/dashboard` - Dashboard (project KPIs, online audit timeline, scope areas)
- `/expenses` - Expense management
- `/reconciliation` - Cross-system data reconciliation
- `/cases` - Audit case management
- `/anomalies` - Anomaly detection
- `/audit-trail` - Immutable audit trail
- `/reports` - Structured audit reports
- `/clients` - Client registration
- `/integrations` - Data source integrations hub
- `/services` - Service catalog (P0-P3 priority levels)
- `/admin` - Admin panel (stats, expense/client/integration management, activity log)

## Routes (Client Portal)
- `/dashboard` - Client project dashboard (volumes, metrics, charts, anomalies)
- `/systems` - Systems used in the project (OBT/Backoffice)
- `/expense-types` - Expense types offered vs contracted
- `/integrations` - Integrations offered vs used in project
- `/products` - Products & services catalog with contracted highlights
- `/contract` - Contract summary, scope, deliverables, SLA, terms

## Authentication
- Admin: `nml.costa@gmail.com` / `aura2025!` — full platform access
- Client: `stabia` / `stabia2025!` — Grupo Stabia client portal
- Backend: express-session + bcrypt + connect-pg-simple
- Auth context: client/src/lib/auth.tsx
- Server auth: server/auth.ts (setupAuth, requireAuth, requireAdmin)

## Client Portal Sidebar Sections
- **Projeto**: Dashboard, Painel do Projeto, Sistemas
- **Auditoria**: Tipos de Despesas, Integracoes
- **Comercial**: Produtos & Servicos, Contrato, Ecossistema LATAM

## LATAM Ecosystem Categories (15)
GDS (Amadeus, Sabre, Travelport), OBT (Reserve, Argo Solutions, SAP Concur, Amadeus Cytric, GetThere/Serko, Neo/Amex GBT, Navan, TravelPerk, Lemontech, Onfly, VOLL), TMC (CVC Corp, Flytour, BRT, Copastur, Rextur, Alatur JTB, Avipam, Travelcare), ERP/Backoffice (SAP S/4FI, Oracle EBS AP, TOTVS Protheus, Microsoft Dynamics, Benner, Regente, Stur, Wintour), Pagamentos (IVT, EBTA, HCard, CTA, CTAH, Purchasing, VCN, TAR, Conferma Pay, B2, WEX, AirPlus), Cias Aereas (LATAM, GOL, Azul, AA, United, Copa, Avianca, Aeromexico, JetSmart, BSPlink), Hotelaria (Accor, Atlantica, Marriott, Hilton, IHG, Wyndham, Blue Tree, Nacional Inn, Windsor, Bourbon), Car Rental (Localiza Hertz, Movida, Unidas, Foco, Avis, Budget, Enterprise, National), Seguros (Porto Seguro, Allianz, Assist Card, Travel Ace, GTA, Affinity, Coris, April), MICE (MCI Group, GL Events, Embratur, InEvent, Sympla, Eventbrite, Cvent), BSM (Coupa, Concur, Cvent, Veeva, BSPlink, Conferma, B2B, Paytrack, Mobi), eSIGN (DocuSign, Effect, AdobeSign, D4Sign, ClickSign), BI (Power BI, QlikView, Tableau, Cognos), Logistics (Paytrack Air/Hotel/Train/Taxi), Others (AZB, LOS, MDGx, Espider, Webuy, Cora, ICE, Selas, Certis, CSM)

## Recent Changes
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
