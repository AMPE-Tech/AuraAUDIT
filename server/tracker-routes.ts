import { Express, Request, Response } from "express";
import { requireAuth, requireAdmin } from "./auth";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  trackerProjects, trackerPhases, trackerTimeEntries,
  insertTrackerProjectSchema, insertTrackerPhaseSchema, insertTrackerTimeEntrySchema,
} from "@shared/schema";

function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function nextBusinessDay(date: Date): Date {
  const result = new Date(date);
  do {
    result.setDate(result.getDate() + 1);
  } while (!isBusinessDay(result));
  return result;
}

function addBusinessDays(start: Date, count: number): Date {
  if (count <= 0) return new Date(start);
  const result = new Date(start);
  let added = 0;
  while (added < count) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) added++;
  }
  return result;
}

function countBusinessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);
  if (current > endNorm) return 0;
  current.setDate(current.getDate() + 1);
  while (current <= endNorm) {
    if (isBusinessDay(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function calcEffectiveWorkDays(businessDaysElapsed: number, daysPerWeek: number): number {
  if (daysPerWeek >= 5) return businessDaysElapsed;
  const fullWeeks = Math.floor(businessDaysElapsed / 5);
  const remainderDays = businessDaysElapsed % 5;
  const effectiveRemainder = Math.min(remainderDays, daysPerWeek);
  return (fullWeeks * daysPerWeek) + effectiveRemainder;
}

function calcCalendarEndDate(start: Date, projectDays: number, daysPerWeek: number): Date {
  if (daysPerWeek >= 5) return addBusinessDays(start, projectDays);
  let workDaysPlaced = 0;
  const result = new Date(start);
  let weekDayCounter = 0;
  while (workDaysPlaced < projectDays) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      weekDayCounter++;
      if (weekDayCounter <= daysPerWeek) {
        workDaysPlaced++;
      }
      if (weekDayCounter >= 5) {
        weekDayCounter = 0;
      }
    }
  }
  return result;
}

async function getAuthorizedProject(req: Request, res: Response) {
  const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
  const [project] = await db.select().from(trackerProjects).where(eq(trackerProjects.id, req.params.id));
  if (!project) {
    res.status(404).json({ error: "Projeto nao encontrado" });
    return null;
  }
  if (user.role !== "admin" && project.clientId !== user.clientId) {
    res.status(403).json({ error: "Acesso negado" });
    return null;
  }
  return { project, user };
}

export function registerTrackerRoutes(app: Express) {

  app.get("/api/tracker/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let projects;
      if (user.role === "admin") {
        projects = await db.select().from(trackerProjects).orderBy(desc(trackerProjects.createdAt));
      } else {
        projects = await db.select().from(trackerProjects)
          .where(eq(trackerProjects.clientId, user.clientId || ""))
          .orderBy(desc(trackerProjects.createdAt));
      }
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tracker/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const auth = await getAuthorizedProject(req, res);
      if (!auth) return;
      res.json(auth.project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tracker/projects", requireAdmin, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, clientId: req.session.clientId };
      const parsed = insertTrackerProjectSchema.parse({
        ...req.body,
        createdByUserId: user.id,
        clientId: req.body.clientId || user.clientId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        estimatedEndDate: req.body.estimatedEndDate ? new Date(req.body.estimatedEndDate) : null,
        contractSignedAt: req.body.contractSignedAt ? new Date(req.body.contractSignedAt) : null,
      });
      const [project] = await db.insert(trackerProjects).values(parsed).returning();
      res.json(project);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tracker/projects/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const updateData: any = { updatedAt: new Date() };
      const allowedFields = ["name", "description", "totalEstimatedDays", "status", "healthScore", "clientId", "gracePeriodDays", "daysPerWeek"];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      }
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.estimatedEndDate) updateData.estimatedEndDate = new Date(req.body.estimatedEndDate);
      if (req.body.contractSignedAt) updateData.contractSignedAt = new Date(req.body.contractSignedAt);
      const [updated] = await db.update(trackerProjects).set(updateData).where(eq(trackerProjects.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ error: "Projeto nao encontrado" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tracker/projects/:id/phases", requireAuth, async (req: Request, res: Response) => {
    try {
      const auth = await getAuthorizedProject(req, res);
      if (!auth) return;
      const phases = await db.select().from(trackerPhases)
        .where(eq(trackerPhases.projectId, req.params.id))
        .orderBy(trackerPhases.orderIndex);
      res.json(phases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tracker/projects/:id/phases", requireAdmin, async (req: Request, res: Response) => {
    try {
      const parsed = insertTrackerPhaseSchema.parse({
        ...req.body,
        projectId: req.params.id,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        estimatedEndDate: req.body.estimatedEndDate ? new Date(req.body.estimatedEndDate) : null,
        actualEndDate: req.body.actualEndDate ? new Date(req.body.actualEndDate) : null,
      });
      const [phase] = await db.insert(trackerPhases).values(parsed).returning();
      res.json(phase);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tracker/phases/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const updateData: any = { updatedAt: new Date() };
      const allowedFields = ["name", "orderIndex", "estimatedDays", "status", "deliverables"];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      }
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.estimatedEndDate) updateData.estimatedEndDate = new Date(req.body.estimatedEndDate);
      if (req.body.actualEndDate) updateData.actualEndDate = new Date(req.body.actualEndDate);
      const [updated] = await db.update(trackerPhases).set(updateData).where(eq(trackerPhases.id, req.params.id)).returning();
      if (!updated) return res.status(404).json({ error: "Fase nao encontrada" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tracker/phases/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(trackerPhases).where(eq(trackerPhases.id, req.params.id));
      res.json({ message: "Fase removida" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tracker/projects/:id/time-entries", requireAuth, async (req: Request, res: Response) => {
    try {
      const auth = await getAuthorizedProject(req, res);
      if (!auth) return;
      const entries = await db.select().from(trackerTimeEntries)
        .where(eq(trackerTimeEntries.projectId, req.params.id))
        .orderBy(desc(trackerTimeEntries.date));
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tracker/projects/:id/time-entries", requireAdmin, async (req: Request, res: Response) => {
    try {
      const parsed = insertTrackerTimeEntrySchema.parse({
        ...req.body,
        projectId: req.params.id,
        date: req.body.date ? new Date(req.body.date) : new Date(),
      });
      const [entry] = await db.insert(trackerTimeEntries).values(parsed).returning();
      res.json(entry);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tracker/time-entries/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(trackerTimeEntries).where(eq(trackerTimeEntries.id, req.params.id));
      res.json({ message: "Entrada removida" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tracker/projects/:id/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const auth = await getAuthorizedProject(req, res);
      if (!auth) return;
      const { project } = auth;

      const phases = await db.select().from(trackerPhases)
        .where(eq(trackerPhases.projectId, req.params.id))
        .orderBy(trackerPhases.orderIndex);

      const timeEntries = await db.select().from(trackerTimeEntries)
        .where(eq(trackerTimeEntries.projectId, req.params.id));

      const completedPhases = phases.filter(p => p.status === "completed").length;
      const inProgressPhases = phases.filter(p => p.status === "in_progress").length;
      const delayedPhases = phases.filter(p => p.status === "delayed").length;
      const notStartedPhases = phases.filter(p => p.status === "not_started").length;

      const totalEstimatedDays = phases.reduce((sum, p) => sum + p.estimatedDays, 0);
      const daysPerWeek = project.daysPerWeek || 5;
      const gracePeriodDays = project.gracePeriodDays || 5;

      const contractDate = project.contractSignedAt;
      const effectiveStartDate = contractDate
        ? addBusinessDays(contractDate, gracePeriodDays)
        : (project.startDate || project.createdAt);

      const now = new Date();
      const businessDaysElapsed = now >= effectiveStartDate
        ? countBusinessDaysBetween(effectiveStartDate, now)
        : 0;
      const effectiveWorkDaysConsumed = calcEffectiveWorkDays(businessDaysElapsed, daysPerWeek);

      const projectedEndDate = calcCalendarEndDate(effectiveStartDate, totalEstimatedDays, daysPerWeek);

      const progressPercent = phases.length > 0
        ? Math.round((completedPhases / phases.length) * 100)
        : 0;

      const clientHours = timeEntries
        .filter(e => e.category === "client_response")
        .reduce((sum, e) => sum + parseFloat(e.hours), 0);
      const auditHours = timeEntries
        .filter(e => e.category === "audit_analysis")
        .reduce((sum, e) => sum + parseFloat(e.hours), 0);
      const systemHours = timeEntries
        .filter(e => e.category === "system_processing")
        .reduce((sum, e) => sum + parseFloat(e.hours), 0);
      const totalHours = clientHours + auditHours + systemHours;

      let healthScore: "on_track" | "attention" | "critical" = "on_track";
      if (delayedPhases > 0 || (effectiveWorkDaysConsumed > totalEstimatedDays * 0.8 && progressPercent < 60)) {
        healthScore = "critical";
      } else if (effectiveWorkDaysConsumed > totalEstimatedDays * 0.5 && progressPercent < 40) {
        healthScore = "attention";
      }

      if (project.healthScore !== healthScore) {
        await db.update(trackerProjects)
          .set({ healthScore, updatedAt: new Date() })
          .where(eq(trackerProjects.id, req.params.id));
      }

      const phaseSchedule = [];
      let phaseStart = new Date(effectiveStartDate);
      if (!isBusinessDay(phaseStart)) phaseStart = nextBusinessDay(phaseStart);
      for (const phase of phases) {
        const phaseEnd = calcCalendarEndDate(phaseStart, phase.estimatedDays, daysPerWeek);
        phaseSchedule.push({
          phaseId: phase.id,
          name: phase.name,
          calculatedStart: phaseStart.toISOString(),
          calculatedEnd: phaseEnd.toISOString(),
          estimatedDays: phase.estimatedDays,
          calendarDays: countBusinessDaysBetween(phaseStart, phaseEnd),
        });
        phaseStart = nextBusinessDay(phaseEnd);
      }

      res.json({
        project: { ...project, healthScore },
        phases,
        phaseSchedule,
        summary: {
          totalPhases: phases.length,
          completedPhases,
          inProgressPhases,
          delayedPhases,
          notStartedPhases,
          totalEstimatedDays,
          daysPerWeek,
          gracePeriodDays,
          contractSignedAt: contractDate?.toISOString() || null,
          effectiveStartDate: effectiveStartDate.toISOString(),
          projectedEndDate: projectedEndDate.toISOString(),
          businessDaysElapsed,
          effectiveWorkDaysConsumed,
          progressPercent,
          healthScore,
        },
        timeBreakdown: {
          clientResponseHours: clientHours,
          auditAnalysisHours: auditHours,
          systemProcessingHours: systemHours,
          totalHours,
          clientPercent: totalHours > 0 ? Math.round((clientHours / totalHours) * 100) : 0,
          auditPercent: totalHours > 0 ? Math.round((auditHours / totalHours) * 100) : 0,
          systemPercent: totalHours > 0 ? Math.round((systemHours / totalHours) * 100) : 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
