import { Express, Request, Response } from "express";
import { requireAuth, requireAdmin } from "./auth";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  trackerProjects, trackerPhases, trackerTimeEntries,
  insertTrackerProjectSchema, insertTrackerPhaseSchema, insertTrackerTimeEntrySchema,
} from "@shared/schema";

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
      const allowedFields = ["name", "description", "totalEstimatedDays", "status", "healthScore", "clientId"];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      }
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.estimatedEndDate) updateData.estimatedEndDate = new Date(req.body.estimatedEndDate);
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

      const now = new Date();
      const startDate = project.startDate || project.createdAt;
      const daysConsumed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

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
      if (delayedPhases > 0 || (daysConsumed > totalEstimatedDays * 0.8 && progressPercent < 60)) {
        healthScore = "critical";
      } else if (daysConsumed > totalEstimatedDays * 0.5 && progressPercent < 40) {
        healthScore = "attention";
      }

      if (project.healthScore !== healthScore) {
        await db.update(trackerProjects)
          .set({ healthScore, updatedAt: new Date() })
          .where(eq(trackerProjects.id, req.params.id));
      }

      res.json({
        project: { ...project, healthScore },
        phases,
        summary: {
          totalPhases: phases.length,
          completedPhases,
          inProgressPhases,
          delayedPhases,
          notStartedPhases,
          totalEstimatedDays,
          daysConsumed,
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
