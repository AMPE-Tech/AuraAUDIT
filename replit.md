# Aura Audit - Auditoria Forense

## Overview
Aura Audit is a forensic audit platform for corporate travel and event expenses, built for Grupo Stabia's audit project covering 2024 (R$ 51.3M) and 2025 (R$ 39.6M). It follows the Digital Chain of Custody principles established by Brazilian Law 13.964/2019 (Pacote Anticrime).

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Recharts
- **Backend**: Express.js + Node.js
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
- users, expenses, audit_cases, anomalies, audit_trail, clients, data_sources

## API Endpoints
- GET/POST /api/expenses, PATCH /api/expenses/:id
- GET/POST /api/audit-cases, PATCH /api/audit-cases/:id
- GET/POST /api/anomalies, PATCH /api/anomalies/:id
- GET/POST /api/clients, GET /api/clients/:id, GET /api/clients/type/:type, PATCH /api/clients/:id
- GET/POST /api/data-sources, GET /api/data-sources/:id, GET /api/data-sources/client/:clientId, PATCH /api/data-sources/:id
- GET /api/audit-trail

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

## Routes
- `/` - Home (audit categories, performance metrics, cases, methodology)
- `/dashboard` - Dashboard (project KPIs, systems, chronogram, scope areas)
- `/expenses` - Expense management
- `/reconciliation` - Cross-system data reconciliation
- `/cases` - Audit case management
- `/anomalies` - Anomaly detection
- `/audit-trail` - Immutable audit trail
- `/reports` - Structured audit reports
- `/clients` - Client registration
- `/integrations` - Data source integrations hub

## Recent Changes
- 2026-02-25: Added Home page with 8 audit categories, performance metrics (16%, R$2.8BI, R$448MI), cases, methodology stages
- 2026-02-25: Moved Dashboard from `/` to `/dashboard`, Home now at `/`
- 2026-02-25: Added client registration module (travel agencies + corporate companies)
- 2026-02-25: Added data source integrations hub (Bradesco EBTA, travel agencies, airlines, hotels, car rentals, insurers, GDS Sabre/Amadeus, BSPlink)
- 2026-02-25: Added sidebar section "Cadastro & Integracoes" with Clients and Integrations pages
- 2026-02-25: All new modules include AuraDue chain of custody (SHA-256 hashing, audit trail logging per Lei 13.964/2019)
- 2026-02-17: Added Reconciliation page for cross-system data analysis
- 2026-02-17: Updated Dashboard with project overview, chronogram, and audit scope areas
- 2026-02-17: Updated Reports with full proposal deliverables structure
- 2026-02-17: Enforced Zod validation on all write endpoints
- 2026-02-17: Made integrity hashes deterministic using ISO timestamps
