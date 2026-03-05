CREATE TABLE "ai_job_approvals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"approved_by_user_id" varchar NOT NULL,
	"approved_at" timestamp DEFAULT now() NOT NULL,
	"decision" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "ai_job_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"upload_id" varchar,
	"sha256" text,
	"storage_ref" text,
	"filename" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_job_outputs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"title" text NOT NULL,
	"output_type" text NOT NULL,
	"content" text NOT NULL,
	"sha256" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_job_quotes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"estimated_credits" numeric(10, 2) NOT NULL,
	"cap_credits" numeric(10, 2),
	"requires_approval" boolean DEFAULT false NOT NULL,
	"pricing_breakdown_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"user_id" varchar NOT NULL,
	"service_id" varchar NOT NULL,
	"service_name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"input_description" text,
	"input_config_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"icon" text,
	"base_credits" numeric(8, 2) NOT NULL,
	"pricing_config_json" jsonb,
	"human_review_required" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anomalies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_id" varchar NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"description" text NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" text,
	"resolution" text
);
--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"created_by_user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"storage_ref" text,
	"content" text,
	"sha256" text,
	"source_refs_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assigned_to" text,
	"methodology" text,
	"scope" text,
	"findings" text,
	"recommendations" text,
	"total_amount" numeric(12, 2) DEFAULT '0',
	"savings_identified" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_envelopes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"envelope_json" jsonb NOT NULL,
	"envelope_sha256" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_alert_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"enable_platform_alerts" boolean DEFAULT true NOT NULL,
	"enable_email_alerts" boolean DEFAULT true NOT NULL,
	"enable_sms_alerts" boolean DEFAULT false NOT NULL,
	"email_recipients" text,
	"sms_recipients" text,
	"high_value_threshold" numeric(14, 2) DEFAULT '10000' NOT NULL,
	"critical_value_threshold" numeric(14, 2) DEFAULT '50000' NOT NULL,
	"alert_on_discrepancy" boolean DEFAULT true NOT NULL,
	"alert_on_policy_violation" boolean DEFAULT true NOT NULL,
	"alert_on_bank_mismatch" boolean DEFAULT true NOT NULL,
	"data_source_preference" text DEFAULT 'both' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"audit_pag_case_id" varchar,
	"alert_type" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"financial_amount" numeric(14, 2),
	"channel" text DEFAULT 'platform' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"read_at" timestamp,
	"recipient_user_id" varchar,
	"recipient_email" text,
	"recipient_phone" text,
	"integrity_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"created_by_user_id" varchar,
	"profile_type" text DEFAULT 'agency' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"requester_name" text,
	"requester_department" text,
	"destination" text,
	"travel_date" timestamp,
	"return_date" timestamp,
	"supplier_name" text,
	"reservation_code" text,
	"supplier_confirmation" text,
	"payment_method" text,
	"requested_amount" numeric(14, 2),
	"invoiced_amount" numeric(14, 2),
	"supplier_pay_amount" numeric(14, 2),
	"invoice_number" text,
	"invoice_due_date" timestamp,
	"has_corporate_agreement" boolean DEFAULT false NOT NULL,
	"commission_percent" numeric(6, 2),
	"commission_amount" numeric(14, 2),
	"has_incentive" boolean DEFAULT false NOT NULL,
	"incentive_amount" numeric(14, 2),
	"has_rebate" boolean DEFAULT false NOT NULL,
	"rebate_amount" numeric(14, 2),
	"agency_invoice_ref" text,
	"approval_reference" text,
	"card_statement_ref" text,
	"card_last_four" text,
	"bank_statement_match" text DEFAULT 'pending' NOT NULL,
	"bank_match_amount" numeric(14, 2),
	"bank_match_date" timestamp,
	"conformity_status" text DEFAULT 'pending_review' NOT NULL,
	"conformity_notes" text,
	"findings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_pag_case_id" varchar NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text,
	"sha256" text,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_monitoring" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"monitor_date" timestamp NOT NULL,
	"total_inflows" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_outflows" numeric(14, 2) DEFAULT '0' NOT NULL,
	"matched_count" integer DEFAULT 0 NOT NULL,
	"unmatched_count" integer DEFAULT 0 NOT NULL,
	"conformant_count" integer DEFAULT 0 NOT NULL,
	"non_conformant_count" integer DEFAULT 0 NOT NULL,
	"summary_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"name" text NOT NULL,
	"policy_type" text DEFAULT 'travel_purchase' NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"uploaded_file_url" text,
	"uploaded_file_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_pag_policy_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" varchar NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"flag_level" text DEFAULT 'warning' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_trail" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"data_before" jsonb,
	"data_after" jsonb,
	"integrity_hash" text NOT NULL,
	"ip_address" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"user_id" varchar,
	"period_ref" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vam_total" numeric(14, 2) DEFAULT '0',
	"variable_usd" numeric(10, 2) DEFAULT '0',
	"total_usd" numeric(10, 2) DEFAULT '0',
	"stripe_invoice_id" text,
	"log_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_uploads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_key" text NOT NULL,
	"client_id" varchar,
	"user_id" varchar NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"client_checked" boolean DEFAULT false NOT NULL,
	"sha256" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"validated_at" timestamp,
	"validated_by" text
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"cnpj" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"address" text,
	"city" text,
	"state" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"contracted_services" text[] DEFAULT ARRAY[]::text[],
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_billing_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_job_limit_default" numeric(10, 2) DEFAULT '200' NOT NULL,
	"company_job_limit_default" numeric(10, 2) DEFAULT '500' NOT NULL,
	"company_monthly_wallet_cap" numeric(10, 2),
	"auto_approve_below" numeric(10, 2) DEFAULT '200',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_number" text NOT NULL,
	"user_id" varchar NOT NULL,
	"signer_name" text NOT NULL,
	"signer_role" text NOT NULL,
	"signer_type" text DEFAULT 'client' NOT NULL,
	"signer_cpf" text,
	"company_name" text,
	"company_cnpj" text,
	"client_id" varchar,
	"contract_text_sha256" text NOT NULL,
	"contract_version" text NOT NULL,
	"contract_type" text DEFAULT 'standard' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"signed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"created_by_user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"layout_json" jsonb,
	"filters_json" jsonb,
	"widgets_json" jsonb,
	"tags" text[],
	"version" integer DEFAULT 1 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"last_sync_at" timestamp,
	"sync_frequency" text DEFAULT 'monthly' NOT NULL,
	"file_format" text DEFAULT 'csv' NOT NULL,
	"description" text,
	"config" jsonb,
	"total_records" integer DEFAULT 0,
	"total_amount" numeric(14, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"from_email" text DEFAULT 'contato@auradue.com' NOT NULL,
	"from_name" text DEFAULT 'AuraAUDIT' NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sent_by_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_recipients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"company" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"date" timestamp NOT NULL,
	"vendor" text NOT NULL,
	"department" text NOT NULL,
	"employee" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"risk_level" text DEFAULT 'low' NOT NULL,
	"receipt_url" text,
	"notes" text,
	"origin" text,
	"destination" text,
	"audit_case_id" varchar
);
--> statement-breakpoint
CREATE TABLE "ia_knowledge_docs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text,
	"sha256" text NOT NULL,
	"extracted_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_consumption" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"user_id" varchar,
	"period_ref" text NOT NULL,
	"vam_total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"tx_count" integer DEFAULT 0 NOT NULL,
	"dedupe_method" text DEFAULT 'hash',
	"variable_usd" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_usd" numeric(10, 2) DEFAULT '0' NOT NULL,
	"stripe_invoice_id" text,
	"report_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar,
	"client_name" text NOT NULL,
	"client_cnpj" text,
	"client_email" text,
	"type" text DEFAULT 'custom' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_value" numeric(12, 2),
	"payment_terms" text,
	"valid_until" timestamp,
	"scope" text,
	"notes" text,
	"contract_url" text,
	"signed_at" timestamp,
	"signed_by" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terms_acceptance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_name" text,
	"company_cnpj" text,
	"terms_version" text NOT NULL,
	"terms_text_sha256" text NOT NULL,
	"terms_text_snapshot" text,
	"ip_address" text,
	"user_agent" text,
	"accepted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trial_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"envelope_id" text NOT NULL,
	"files_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'auditor' NOT NULL,
	"client_id" varchar,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wallet_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" varchar NOT NULL,
	"type" text NOT NULL,
	"credits" numeric(12, 2) NOT NULL,
	"usd_amount" numeric(12, 2),
	"reference_type" text,
	"reference_id" varchar,
	"description" text,
	"metadata_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"user_id" varchar,
	"currency" text DEFAULT 'USD' NOT NULL,
	"balance_credits" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
