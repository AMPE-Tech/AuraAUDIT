import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, expenses, auditCases, anomalies, auditTrail,
  type InsertUser, type User,
  type InsertExpense, type Expense,
  type InsertAuditCase, type AuditCase,
  type InsertAnomaly, type Anomaly,
  type InsertAuditTrail, type AuditTrail,
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

  getAuditTrail(): Promise<AuditTrail[]>;
  createAuditTrailEntry(entry: InsertAuditTrail): Promise<AuditTrail>;
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

  async getAuditTrail(): Promise<AuditTrail[]> {
    return db.select().from(auditTrail).orderBy(desc(auditTrail.timestamp));
  }

  async createAuditTrailEntry(entry: InsertAuditTrail): Promise<AuditTrail> {
    const [created] = await db.insert(auditTrail).values(entry).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
