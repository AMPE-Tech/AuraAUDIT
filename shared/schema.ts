import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("auditor"),
  clientId: varchar("client_id"),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  date: timestamp("date").notNull(),
  vendor: text("vendor").notNull(),
  department: text("department").notNull(),
  employee: text("employee").notNull(),
  status: text("status").notNull().default("pending"),
  riskLevel: text("risk_level").notNull().default("low"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  origin: text("origin"),
  destination: text("destination"),
  auditCaseId: varchar("audit_case_id"),
});

export const auditCases = pgTable("audit_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  assignedTo: text("assigned_to"),
  methodology: text("methodology"),
  scope: text("scope"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0"),
  savingsIdentified: decimal("savings_identified", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const anomalies = pgTable("anomalies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull(),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("medium"),
  description: text("description").notNull(),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedBy: text("resolved_by"),
  resolution: text("resolution"),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  cnpj: text("cnpj").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id"),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("disconnected"),
  lastSyncAt: timestamp("last_sync_at"),
  syncFrequency: text("sync_frequency").notNull().default("monthly"),
  fileFormat: text("file_format").notNull().default("csv"),
  description: text("description"),
  config: jsonb("config"),
  totalRecords: integer("total_records").default(0),
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditTrail = pgTable("audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  dataBefore: jsonb("data_before"),
  dataAfter: jsonb("data_after"),
  integrityHash: text("integrity_hash").notNull(),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

export const insertAuditCaseSchema = createInsertSchema(auditCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnomalySchema = createInsertSchema(anomalies).omit({
  id: true,
  detectedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditTrailSchema = createInsertSchema(auditTrail).omit({
  id: true,
  timestamp: true,
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id"),
  clientName: text("client_name").notNull(),
  clientCnpj: text("client_cnpj"),
  clientEmail: text("client_email"),
  type: text("type").notNull().default("custom"),
  status: text("status").notNull().default("draft"),
  services: jsonb("services").notNull().default([]),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }),
  paymentTerms: text("payment_terms"),
  validUntil: timestamp("valid_until"),
  scope: text("scope"),
  notes: text("notes"),
  contractUrl: text("contract_url"),
  signedAt: timestamp("signed_at"),
  signedBy: text("signed_by"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export const termsAcceptance = pgTable("terms_acceptance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyName: text("company_name"),
  companyCnpj: text("company_cnpj"),
  termsVersion: text("terms_version").notNull(),
  termsTextSha256: text("terms_text_sha256").notNull(),
  termsTextSnapshot: text("terms_text_snapshot"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
});

export const monthlyConsumption = pgTable("monthly_consumption", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  periodRef: text("period_ref").notNull(),
  vamTotal: decimal("vam_total", { precision: 14, scale: 2 }).notNull().default("0"),
  txCount: integer("tx_count").notNull().default(0),
  dedupeMethod: text("dedupe_method").default("hash"),
  variableUsd: decimal("variable_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  totalUsd: decimal("total_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  stripeInvoiceId: text("stripe_invoice_id"),
  reportJson: jsonb("report_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const billingRuns = pgTable("billing_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  periodRef: text("period_ref").notNull(),
  status: text("status").notNull().default("pending"),
  vamTotal: decimal("vam_total", { precision: 14, scale: 2 }).default("0"),
  variableUsd: decimal("variable_usd", { precision: 10, scale: 2 }).default("0"),
  totalUsd: decimal("total_usd", { precision: 10, scale: 2 }).default("0"),
  stripeInvoiceId: text("stripe_invoice_id"),
  logJson: jsonb("log_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTermsAcceptanceSchema = createInsertSchema(termsAcceptance).omit({
  id: true,
  acceptedAt: true,
});

export const insertMonthlyConsumptionSchema = createInsertSchema(monthlyConsumption).omit({
  id: true,
  createdAt: true,
});

export const insertBillingRunSchema = createInsertSchema(billingRuns).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertAuditCase = z.infer<typeof insertAuditCaseSchema>;
export type AuditCase = typeof auditCases.$inferSelect;
export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type Anomaly = typeof anomalies.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertTermsAcceptance = z.infer<typeof insertTermsAcceptanceSchema>;
export type TermsAcceptance = typeof termsAcceptance.$inferSelect;
export type InsertMonthlyConsumption = z.infer<typeof insertMonthlyConsumptionSchema>;
export type MonthlyConsumption = typeof monthlyConsumption.$inferSelect;
export type InsertBillingRun = z.infer<typeof insertBillingRunSchema>;
export type BillingRun = typeof billingRuns.$inferSelect;

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  currency: text("currency").notNull().default("USD"),
  balanceCredits: decimal("balance_credits", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const walletLedger = pgTable("wallet_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull(),
  type: text("type").notNull(),
  credits: decimal("credits", { precision: 12, scale: 2 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 12, scale: 2 }),
  referenceType: text("reference_type"),
  referenceId: varchar("reference_id"),
  description: text("description"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiServices = pgTable("ai_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  icon: text("icon"),
  baseCredits: decimal("base_credits", { precision: 8, scale: 2 }).notNull(),
  pricingConfigJson: jsonb("pricing_config_json"),
  humanReviewRequired: boolean("human_review_required").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiJobs = pgTable("ai_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  status: text("status").notNull().default("draft"),
  inputDescription: text("input_description"),
  inputConfigJson: jsonb("input_config_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiJobQuotes = pgTable("ai_job_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  estimatedCredits: decimal("estimated_credits", { precision: 10, scale: 2 }).notNull(),
  capCredits: decimal("cap_credits", { precision: 10, scale: 2 }),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  pricingBreakdownJson: jsonb("pricing_breakdown_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiJobOutputs = pgTable("ai_job_outputs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  title: text("title").notNull(),
  outputType: text("output_type").notNull(),
  content: text("content").notNull(),
  sha256: text("sha256"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditEnvelopes = pgTable("audit_envelopes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  envelopeJson: jsonb("envelope_json").notNull(),
  envelopeSha256: text("envelope_sha256").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trialUsage = pgTable("trial_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull(),
  envelopeId: text("envelope_id").notNull(),
  filesCount: integer("files_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrialUsageSchema = createInsertSchema(trialUsage).omit({ id: true, createdAt: true });
export type InsertTrialUsage = z.infer<typeof insertTrialUsageSchema>;
export type TrialUsage = typeof trialUsage.$inferSelect;

export const contractSignatures = pgTable("contract_signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: text("contract_number").notNull(),
  userId: varchar("user_id").notNull(),
  signerName: text("signer_name").notNull(),
  signerRole: text("signer_role").notNull(),
  signerType: text("signer_type").notNull().default("client"),
  signerCpf: text("signer_cpf"),
  companyName: text("company_name"),
  companyCnpj: text("company_cnpj"),
  clientId: varchar("client_id"),
  contractTextSha256: text("contract_text_sha256").notNull(),
  contractVersion: text("contract_version").notNull(),
  contractType: text("contract_type").notNull().default("standard"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").notNull().defaultNow(),
});

export const insertContractSignatureSchema = createInsertSchema(contractSignatures).omit({ id: true, signedAt: true });
export type InsertContractSignature = z.infer<typeof insertContractSignatureSchema>;
export type ContractSignature = typeof contractSignatures.$inferSelect;

export const clientUploads = pgTable("client_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentKey: text("document_key").notNull(),
  clientId: varchar("client_id"),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type"),
  status: text("status").notNull().default("uploaded"),
  clientChecked: boolean("client_checked").notNull().default(false),
  sha256: text("sha256"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  validatedAt: timestamp("validated_at"),
  validatedBy: text("validated_by"),
});

export const insertClientUploadSchema = createInsertSchema(clientUploads).omit({ id: true, uploadedAt: true, validatedAt: true });
export type InsertClientUpload = z.infer<typeof insertClientUploadSchema>;
export type ClientUpload = typeof clientUploads.$inferSelect;

export const dashboardViews = pgTable("dashboard_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  createdByUserId: varchar("created_by_user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  layoutJson: jsonb("layout_json"),
  filtersJson: jsonb("filters_json"),
  widgetsJson: jsonb("widgets_json"),
  tags: text("tags").array(),
  version: integer("version").notNull().default(1),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const artifacts = pgTable("artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  createdByUserId: varchar("created_by_user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  storageRef: text("storage_ref"),
  content: text("content"),
  sha256: text("sha256"),
  sourceRefsJson: jsonb("source_refs_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiJobApprovals = pgTable("ai_job_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  approvedByUserId: varchar("approved_by_user_id").notNull(),
  approvedAt: timestamp("approved_at").notNull().defaultNow(),
  decision: text("decision").notNull(),
  notes: text("notes"),
});

export const aiJobFiles = pgTable("ai_job_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  uploadId: varchar("upload_id"),
  sha256: text("sha256"),
  storageRef: text("storage_ref"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companyBillingConfig = pgTable("company_billing_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userJobLimitDefault: decimal("user_job_limit_default", { precision: 10, scale: 2 }).notNull().default("200"),
  companyJobLimitDefault: decimal("company_job_limit_default", { precision: 10, scale: 2 }).notNull().default("500"),
  companyMonthlyWalletCap: decimal("company_monthly_wallet_cap", { precision: 10, scale: 2 }),
  autoApproveBelow: decimal("auto_approve_below", { precision: 10, scale: 2 }).default("200"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true });
export const insertWalletLedgerSchema = createInsertSchema(walletLedger).omit({ id: true, createdAt: true });
export const insertAiServiceSchema = createInsertSchema(aiServices).omit({ id: true, createdAt: true });
export const insertAiJobSchema = createInsertSchema(aiJobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiJobQuoteSchema = createInsertSchema(aiJobQuotes).omit({ id: true, createdAt: true });
export const insertAiJobOutputSchema = createInsertSchema(aiJobOutputs).omit({ id: true, createdAt: true });
export const insertAuditEnvelopeSchema = createInsertSchema(auditEnvelopes).omit({ id: true, createdAt: true });
export const insertDashboardViewSchema = createInsertSchema(dashboardViews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArtifactSchema = createInsertSchema(artifacts).omit({ id: true, createdAt: true });
export const insertAiJobApprovalSchema = createInsertSchema(aiJobApprovals).omit({ id: true, approvedAt: true });
export const insertAiJobFileSchema = createInsertSchema(aiJobFiles).omit({ id: true, createdAt: true });
export const insertCompanyBillingConfigSchema = createInsertSchema(companyBillingConfig).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWalletLedger = z.infer<typeof insertWalletLedgerSchema>;
export type WalletLedger = typeof walletLedger.$inferSelect;
export type InsertAiService = z.infer<typeof insertAiServiceSchema>;
export type AiService = typeof aiServices.$inferSelect;
export type InsertAiJob = z.infer<typeof insertAiJobSchema>;
export type AiJob = typeof aiJobs.$inferSelect;
export type InsertAiJobQuote = z.infer<typeof insertAiJobQuoteSchema>;
export type AiJobQuote = typeof aiJobQuotes.$inferSelect;
export type InsertAiJobOutput = z.infer<typeof insertAiJobOutputSchema>;
export type AiJobOutput = typeof aiJobOutputs.$inferSelect;
export type InsertAuditEnvelope = z.infer<typeof insertAuditEnvelopeSchema>;
export type AuditEnvelope = typeof auditEnvelopes.$inferSelect;
export type InsertDashboardView = z.infer<typeof insertDashboardViewSchema>;
export type DashboardView = typeof dashboardViews.$inferSelect;
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
export type Artifact = typeof artifacts.$inferSelect;
export type InsertAiJobApproval = z.infer<typeof insertAiJobApprovalSchema>;
export type AiJobApproval = typeof aiJobApprovals.$inferSelect;
export type InsertAiJobFile = z.infer<typeof insertAiJobFileSchema>;
export type AiJobFile = typeof aiJobFiles.$inferSelect;
export type InsertCompanyBillingConfig = z.infer<typeof insertCompanyBillingConfigSchema>;
export type CompanyBillingConfig = typeof companyBillingConfig.$inferSelect;
