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
- Dashboard with KPI metrics, systems overview (OBT/Backoffice), financial volumes, 15-day chronogram, audit scope areas
- Expense management (travel, hotels, events) with CRUD, filters, risk levels
- Data reconciliation across OBT (Reserve, Argo), Backoffice (Wintour, Stur), billing, and virtual credit cards
- Audit case management with methodology, scope, findings, recommendations
- Anomaly detection and resolution workflow
- Immutable audit trail with deterministic SHA-256 integrity hashes
- Structured audit reports matching proposal deliverables (executive report, technical report, risk mapping, action plan)

## Project Structure
```
client/src/
  pages/         - Dashboard, Expenses, Reconciliation, AuditCases, Anomalies, AuditTrail, Reports
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
- users, expenses, audit_cases, anomalies, audit_trail

## API Endpoints
- GET/POST /api/expenses, PATCH /api/expenses/:id
- GET/POST /api/audit-cases, PATCH /api/audit-cases/:id
- GET/POST /api/anomalies, PATCH /api/anomalies/:id
- GET /api/audit-trail

## Audit Scope (Grupo Stabia)
- Systems: OBT (Reserve, Argo), Backoffice (Wintour 2024, Stur 2025)
- Analysis areas: Policy compliance, governance, data integrity, contract adherence, controls/approvals, operational failures, financial vulnerabilities, risk assessment, optimization opportunities
- Reconciliation: OBT vs Backoffice, credit cards vs reservations, BSP vs airlines, hotel vs invoices, fee/rebate divergences

## Recent Changes
- 2026-02-17: Added Reconciliation page for cross-system data analysis
- 2026-02-17: Updated Dashboard with project overview, chronogram, and audit scope areas
- 2026-02-17: Updated Reports with full proposal deliverables structure
- 2026-02-17: Enforced Zod validation on all write endpoints
- 2026-02-17: Made integrity hashes deterministic using ISO timestamps
