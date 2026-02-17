# Aura Audit - Auditoria Forense

## Overview
Aura Audit is a forensic audit platform focused on corporate travel and event expenses. It follows the Digital Chain of Custody principles established by Brazilian Law 13.964/2019 (Pacote Anticrime).

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Recharts
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express routes (backend)
- **State Management**: TanStack React Query

## Key Features
- Dashboard with KPI metrics and charts
- Expense management (travel, hotels, events)
- Audit case management
- Anomaly detection and resolution
- Immutable audit trail with SHA-256 integrity hashes
- Structured audit reports

## Project Structure
```
client/src/
  pages/         - Dashboard, Expenses, AuditCases, Anomalies, AuditTrail, Reports
  components/    - AppSidebar, ThemeProvider, ThemeToggle, UI components
  lib/           - formatters, queryClient, utils
shared/
  schema.ts      - Drizzle schema definitions and Zod validators
server/
  routes.ts      - API endpoints (/api/expenses, /api/audit-cases, /api/anomalies, /api/audit-trail)
  storage.ts     - Database storage layer
  db.ts          - Database connection
  seed.ts        - Seed data
```

## Database Tables
- users, expenses, audit_cases, anomalies, audit_trail

## API Endpoints
- GET/POST /api/expenses, PATCH /api/expenses/:id
- GET/POST /api/audit-cases, PATCH /api/audit-cases/:id
- GET/POST /api/anomalies, PATCH /api/anomalies/:id
- GET /api/audit-trail
