# Aura Audit - Auditoria Forense

## Overview
Aura Audit is a forensic audit platform for corporate travel and event expense analysis, designed to handle significant financial volumes (e.g., R$ 51.3M in 2024, R$ 39.6M in 2025). It ensures compliance with Brazilian Law 13.964/2019 (Digital Chain of Custody) and focuses on expense management, data reconciliation, anomaly detection, and structured reporting to identify optimization opportunities within the LATAM corporate travel ecosystem. The platform aims to provide robust tools for comprehensive audits.

## User Preferences
I prefer clear and concise communication. For any proposed changes, please provide a high-level overview first, explaining the rationale and potential impact. I value iterative development, with regular updates on progress and opportunities for feedback. When implementing features, prioritize maintainability and scalability. I prefer detailed explanations for complex technical decisions. Do not make changes to files related to billing and subscription logic without explicit approval.

## System Architecture
Aura Audit uses a modern full-stack architecture.
**Frontend:** React, Vite, TailwindCSS, shadcn/ui, Recharts for UI, Wouter for routing, and TanStack React Query for state management.
**Backend:** Express.js and Node.js.
**Database:** PostgreSQL with Drizzle ORM.
**AI Integration:** OpenAI via Replit AI Integrations (gpt-5.2) for advanced analytics.

**Key Features:**
- **Modular Dashboard:** Home page with 8 audit categories, performance metrics, and methodology stages. Detailed dashboard with KPIs, system overviews, financial volumes, and audit scope. Client Project Panel displays real data with "Aguardando dados" placeholders for pending information, enforcing CP-01.
- **Client Management:** Registration and management of travel agencies and corporate entities, including `contractedServices` tracking.
- **Contract & Proposal PDF Export:** Admin and client endpoints for generating professional A4 PDFs of contracts and proposals with SHA-256 hashes and metadata.
- **Document Requirements System:** Detailed requirements for expected documents, enriched by IA Knowledge Base (Documentos IA). Uploaded files automatically set to "Em analise".
- **Data Integration Hub:** Centralized integration for financial institutions, travel providers (agencies, airlines, hotels, car rentals), GDS systems (Sabre, Amadeus), and BSPlink.
- **Expense and Audit Case Management:** CRUD operations for expenses with risk identification, full audit case lifecycle, and anomaly detection.
- **Data Reconciliation:** Advanced reconciliation across OBT, Backoffice, billing systems, and virtual credit cards.
- **Immutable Audit Trail:** Ensures data integrity and compliance with SHA-256 hashes.
- **Structured Reporting:** Generates comprehensive audit reports (executive, technical, risk mapping, action plan).
- **AI Desk (11 Services) & Wallet System:** AI-powered services (Reconciliation, Contract Review, RFP/RFP, etc.) with a full lifecycle, audit envelope (SHA-256), approval flows, and credit-based wallet system (4 packages + custom amounts).
- **Dashboard Studio:** Customizable dashboard views with 8 widget types, global filters, versioning, and admin publication workflow.
- **Reports Library (Artifacts):** Centralized artifact management with SHA-256 integrity and status workflow.
- **Billing Overview:** Unified billing page for AuraAudit Pass subscription and Wallet balance.
- **Company Billing Config:** Configurable limits (auto-approve threshold, per-job limit, monthly cap).
- **AuditPag (Pre-Payment Audit v2):** Module for pre-payment auditing with full chain validation (request, reservation, financial, agreements & commissions, bank reconciliation) and daily monitoring. Includes Agency and Corporate profiles (corporate: solicitation → approval → reservation → agency invoice vs card statement + corporate agreement, NO commission/incentive/rebate; agency: full commission/incentive/rebate chain), typed findings, and a 24-item policy checklist (semi-ready templates based on Petrobras/Odebrecht/Copastur models, 8 categories, configurable per client, custom policy upload). **Alert Engine v2 (Reinforced):** `generateAlert()` auto-escalates severity based on financial thresholds (R$10k high, R$50k critical) even without per-company config; CRITICAL/HIGH alerts always force email channel; admin auto-CC'd on CRITICAL/HIGH; SHA-256 integrity hash per alert with audit trail; structured console logging. **Alert Config:** per-company alert preferences (platform/email/SMS channels, financial thresholds, trigger types, data source preference API/upload/both). **Frontend:** Dashboard tab, Cases tab, Policies tab (templates + clone + items toggle + upload), Alerts tab (severity badges, read/dismiss, unread count), Monitoring tab. **DB Tables:** `audit_pag_cases`, `audit_pag_documents`, `audit_pag_monitoring`, `audit_pag_policies`, `audit_pag_policy_items`, `audit_pag_alerts`, `audit_pag_alert_config`.
- **Contract v5.1.0:** Technical master contract with 30 clauses (including Alert Engine v2 cl.29, CP-01 Health Check Pipeline cl.30), 26 evidences (E24-E26: alerts, health check, AI formatting), 3 annexes, 30-item compliance checklist (25 conformes, 5 observações), 11 implemented modules, and dual-signature system.
- **Subscription System:** Self-service subscription model (AuraAudit Pass) with tiered pricing based on Value Under Management (VAM), integrated with Stripe.
- **Identity and Access Management:** Role-based authentication (Admin, Client) using express-session, bcrypt, and connect-pg-simple.
- **Data Validation:** CNPJ/CPF mathematical validation and BrasilAPI integration for real-time company data lookup.
- **IA Knowledge Base (Documentos IA):** Admin-only system for uploading and categorizing audit expertise (16+ years of materials). Automatically extracts text from various file formats and injects it into the AI system prompt, enforcing confidentiality and compliance with CP-01, CP-02, and CP-03 (LGPD anonymization).
- **Integration Ecosystem:** Client-facing page detailing 149+ platforms across 15 segments (GDS, NDC Airlines, Hotels, Car Rental, etc.), with search and integration methods.
- **CP-01 Compliance & Anti-Regression Defense System:** Multi-layered protection against seed data contamination and CP-01 violations, including seed cleanup on boot, a health check pipeline with auto-remediation, frontend guards displaying "Aguardando dados" for empty states, and AI anti-hallucination protocols.
- **UI/UX:** Prioritizes clear navigation and data visualization with a consistent theme across public, admin, and client portals.

## External Dependencies
- **OpenAI:** Replit AI Integrations (gpt-5.2) for AI capabilities.
- **PostgreSQL:** Primary database.
- **Stripe:** Subscription management and payment processing.
- **BrasilAPI:** CNPJ/CPF lookup and validation.
- **Banco Bradesco EBTA:** Corporate credit card transaction data.
- **Travel Agencies:** CVC, Flytour, BRT for monthly management files.
- **Airlines:** LATAM, GOL, Azul for ticket data.
- **Hotel Chains:** Accor, Atlantica for reservations and billing.
- **Car Rental Companies:** Localiza, Movida.
- **Insurers:** Porto Seguro.
- **GDS Systems:** Sabre, Amadeus for PNR/reservation data.
- **BSPlink:** IATA BSP billing and settlement data.