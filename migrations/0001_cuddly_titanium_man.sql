CREATE TABLE "audit_pag_data_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"connection_method" text NOT NULL,
	"endpoint_url" text,
	"sftp_host" text,
	"sftp_port" integer,
	"sftp_directory" text,
	"auth_type" text,
	"credentials_ref" text,
	"schedule" text,
	"is_trusted" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_sync_at" timestamp,
	"last_sync_status" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_fee_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"fee_name" text NOT NULL,
	"fee_type" text DEFAULT 'fixed' NOT NULL,
	"fee_value" numeric(14, 2) DEFAULT '0' NOT NULL,
	"separate_invoice" boolean DEFAULT true NOT NULL,
	"billing_description" text,
	"applies_to" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"name" text NOT NULL,
	"method_type" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_bank_reconciliation" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_reconciliation_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar NOT NULL,
	"step" text NOT NULL,
	"result" text NOT NULL,
	"details" jsonb,
	"integrity_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_service_types" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"requires_commission_check" boolean DEFAULT false NOT NULL,
	"requires_incentive_check" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_supplier_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar NOT NULL,
	"service_type_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"cnpj" varchar(18) NOT NULL,
	"razao_social" text NOT NULL,
	"nome_fantasia" text,
	"segment" text,
	"status" text DEFAULT 'active' NOT NULL,
	"pays_commission" boolean DEFAULT false NOT NULL,
	"commission_type" text,
	"commission_percent" numeric(5, 2),
	"has_incentive" boolean DEFAULT false NOT NULL,
	"incentive_type" text,
	"incentive_value" numeric(14, 2),
	"has_rebate" boolean DEFAULT false NOT NULL,
	"rebate_percent" numeric(5, 2),
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"reference_code" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"supplier_id" varchar,
	"supplier_cnpj" text,
	"supplier_name" text,
	"service_type_id" varchar,
	"service_type_name" text,
	"fee_config_id" varchar,
	"payment_method_id" varchar,
	"client_request_data" jsonb,
	"erp_entry_data" jsonb,
	"bank_statement_data" jsonb,
	"requested_amount" numeric(14, 2),
	"invoiced_amount" numeric(14, 2),
	"supplier_paid_amount" numeric(14, 2),
	"client_paid_amount" numeric(14, 2),
	"bank_confirmed_amount" numeric(14, 2),
	"fee_amount" numeric(14, 2),
	"fee_reconciled" boolean DEFAULT false NOT NULL,
	"commission_expected" numeric(14, 2),
	"commission_received" numeric(14, 2),
	"incentive_expected" numeric(14, 2),
	"incentive_received" numeric(14, 2),
	"fiscal_doc_type" text,
	"fiscal_doc_number" text,
	"fiscal_doc_amount" numeric(14, 2),
	"layer1_source" text,
	"layer1_source_id" varchar,
	"layer1_at" timestamp,
	"layer2_source" text,
	"layer2_source_id" varchar,
	"layer2_at" timestamp,
	"layer3_source" text,
	"layer3_source_id" varchar,
	"layer3_type" text,
	"layer3_at" timestamp,
	"reconciliation_status" text DEFAULT 'pending' NOT NULL,
	"reconciliation_notes" text,
	"reconciliation_at" timestamp,
	"created_by_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aura_trust_certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"company_name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"seal_code" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp,
	"total_transactions_monitored" integer DEFAULT 0 NOT NULL,
	"total_volume_monitored" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_alerts_generated" integer DEFAULT 0 NOT NULL,
	"total_divergences_found" integer DEFAULT 0 NOT NULL,
	"compliance_score" numeric(5, 2),
	"reconciliation_rate" numeric(5, 2),
	"methodology_version" text DEFAULT '1.0' NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"revocation_reason" text,
	"integrity_hash" text NOT NULL,
	"previous_certificate_hash" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aura_trust_metering" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"billing_period_start" timestamp NOT NULL,
	"billing_period_end" timestamp NOT NULL,
	"total_transactions" integer DEFAULT 0 NOT NULL,
	"included_transactions" integer DEFAULT 500 NOT NULL,
	"excess_transactions" integer DEFAULT 0 NOT NULL,
	"base_fee" numeric(10, 2) DEFAULT '149.00' NOT NULL,
	"excess_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_fee" numeric(10, 2) DEFAULT '149.00' NOT NULL,
	"tier_breakdown" jsonb,
	"status" text DEFAULT 'open' NOT NULL,
	"integrity_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conciliacao_banco" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"user_id" text NOT NULL,
	"pasta" text DEFAULT 'pagar' NOT NULL,
	"data_transacao" timestamp,
	"descricao" text,
	"valor" numeric(14, 2),
	"tipo" text DEFAULT 'debito',
	"saldo" numeric(14, 2),
	"banco" text,
	"agencia" text,
	"conta" text,
	"documento_ref" text,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conciliacao_erp" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"user_id" text NOT NULL,
	"pasta" text DEFAULT 'pagar' NOT NULL,
	"numero_nf" text,
	"fornecedor" text,
	"cnpj_fornecedor" text,
	"valor_bruto" numeric(14, 2),
	"valor_liquido" numeric(14, 2),
	"data_pagamento" timestamp,
	"data_vencimento" timestamp,
	"centro_custo" text,
	"contrato" text,
	"forma_pagamento" text,
	"sistema_origem" text DEFAULT 'STUR',
	"descricao" text,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conciliacao_nfse" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"user_id" text NOT NULL,
	"tipo" text DEFAULT 'emitida' NOT NULL,
	"pasta" text DEFAULT 'pagar' NOT NULL,
	"numero_nota" text,
	"data_emissao" timestamp,
	"cnpj_tomador" text,
	"cnpj_prestador" text,
	"razao_social_tomador" text,
	"razao_social_prestador" text,
	"valor_servico" numeric(14, 2),
	"valor_iss" numeric(14, 2),
	"aliquota_iss" numeric(5, 2),
	"codigo_servico" text,
	"descricao_servico" text,
	"status_nota" text DEFAULT 'ativa',
	"municipio" text DEFAULT 'Curitiba',
	"xml_original" text,
	"sha256" text,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conciliacao_resultado" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"user_id" text NOT NULL,
	"pasta" text DEFAULT 'pagar' NOT NULL,
	"nfse_id" varchar,
	"erp_id" varchar,
	"banco_id" varchar,
	"status_conciliacao" text DEFAULT 'pendente' NOT NULL,
	"valor_nota" numeric(14, 2),
	"valor_pago" numeric(14, 2),
	"valor_banco" numeric(14, 2),
	"diferenca" numeric(14, 2),
	"observacao" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_phases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"name" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"estimated_end_date" timestamp,
	"actual_end_date" timestamp,
	"estimated_days" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"deliverables" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"name" text NOT NULL,
	"description" text,
	"total_estimated_days" integer DEFAULT 60 NOT NULL,
	"start_date" timestamp,
	"estimated_end_date" timestamp,
	"contract_signed_at" timestamp,
	"grace_period_days" integer DEFAULT 5 NOT NULL,
	"days_per_week" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"health_score" text DEFAULT 'on_track' NOT NULL,
	"created_by_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_time_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"phase_id" varchar,
	"category" text NOT NULL,
	"description" text,
	"hours" numeric(8, 2) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
