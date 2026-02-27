# Aura Audit - Auditoria Forense

## Overview
Aura Audit is a forensic audit platform designed for corporate travel and event expense analysis. It supports comprehensive audits for significant financial volumes (e.g., R$ 51.3M in 2024 and R$ 39.6M in 2025) and adheres to the Digital Chain of Custody principles mandated by Brazilian Law 13.964/2019 (Pacote Anticrime). The platform aims to provide robust tools for expense management, data reconciliation, anomaly detection, and structured reporting, ensuring compliance and identifying optimization opportunities within the LATAM corporate travel ecosystem.

## User Preferences
I prefer clear and concise communication. For any proposed changes, please provide a high-level overview first, explaining the rationale and potential impact. I value iterative development, with regular updates on progress and opportunities for feedback. When implementing features, prioritize maintainability and scalability. I prefer detailed explanations for complex technical decisions. Do not make changes to files related to billing and subscription logic without explicit approval.

## System Architecture
Aura Audit employs a modern full-stack architecture.
**Frontend:** Built with React, Vite, TailwindCSS, shadcn/ui, and Recharts for a responsive and data-rich user interface. Wouter is used for client-side routing and TanStack React Query for state management.
**Backend:** Powered by Express.js and Node.js, providing robust API endpoints.
**Database:** PostgreSQL with Drizzle ORM for efficient and type-safe data management.
**AI Integration:** Leverages OpenAI via Replit AI Integrations (gpt-5.2) for advanced analytics and generative assistance.

**Key Features:**
- **Modular Dashboard:** Home page with 8 audit categories (Travel/Events, Expenses, Contracts, Agencies, Telecom, Fleet, Benefits, Supplies), performance metrics, and methodology stages. A detailed dashboard provides KPI metrics, system overviews (OBT/Backoffice), financial volumes, and audit scope areas.
- **Client Management:** Comprehensive client registration and management for travel agencies and corporate entities.
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
- **Contract v5.0.0:** Technical master contract with 28 clauses (including 8 new platform clauses 21-28), 21 evidences (E1-E21), 3 annexes, 25-item compliance checklist (20 OK, 5 observations), 9 implemented modules (M1-M9), and dual-signature system.
- **Subscription System:** Features a self-service subscription model (AuraAudit Pass) with tiered pricing based on Value Under Management (VAM) and configurable monthly caps, integrated with Stripe for checkout and billing.
- **Identity and Access Management:** Role-based authentication (Admin, Client) using express-session, bcrypt, and connect-pg-simple.
- **Data Validation:** Implements robust CNPJ/CPF mathematical validation and integration with BrasilAPI for real-time company data lookup.
- **IA Knowledge Base (Documentos IA):** Admin-only knowledge management system where audit expertise (16+ years of materials) is uploaded, categorized (14 categories), and injected into the AI system prompt. Auto-extracts text from PDF (pdf-parse), Word/DOCX (mammoth), Excel/XLSX (xlsx), TXT, MD, CSV, JSON, XML files. Toggle active/inactive per document. AI applies knowledge confidentially (never reveals client names), prioritizes reliable sources, and explicitly says it will consult a human expert when uncertain.
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