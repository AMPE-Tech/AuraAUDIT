/**
 * Rotas de status do projeto Stabia
 *
 * GET  /api/stabia/status              → JSON público com progresso (consumido pelo HTML mobile)
 * PATCH /api/stabia/source-status      → Atualiza status de uma fonte de dados
 * PATCH /api/stabia/reconciliation-status → Atualiza status de reconciliação
 * PATCH /api/stabia/deliverable-status → Atualiza status de entregável
 *
 * DESTINO NO REPLIT: server/stabia-status-routes.ts
 *
 * REGISTRO em server/index.ts:
 *   import { registerStabiaStatusRoutes } from "./stabia-status-routes";
 *   registerStabiaStatusRoutes(app);
 */

import type { Express } from "express";
import fs from "fs";
import path from "path";

// ── Status file path ──────────────────────────────────────────────────
const STATUS_FILE = path.join(process.cwd(), "data", "stabia-status.json");

function readStatus() {
  try {
    if (!fs.existsSync(STATUS_FILE)) return null;
    return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function writeStatus(data: any) {
  const dir = path.dirname(STATUS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ── Defaults ──────────────────────────────────────────────────────────
const DEFAULT_SOURCES = [
  "obt", "erp", "cards", "gds", "bsp", "agencies", "contracts", "reports",
];
const DEFAULT_RECONCILIATIONS = [
  "obt-erp", "cards-reservations", "bsp-airlines", "hotel-invoices", "fees-rebates",
];
const DEFAULT_DELIVERABLES = [
  "exec-report", "tech-report", "risk-matrix", "legal-opinion",
  "action-plan", "dashboard", "custody-chain",
];

// ── Phases — alinhado com plano de ação aprovado (abril/2026) ─────────
const PHASES = [
  {
    phase: "Fase 1", title: "Coleta, Acesso e Integrações Críticas",
    dates: "04/04 – 18/04/2026", days: "Dias 1–15", badge: "Fundação", tasks_total: 6,
  },
  {
    phase: "Fase 2", title: "Ingestão, Normalização e Agente GUARDIAN",
    dates: "19/04 – 18/05/2026", days: "Dias 16–45", badge: "Setup", tasks_total: 5,
  },
  {
    phase: "Fase 3", title: "Reconciliação, LAUNCHER e CONCILIATOR",
    dates: "19/05 – 17/06/2026", days: "Dias 46–75", badge: "Execução", tasks_total: 5,
  },
  {
    phase: "Fase 4", title: "REPORTER, Validação e Go-live MVP",
    dates: "18/06 – 03/07/2026", days: "Dias 76–90", badge: "Go-live", tasks_total: 4,
  },
];

// ── CORS headers ──────────────────────────────────────────────────────
function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ══════════════════════════════════════════════════════════════════════
export function registerStabiaStatusRoutes(app: Express) {

  // ── OPTIONS (CORS preflight) ────────────────────────────────────────
  app.options("/api/stabia/*", (_req, res) => {
    setCors(res);
    res.sendStatus(204);
  });

  // ── GET /api/stabia/status ──────────────────────────────────────────
  app.get("/api/stabia/status", (_req, res) => {
    try {
      setCors(res);
      res.setHeader("Cache-Control", "public, max-age=30");

      const raw = readStatus() || {};
      const sources = raw.sources || DEFAULT_SOURCES.map((id) => ({ id, status: "pending" }));
      const recons = raw.reconciliations || DEFAULT_RECONCILIATIONS.map((id) => ({ id, status: "pending" }));
      const delivs = raw.deliverables || DEFAULT_DELIVERABLES.map((id) => ({ id, status: "pending" }));

      const response = {
        project: {
          client: "Grupo Stabia",
          kickoff: "2026-04-04",
          golive: "2026-07-03",
          days_total: 90,
        },
        sources: {
          total: sources.length,
          received: sources.filter((s: any) => s.status === "received").length,
          items: sources,
        },
        reconciliations: {
          total: recons.length,
          done: recons.filter((r: any) => r.status === "done").length,
          items: recons,
        },
        deliverables: {
          total: delivs.length,
          delivered: delivs.filter((d: any) => d.status === "delivered" || d.status === "approved").length,
          items: delivs,
        },
        phases: PHASES.map((p) => ({
          ...p,
          tasks_done: 0, // TODO: ler do roadmap-data quando integrado
        })),
        updated_at: new Date().toISOString(),
      };

      res.json(response);
    } catch (err) {
      console.error("[stabia-status] Erro:", err);
      res.status(500).json({ error: "Erro ao buscar status" });
    }
  });

  // ── PATCH /api/stabia/source-status ─────────────────────────────────
  app.patch("/api/stabia/source-status", (req, res) => {
    try {
      setCors(res);
      const { sourceId, status } = req.body;
      if (!sourceId || !status) {
        return res.status(400).json({ error: "sourceId e status são obrigatórios" });
      }
      const valid = ["pending", "received", "partial", "processing"];
      if (!valid.includes(status)) {
        return res.status(400).json({ error: `Status inválido. Use: ${valid.join(", ")}` });
      }

      const data = readStatus() || {
        sources: DEFAULT_SOURCES.map((id) => ({ id, status: "pending" })),
        reconciliations: DEFAULT_RECONCILIATIONS.map((id) => ({ id, status: "pending" })),
        deliverables: DEFAULT_DELIVERABLES.map((id) => ({ id, status: "pending" })),
      };

      const src = data.sources.find((s: any) => s.id === sourceId);
      if (src) {
        src.status = status;
        if (status === "received") src.received_at = new Date().toISOString();
      } else {
        data.sources.push({
          id: sourceId, status,
          received_at: status === "received" ? new Date().toISOString() : undefined,
        });
      }

      writeStatus(data);
      res.json({ ok: true, sourceId, status });
    } catch (err) {
      console.error("[stabia-source-status] Erro:", err);
      res.status(500).json({ error: "Erro ao atualizar" });
    }
  });

  // ── PATCH /api/stabia/reconciliation-status ─────────────────────────
  app.patch("/api/stabia/reconciliation-status", (req, res) => {
    try {
      setCors(res);
      const { reconciliationId, status } = req.body;
      if (!reconciliationId || !status) {
        return res.status(400).json({ error: "reconciliationId e status são obrigatórios" });
      }

      const data = readStatus() || {
        sources: DEFAULT_SOURCES.map((id) => ({ id, status: "pending" })),
        reconciliations: DEFAULT_RECONCILIATIONS.map((id) => ({ id, status: "pending" })),
        deliverables: DEFAULT_DELIVERABLES.map((id) => ({ id, status: "pending" })),
      };

      const item = data.reconciliations.find((r: any) => r.id === reconciliationId);
      if (item) { item.status = status; } else { data.reconciliations.push({ id: reconciliationId, status }); }

      writeStatus(data);
      res.json({ ok: true, reconciliationId, status });
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar" });
    }
  });

  // ── PATCH /api/stabia/deliverable-status ────────────────────────────
  app.patch("/api/stabia/deliverable-status", (req, res) => {
    try {
      setCors(res);
      const { deliverableId, status } = req.body;
      if (!deliverableId || !status) {
        return res.status(400).json({ error: "deliverableId e status são obrigatórios" });
      }

      const data = readStatus() || {
        sources: DEFAULT_SOURCES.map((id) => ({ id, status: "pending" })),
        reconciliations: DEFAULT_RECONCILIATIONS.map((id) => ({ id, status: "pending" })),
        deliverables: DEFAULT_DELIVERABLES.map((id) => ({ id, status: "pending" })),
      };

      const item = data.deliverables.find((d: any) => d.id === deliverableId);
      if (item) { item.status = status; } else { data.deliverables.push({ id: deliverableId, status }); }

      writeStatus(data);
      res.json({ ok: true, deliverableId, status });
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar" });
    }
  });

  console.log("[stabia] Rotas de status registradas: GET /api/stabia/status + 3x PATCH");
}
