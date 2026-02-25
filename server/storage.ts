import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, expenses, auditCases, anomalies, auditTrail, clients, dataSources, proposals,
  type InsertUser, type User,
  type InsertExpense, type Expense,
  type InsertAuditCase, type AuditCase,
  type InsertAnomaly, type Anomaly,
  type InsertAuditTrail, type AuditTrail,
  type InsertClient, type Client,
  type InsertDataSource, type DataSource,
  type InsertProposal, type Proposal,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;

  getAuditCases(): Promise<AuditCase[]>;
  getAuditCase(id: string): Promise<AuditCase | undefined>;
  createAuditCase(auditCase: InsertAuditCase): Promise<AuditCase>;
  updateAuditCase(id: string, auditCase: Partial<InsertAuditCase>): Promise<AuditCase | undefined>;

  getAnomalies(): Promise<Anomaly[]>;
  getAnomaly(id: string): Promise<Anomaly | undefined>;
  createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  updateAnomaly(id: string, data: Partial<Anomaly>): Promise<Anomaly | undefined>;

  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientsByType(type: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined>;

  getDataSources(): Promise<DataSource[]>;
  getDataSource(id: string): Promise<DataSource | undefined>;
  getDataSourcesByClient(clientId: string): Promise<DataSource[]>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: string, data: Partial<InsertDataSource>): Promise<DataSource | undefined>;

  getAuditTrail(): Promise<AuditTrail[]>;
  createAuditTrailEntry(entry: InsertAuditTrail): Promise<AuditTrail>;

  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByClient(clientId: string): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, data: Partial<InsertProposal>): Promise<Proposal | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [created] = await db.insert(expenses).values(expense).returning();
    return created;
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return updated;
  }

  async getAuditCases(): Promise<AuditCase[]> {
    return db.select().from(auditCases).orderBy(desc(auditCases.createdAt));
  }

  async getAuditCase(id: string): Promise<AuditCase | undefined> {
    const [auditCase] = await db.select().from(auditCases).where(eq(auditCases.id, id));
    return auditCase;
  }

  async createAuditCase(auditCase: InsertAuditCase): Promise<AuditCase> {
    const [created] = await db.insert(auditCases).values(auditCase).returning();
    return created;
  }

  async updateAuditCase(id: string, data: Partial<InsertAuditCase>): Promise<AuditCase | undefined> {
    const [updated] = await db.update(auditCases).set({ ...data, updatedAt: new Date() }).where(eq(auditCases.id, id)).returning();
    return updated;
  }

  async getAnomalies(): Promise<Anomaly[]> {
    return db.select().from(anomalies).orderBy(desc(anomalies.detectedAt));
  }

  async getAnomaly(id: string): Promise<Anomaly | undefined> {
    const [anomaly] = await db.select().from(anomalies).where(eq(anomalies.id, id));
    return anomaly;
  }

  async createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly> {
    const [created] = await db.insert(anomalies).values(anomaly).returning();
    return created;
  }

  async updateAnomaly(id: string, data: Partial<Anomaly>): Promise<Anomaly | undefined> {
    const [updated] = await db.update(anomalies).set(data).where(eq(anomalies.id, id)).returning();
    return updated;
  }

  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientsByType(type: string): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.type, type)).orderBy(desc(clients.createdAt));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db.update(clients).set({ ...data, updatedAt: new Date() }).where(eq(clients.id, id)).returning();
    return updated;
  }

  async getDataSources(): Promise<DataSource[]> {
    return db.select().from(dataSources).orderBy(desc(dataSources.createdAt));
  }

  async getDataSource(id: string): Promise<DataSource | undefined> {
    const [ds] = await db.select().from(dataSources).where(eq(dataSources.id, id));
    return ds;
  }

  async getDataSourcesByClient(clientId: string): Promise<DataSource[]> {
    return db.select().from(dataSources).where(eq(dataSources.clientId, clientId)).orderBy(desc(dataSources.createdAt));
  }

  async createDataSource(dataSource: InsertDataSource): Promise<DataSource> {
    const [created] = await db.insert(dataSources).values(dataSource).returning();
    return created;
  }

  async updateDataSource(id: string, data: Partial<InsertDataSource>): Promise<DataSource | undefined> {
    const [updated] = await db.update(dataSources).set({ ...data, updatedAt: new Date() }).where(eq(dataSources.id, id)).returning();
    return updated;
  }

  async getAuditTrail(): Promise<AuditTrail[]> {
    return db.select().from(auditTrail).orderBy(desc(auditTrail.timestamp));
  }

  async createAuditTrailEntry(entry: InsertAuditTrail): Promise<AuditTrail> {
    const [created] = await db.insert(auditTrail).values(entry).returning();
    return created;
  }

  async getProposals(): Promise<Proposal[]> {
    return db.select().from(proposals).orderBy(desc(proposals.createdAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal;
  }

  async getProposalsByClient(clientId: string): Promise<Proposal[]> {
    return db.select().from(proposals).where(eq(proposals.clientId, clientId)).orderBy(desc(proposals.createdAt));
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [created] = await db.insert(proposals).values(proposal).returning();
    return created;
  }

  async updateProposal(id: string, data: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const [updated] = await db.update(proposals).set({ ...data, updatedAt: new Date() }).where(eq(proposals.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
