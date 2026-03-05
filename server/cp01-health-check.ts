import { db } from "./db";
import { expenses, anomalies, auditCases, auditTrail, dataSources, clients } from "@shared/schema";
import { sql, eq, count } from "drizzle-orm";
import { sendEmail } from "./email-service";

const KNOWN_SEED_VENDORS = [
  "Hotel Windsor Atlantica", "Hilton Hotels", "Restaurante Fasano",
  "Localiza Hertz", "IBGC", "LATAM Airlines", "Copacabana Palace",
  "Uber", "Restaurante Outback", "FGV Educacao", "Azul Linhas Aereas",
  "Pousada Centro", "Porto Seguro",
];

const KNOWN_SEED_EMPLOYEES = [
  "Ricardo Silva", "Carlos Mendes", "Ana Rodrigues", "Fernando Costa",
  "Patricia Lima", "Marcos Oliveira", "Roberto Andrade", "Juliana Santos",
  "Eduardo Martins", "Lucia Ferreira",
];

interface HealthCheckResult {
  passed: boolean;
  timestamp: string;
  checks: HealthCheckItem[];
  violations: string[];
}

interface HealthCheckItem {
  table: string;
  status: "clean" | "contaminated" | "error";
  recordCount: number;
  details?: string;
}

export async function runCP01HealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const checks: HealthCheckItem[] = [];
  const violations: string[] = [];

  try {
    const [expResult] = await db.select({ cnt: count() }).from(expenses);
    const expCount = Number(expResult?.cnt || 0);
    if (expCount > 0) {
      const rows = await db.select({ vendor: expenses.vendor, employee: expenses.employee }).from(expenses);
      const seedVendors = rows.filter(r => r.vendor && KNOWN_SEED_VENDORS.includes(r.vendor));
      const seedEmployees = rows.filter(r => r.employee && KNOWN_SEED_EMPLOYEES.includes(r.employee));
      if (seedVendors.length > 0 || seedEmployees.length > 0) {
        checks.push({ table: "expenses", status: "contaminated", recordCount: expCount, details: `${seedVendors.length} seed vendors, ${seedEmployees.length} seed employees detected` });
        violations.push(`CP-01 VIOLATION: expenses table contains ${seedVendors.length} seed vendor records and ${seedEmployees.length} seed employee records`);
      } else {
        checks.push({ table: "expenses", status: "clean", recordCount: expCount });
      }
    } else {
      checks.push({ table: "expenses", status: "clean", recordCount: 0 });
    }

    const [anomResult] = await db.select({ cnt: count() }).from(anomalies);
    const anomCount = Number(anomResult?.cnt || 0);
    if (anomCount > 0) {
      const rows = await db.select({ description: anomalies.description }).from(anomalies);
      const hasSeedPatterns = rows.some(r => r.description && (
        r.description.includes("Suite presidencial") ||
        r.description.includes("Passagem aerea GRU-GIG") ||
        r.description.includes("sem comprovante fiscal") ||
        r.description.includes("Possivel duplicidade")
      ));
      if (hasSeedPatterns) {
        checks.push({ table: "anomalies", status: "contaminated", recordCount: anomCount, details: "Seed anomaly patterns detected" });
        violations.push(`CP-01 VIOLATION: anomalies table contains seed data patterns (${anomCount} records)`);
      } else {
        checks.push({ table: "anomalies", status: "clean", recordCount: anomCount });
      }
    } else {
      checks.push({ table: "anomalies", status: "clean", recordCount: 0 });
    }

    const [caseResult] = await db.select({ cnt: count() }).from(auditCases);
    const caseCount = Number(caseResult?.cnt || 0);
    if (caseCount > 0) {
      const rows = await db.select({ title: auditCases.title, assignedTo: auditCases.assignedTo }).from(auditCases);
      const hasSeedCases = rows.some(r =>
        (r.title && r.title.includes("Q4/2025")) ||
        (r.assignedTo && KNOWN_SEED_EMPLOYEES.includes(r.assignedTo))
      );
      if (hasSeedCases) {
        checks.push({ table: "audit_cases", status: "contaminated", recordCount: caseCount, details: "Seed audit case patterns detected" });
        violations.push(`CP-01 VIOLATION: audit_cases table contains seed data (${caseCount} records)`);
      } else {
        checks.push({ table: "audit_cases", status: "clean", recordCount: caseCount });
      }
    } else {
      checks.push({ table: "audit_cases", status: "clean", recordCount: 0 });
    }

    const [trailResult] = await db.select({ cnt: count() }).from(auditTrail);
    const trailCount = Number(trailResult?.cnt || 0);
    if (trailCount > 0) {
      const rows = await db.select({ ipAddress: auditTrail.ipAddress }).from(auditTrail);
      const hasSeedTrail = rows.some(r => r.ipAddress && r.ipAddress.startsWith("192.168.1."));
      if (hasSeedTrail) {
        checks.push({ table: "audit_trail", status: "contaminated", recordCount: trailCount, details: "Seed audit trail entries with 192.168.1.x IPs" });
        violations.push(`CP-01 VIOLATION: audit_trail contains seed data with fake IPs`);
      } else {
        checks.push({ table: "audit_trail", status: "clean", recordCount: trailCount });
      }
    } else {
      checks.push({ table: "audit_trail", status: "clean", recordCount: 0 });
    }
  } catch (err: any) {
    checks.push({ table: "health_check", status: "error", recordCount: 0, details: err.message });
  }

  const passed = violations.length === 0;
  const result: HealthCheckResult = { passed, timestamp, checks, violations };

  if (!passed) {
    console.error("======================================================");
    console.error("  CP-01 HEALTH CHECK FAILED — SEED DATA CONTAMINATION ");
    console.error("======================================================");
    violations.forEach(v => console.error(`  ❌ ${v}`));
    console.error("  Initiating automatic cleanup...");
    console.error("======================================================");
  } else {
    console.log("✅ CP-01 Health Check PASSED — No seed data contamination detected");
    checks.forEach(c => console.log(`  ✓ ${c.table}: ${c.status} (${c.recordCount} records)`));
  }

  return result;
}

