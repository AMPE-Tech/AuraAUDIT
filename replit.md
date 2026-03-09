# AuraTECH — Trust Infrastructure Platform

## Overview
AuraTECH is an institutional trust infrastructure platform designed to provide evidence-based verification, validation, and certification across various sectors. It originated from AuraAUDIT, a forensic audit tool for corporate travel, and has expanded into a modular ecosystem. The platform handles substantial financial volumes, ensures compliance with Brazilian Law 13.964/2019 (Digital Chain of Custody), and offers tools for comprehensive audits, data governance, legal compliance, and asset verification. Its core vision is to establish a dynamic trust infrastructure, enhancing transparency and compliance in financial and operational processes.

## User Preferences
I prefer clear and concise communication. For any proposed changes, please provide a high-level overview first, explaining the rationale and potential impact. I value iterative development, with regular updates on progress and opportunities for feedback. When implementing features, prioritize maintainability and scalability. I prefer detailed explanations for complex technical decisions. Do not make changes to files related to billing and subscription logic without explicit approval.

## System Architecture
AuraTECH utilizes a modern full-stack architecture. The frontend is built with React, Vite, TailwindCSS, shadcn/ui, Recharts for data visualization, Wouter for routing, and TanStack React Query for state management. The backend is powered by Express.js and Node.js, with PostgreSQL and Drizzle ORM for database management. AI capabilities are integrated via OpenAI through Replit AI Integrations.

The platform is structured around a modular ecosystem, with AuraTRUST serving as a transversal certification and validation layer ensuring legal traceability and digital chain of custody. Key architectural components and features include:

- **AuraTECH Ecosystem Modules:** A suite of modules including AuraAUDIT (corporate expense review), AuraDATA (data governance), AuraDUE (digital due diligence), AuraRISK (compliance scoring), AuraCARBO (carbon project validation), AuraLOA (precatory research validation), AuraTAX (tax credit recovery), AuraMARKET (verified asset exchange), AuraTRACK (audit timeline engine), AuraLEGAL (legal & regulatory compliance), and AuraBID (procurement analysis). All modules are underpinned by AuraTRUST.
- **Aura Trust Index™:** A dynamic five-level trust score model.
- **AuraTECH Landing Page:** An institutional landing page featuring a module catalog, performance statistics, and information about AuraTRUST and the Trust Index™.
- **Modular Dashboard:** Provides performance metrics, methodology stages, and client project panels with real-time data.
- **Client and Contract Management:** Systems for registering and managing clients and travel agencies, alongside PDF generation for contracts and proposals with SHA-256 hashes.
- **Document Requirements System & IA Knowledge Base:** Manages required documents and uses an AI-powered knowledge base for expertise and compliance.
- **Data Integration Hub:** Centralized integration for various financial institutions, travel providers, and GDS systems.
- **Expense and Audit Case Management:** Features CRUD operations for expenses, risk identification, and anomaly detection.
- **Data Reconciliation & "Conciliar Contas" Module:** Advanced reconciliation capabilities, including triple cross-matching for accounts payable and receivable, supporting various import formats and identifying divergences.
- **Immutable Audit Trail:** Ensures data integrity and compliance through SHA-256 hashes.
- **Structured Reporting:** Generation of comprehensive audit reports.
- **AI Desk & Wallet System:** AI-powered services with audit envelopes, approval workflows, and a credit-based wallet system.
- **Dashboard Studio & Reports Library:** Customizable dashboards and centralized management of audit artifacts with integrity checks.
- **AuraTRACK (Audit Timeline Engine):** Provides visual project timelines, health scores, and operational timesheets, with an intelligent scheduling engine.
- **AuraTRUST (Pre-Payment Audit v2) & Evidence Tracking Infrastructure:** Advanced pre-payment auditing with comprehensive chain validation, policy checklists, a reinforced alert engine, and an automated reconciliation pipeline (3-layered data ingestion). The Evidence Tracking Infrastructure formalizes results with Trust Seals and Period Certificates, featuring chained SHA-256 custody and usage-based pricing.
- **Subscription System:** Self-service model for AuraAudit Pass with tiered pricing.
- **Identity and Access Management:** Role-based authentication (Admin, Client).
- **Data Validation:** Utilizes BrasilAPI for CNPJ/CPF validation.
- **Integration Ecosystem:** A client-facing page detailing extensive platform integrations.
- **CP-01 Compliance & Anti-Regression Defense System:** Multi-layered protection against data contamination and compliance violations, including health checks and AI anti-hallucination protocols.
- **UI/UX:** Consistent and clear design across all portals with a focus on data visualization.

## External Dependencies
- **OpenAI:** Used for AI capabilities through Replit AI Integrations.
- **PostgreSQL:** The primary relational database.
- **Stripe:** For subscription management and payment processing.
- **BrasilAPI:** Provides CNPJ/CPF lookup and validation services.
- **Banco Bradesco EBTA:** Integrated for corporate credit card transaction data.
- **Travel Agencies:** Integration with CVC, Flytour, BRT for management files.
- **Airlines:** Integrations with LATAM, GOL, Azul for ticket data.
- **Hotel Chains:** Connectivity with Accor, Atlantica for reservations and billing.
- **Car Rental Companies:** Integration with Localiza, Movida.
- **Insurers:** Porto Seguro is integrated.
- **GDS Systems:** Utilizes Sabre and Amadeus for PNR/reservation data.
- **BSPlink:** For IATA BSP billing and settlement data.