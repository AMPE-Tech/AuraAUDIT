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