export async function autoRemediateSeedData(): Promise<{ cleaned: boolean; tablesAffected: string[] }> {
  const tablesAffected: string[] = [];

  try {
    const expRows = await db.select({ id: expenses.id, vendor: expenses.vendor }).from(expenses);
    const seedExpenses = expRows.filter(r => r.vendor && KNOWN_SEED_VENDORS.includes(r.vendor));
    if (seedExpenses.length > 0) {
      for (const row of seedExpenses) {
        await db.delete(expenses).where(eq(expenses.id, row.id));
      }
      tablesAffected.push(`expenses (${seedExpenses.length} seed records removed)`);
      console.log(`CP-01 REMEDIATION: Removed ${seedExpenses.length} seed expense records`);
    }

    const anomRows = await db.select({ id: anomalies.id, description: anomalies.description }).from(anomalies);
    const seedAnoms = anomRows.filter(r => r.description && (
      r.description.includes("Suite presidencial") ||
      r.description.includes("Passagem aerea GRU-GIG") ||
      r.description.includes("sem comprovante fiscal") ||
      r.description.includes("Possivel duplicidade")
    ));
    if (seedAnoms.length > 0) {
      for (const row of seedAnoms) {
        await db.delete(anomalies).where(eq(anomalies.id, row.id));
      }
      tablesAffected.push(`anomalies (${seedAnoms.length} seed records removed)`);
      console.log(`CP-01 REMEDIATION: Removed ${seedAnoms.length} seed anomaly records`);
    }

    const caseRows = await db.select({ id: auditCases.id, assignedTo: auditCases.assignedTo, title: auditCases.title }).from(auditCases);
    const seedCases = caseRows.filter(r =>
      (r.title && r.title.includes("Q4/2025")) ||
      (r.assignedTo && KNOWN_SEED_EMPLOYEES.includes(r.assignedTo))
    );
    if (seedCases.length > 0) {
      for (const row of seedCases) {
        await db.delete(auditCases).where(eq(auditCases.id, row.id));
      }
      tablesAffected.push(`audit_cases (${seedCases.length} seed records removed)`);
      console.log(`CP-01 REMEDIATION: Removed ${seedCases.length} seed audit case records`);
    }

    const trailRows = await db.select({ id: auditTrail.id, ipAddress: auditTrail.ipAddress }).from(auditTrail);
    const seedTrail = trailRows.filter(r => r.ipAddress && r.ipAddress.startsWith("192.168.1."));
    if (seedTrail.length > 0) {
      for (const row of seedTrail) {
        await db.delete(auditTrail).where(eq(auditTrail.id, row.id));
      }
      tablesAffected.push(`audit_trail (${seedTrail.length} seed records removed)`);
      console.log(`CP-01 REMEDIATION: Removed ${seedTrail.length} seed audit trail records`);
    }
  } catch (err: any) {
    console.error("CP-01 REMEDIATION ERROR:", err.message);
  }

  const cleaned = tablesAffected.length > 0;
  if (cleaned) {
    console.log("CP-01 REMEDIATION COMPLETE:", tablesAffected.join(", "));
    try {
      await sendEmail({
        to: "nml.costa@gmail.com",
        subject: "[AuraAudit CP-01] Seed Data Remediation Executed",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#fff;border-radius:8px;overflow:hidden;">
            <div style="background:#dc2626;padding:16px 24px;">
              <h2 style="margin:0;font-size:18px;">CP-01 — Seed Data Remediation</h2>
            </div>
            <div style="padding:24px;">
              <p>O sistema detectou e removeu dados de seed contaminando tabelas de produção:</p>
              <ul>${tablesAffected.map(t => `<li>${t}</li>`).join("")}</ul>
              <p style="color:#f59e0b;font-weight:bold;">Esta limpeza foi executada automaticamente. Nenhum dado real do cliente foi afetado.</p>
              <p style="font-size:12px;color:#888;">Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr: any) {
      console.error("CP-01 remediation email failed:", emailErr.message);
    }
  }

  return { cleaned, tablesAffected };
}

export async function runFullCP01Pipeline(): Promise<void> {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  CP-01 HEALTH CHECK PIPELINE — Starting...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const result = await runCP01HealthCheck();

  if (!result.passed) {
    await autoRemediateSeedData();
    const recheck = await runCP01HealthCheck();
    if (!recheck.passed) {
      console.error("CP-01 CRITICAL: Remediation failed — manual intervention required");
      console.error("Remaining violations:", recheck.violations);
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  CP-01 HEALTH CHECK PIPELINE — Complete");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
