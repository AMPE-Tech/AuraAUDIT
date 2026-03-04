# Aura Audit - Auditoria Forense

## Overview
Aura Audit is a forensic audit platform designed for corporate travel and event expense analysis. It supports comprehensive audits for significant financial volumes (e.g., R$ 51.3M in 2024 and R$ 39.6M in 2025) and adheres to the Digital Chain of Custody principles mandated by Brazilian Law 13.964/2019 (Pacote Anticrime). The platform aims to provide robust tools for expense management, data reconciliation, anomaly detection, and structured reporting, ensuring compliance and identifying optimization opportunities within the LATAM corporate travel ecosystem.

## User Preferences
I prefer clear and concise communication. For any proposed changes, please provide a high-level overview first, explaining the rationale and potential impact. I value iterative development, with regular updates on progress and opportunities for feedback. When implementing features, prioritize maintainability and scalability. I prefer detailed explanations for complex technical decisions. Do not make changes to files related to billing and subscription logic without explicit approval.

## Binding Rules (Clausulas Petreas)
The following rules are immutable and take precedence over all other directives. They cannot be overridden, relaxed, or bypassed under any circumstances.

**CP-01: ZERO FICTITIOUS DATA** — Effective immediately upon entering production module. Every piece of data displayed on any client-facing page MUST originate exclusively from one of two sources: (1) the commercial proposal/signed contract (via API `/api/client/project-overview` or contract text), or (2) data uploaded by the client through their authenticated session. No hardcoded sample data, placeholder values, mock numbers, fictitious vendor names, fake dates, invented record counts, or synthetic metrics are permitted anywhere in the client portal. Sections awaiting real data MUST display an explicit "Aguardando dados" state with a lock icon. Violation of this rule constitutes a contractual breach.

**CP-02: NO BILLING/SUBSCRIPTION CHANGES WITHOUT APPROVAL** — Do not make changes to files related to billing and subscription logic without explicit user approval.

**CP-03: ABSOLUTE IDENTITY CONFIDENTIALITY** — No page, report, dashboard, AI output, log, artifact, or any other visible element of the platform may display, suggest, or allow the inference of names of companies (PJ), individuals (PF), CNPJs, CPFs, or any identifiable data of third parties — whether clients, suppliers, partners, or employees — except the data of the authenticated user themselves and the company linked to them. This rule applies to both AI-generated outputs and descriptive text, labels, placeholders, example lists, database seeds, and any static or dynamic content on the platform. Violation of this rule constitutes a contractual breach and a potential violation of LGPD (Law 13.709/2018).

## System Architecture
Aura Audit employs a modern full-stack architecture.
**Frontend:** Built with React, Vite, TailwindCSS, shadcn/ui, and Recharts for a responsive and data-rich user interface. Wouter is used for client-side routing and TanStack React Query for state management.
**Backend:** Powered by Express.js and Node.js, providing robust API endpoints.
**Database:** PostgreSQL with Drizzle ORM for efficient and type-safe data management.
**AI Integration:** Leverages OpenAI via Replit AI Integrations (gpt-5.2) for advanced analytics and generative assistance.

