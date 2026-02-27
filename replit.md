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
- **AI Desk & Wallet System:** Provides AI-powered services through an AI Desk with job creation, quoting, approval, and execution workflows, alongside a credit-based wallet system for managing service consumption.
- **Subscription System:** Features a self-service subscription model (AuraAudit Pass) with tiered pricing based on Value Under Management (VAM) and configurable monthly caps, integrated with Stripe for checkout and billing.
- **Identity and Access Management:** Role-based authentication (Admin, Client) using express-session, bcrypt, and connect-pg-simple.
- **Data Validation:** Implements robust CNPJ/CPF mathematical validation and integration with BrasilAPI for real-time company data lookup.
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