**Key Features:**
- **Modular Dashboard:** Home page with 8 audit categories (Travel/Events, Expenses, Contracts, Agencies, Telecom, Fleet, Benefits, Supplies), performance metrics, and methodology stages. A detailed dashboard provides KPI metrics, system overviews (OBT/Backoffice), financial volumes, and audit scope areas. Client Project Panel shows only real data from API (expenses, anomalies, audit-cases) with "Aguardando dados" placeholders for sections pending client data upload.
- **Client Management:** Comprehensive client registration and management for travel agencies and corporate entities, with `contractedServices` field to track which platform modules/services are included in each client's contract.
- **Contract PDF Export:** Admin endpoint `GET /api/contract/:clientId/pdf` generates professional A4 PDF with formatted contract text, SHA-256 hash header, section formatting, and metadata. Available from admin contracts page via "PDF" button. Client endpoints `GET /api/client/contract/pdf` and `GET /api/client/proposal/pdf` generate signed contract and accepted proposal PDFs for download from "Meus Documentos".
- **Document Requirements System:** Each expected document in "Meus Documentos" has a "Requisitos" button that opens a dialog with detailed requirements (what the file must contain, minimum fields, common services/suppliers, payment methods). Requirements are enriched with content from the IA Knowledge Base (Documentos IA). When files are uploaded, status automatically changes to "Em analise" instead of "uploaded".
- **Data Integration Hub:** Centralized hub for integrating various data sources including financial institutions (Banco Bradesco EBTA), travel providers (agencies, airlines, hotels, car rentals), GDS systems (Sabre, Amadeus), and BSPlink.
- **Expense and Audit Case Management:** CRUD operations for expenses with risk level identification, full audit case lifecycle management (methodology, scope, findings, recommendations), and anomaly detection workflows.
- **Data Reconciliation:** Advanced reconciliation capabilities across OBT, Backoffice, billing systems, and virtual credit cards.
- **Immutable Audit Trail:** Ensures data integrity and compliance through deterministic SHA-256 integrity hashes for all audit activities.
- **Structured Reporting:** Generates comprehensive audit reports (executive, technical, risk mapping, action plan) aligned with project deliverables.
- **AI Desk (11 Services) & Wallet System:** AI-powered services through an AI Desk with 11 services (Reconciliation, Contract Review, RFP/RFP, SLA/KPI/Scorecard, Negotiation Assistant, Real-time Alerts, API Connect, Auto Report, Executive Presentation, Lost Saving Strategy, Action Plan), full lifecycle (draft→quoted→pending_approval→approved→running→completed), audit envelope with SHA-256, and approval flow for jobs above configurable limits. Credit-based wallet with 4 packages (US$50/100/500/1000) plus custom amounts (min US$1000).
- **Dashboard Studio:** Customizable dashboard views with 8 widget types, global filters, versioning, and admin publication workflow.
- **Reports Library (Artifacts):** Centralized artifact management with SHA-256 integrity, status workflow (draft→reviewed→approved), and automatic artifact generation from AI Desk outputs.
- **Billing Overview:** Unified billing page showing AuraAudit Pass subscription alongside Wallet balance and consumption.
- **Company Billing Config:** Configurable limits per company (auto-approve threshold, per-job limit, monthly cap).
- **AuditPag (Pre-Payment Audit):** Module for auditing payments before CFO/Financial Manager approval. Full chain validation: request (requester, department, destination) → reservation (PNR code, supplier confirmation) → financial (payment method: faturado/Pix/cartão corporativo/cartão crédito/boleto, amounts: requested/invoiced/supplier, invoice number, due date) → agreements & commissions (corporate agreement, commission %, incentives, rebates — agency profile only) → bank reconciliation (statement match via API) → daily monitoring (inflows/outflows, conformity/non-conformity). Two profiles: Agency (with commissions/incentives/rebates) and Corporate (without, focused on requisition vs. invoice/card statement). Typed findings (valor divergente, documento ausente, reserva incompatível, pagamento duplicado, comissão irregular, sem aprovação, fora da política). Modular structure replicable to other AuraAUDIT segments. Tables: audit_pag_cases, audit_pag_documents, audit_pag_monitoring. Documented as M11, E23, CL22-PAG.
- **Contract v5.0.0:** Technical master contract with 28 clauses (including 8 new platform clauses 21-28), 23 evidences (E1-E23), 3 annexes, 27-item compliance checklist (22 OK, 5 observations), 11 implemented modules (M1-M11), and dual-signature system.
- **Subscription System:** Features a self-service subscription model (AuraAudit Pass) with tiered pricing based on Value Under Management (VAM) and configurable monthly caps, integrated with Stripe for checkout and billing.
- **Identity and Access Management:** Role-based authentication (Admin, Client) using express-session, bcrypt, and connect-pg-simple.
- **Data Validation:** Implements robust CNPJ/CPF mathematical validation and integration with BrasilAPI for real-time company data lookup.
- **IA Knowledge Base (Documentos IA):** Admin-only knowledge management system where audit expertise (16+ years of materials) is uploaded, categorized (14 categories), and injected into the AI system prompt. Auto-extracts text from PDF (pdf-parse), Word/DOCX (mammoth), Excel/XLSX (xlsx), TXT, MD, CSV, JSON, XML files. Toggle active/inactive per document. AI applies knowledge confidentially (never reveals client names), prioritizes reliable sources, and explicitly says it will consult a human expert when uncertain. Production has 14 documents loaded (cases reais, contratos, metodologia). AI system prompt explicitly enforces CP-01/CP-02/CP-03 as "Clausulas Petreas" with LGPD anonymization rules. Knowledge context header reinforces all 3 CPs and LGPD compliance at injection time. Marketing/strategy instructions explicitly subordinated to CP clauses.
- **Integration Ecosystem:** Client-facing page showing 149+ platforms across 15 segments (GDS, NDC Airlines, IATA/BSP, Hotels Global, Hotels Brazil/FOHB, Car Rental, Consolidators, Tour Operators, Insurance, Payments, TMC Globais, TMC Nacionais/ABRACORP, Agencias de Eventos/MICE, TravelTech, Plataformas de Eventos). Collapsible segments with search, integration methods per segment. Documented in contract as M10 and E22.
- **CP-01 Compliance:** Client portal documents, deliverables, and scope items are aligned exclusively with signed contract clauses 6 (entregáveis) and 7 (documentação). No hardcoded client names or fictitious data on client-facing pages. Seed data tables (expenses, anomalies, audit_cases, data_sources, audit_trail) were cleaned; seed guard uses clients table to prevent re-seeding.
- **UI/UX:** The design prioritizes clear navigation and data visualization, with a consistent theme across public, admin, and client portals. The public site focuses on institutional information, services, methodology, and a free trial for basic AI analysis with chain of custody.

## External Dependencies
- **OpenAI:** Utilized through Replit AI Integrations (gpt-5.2) for AI capabilities.
- **PostgreSQL:** Primary database for all application data.
- **Stripe:** Used for subscription management, payment processing, and billing.
- **BrasilAPI:** Integrated for CNPJ/CPF lookup and validation against official government data.
- **Banco Bradesco EBTA:** Data source for corporate credit card transactions.
- **Travel Agencies:** Integration with major agencies like CVC, Flytour, BRT for monthly management files.
- **Airlines:** Direct integration with LATAM, GOL, Azul for ticket data.
- **Hotel Chains:** Data from Accor, Atlantica for reservations and billing.
- **Car Rental Companies:** Integration with Localiza, Movida.
- **Insurers:** Data from Porto Seguro.
- **GDS Systems:** Sabre and Amadeus for PNR/reservation data.
- **BSPlink:** For IATA BSP billing and settlement data.