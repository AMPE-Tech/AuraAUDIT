import type { Express, Request, Response } from "express";
import { dashboardViews, users } from "@shared/schema";
import { requireAuth } from "./auth";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

const WIDGET_LIBRARY = [
  {
    id: "gastos-por-area",
    name: "Gastos por Área/CC",
    description: "Visualização de gastos segmentados por área ou centro de custo",
    icon: "PieChart",
    defaultConfig: { chartType: "pie", groupBy: "area" },
  },
  {
    id: "excecoes-policy",
    name: "Exceções de Política",
    description: "Exceções identificadas em relação às políticas corporativas",
    icon: "AlertTriangle",
    defaultConfig: { chartType: "bar", metric: "count" },
  },
  {
    id: "sla-performance",
    name: "Performance de SLA",
    description: "Acompanhamento de indicadores de SLA dos fornecedores",
    icon: "Activity",
    defaultConfig: { chartType: "line", period: "monthly" },
  },
  {
    id: "savings-tracker",
    name: "Savings Identificados",
    description: "Rastreamento de economias identificadas pela auditoria",
    icon: "TrendingUp",
    defaultConfig: { chartType: "area", cumulative: true },
  },
  {
    id: "risco-mapa",
    name: "Mapa de Riscos",
    description: "Mapeamento visual dos riscos identificados por categoria",
    icon: "Shield",
    defaultConfig: { chartType: "heatmap", axes: ["probability", "impact"] },
  },
  {
    id: "fornecedores-ranking",
    name: "Ranking de Fornecedores",
    description: "Classificação dos fornecedores por desempenho e compliance",
    icon: "Award",
    defaultConfig: { chartType: "bar", sortBy: "score", limit: 10 },
  },
  {
    id: "volume-mensal",
    name: "Volume Mensal Auditado",
    description: "Volume total auditado mês a mês",
    icon: "BarChart",
    defaultConfig: { chartType: "bar", period: "monthly" },
  },
  {
    id: "compliance-score",
    name: "Score de Compliance",
    description: "Pontuação geral de compliance da empresa",
    icon: "CheckCircle",
    defaultConfig: { chartType: "gauge", target: 100 },
  },
];

export function registerDashboardRoutes(app: Express) {
  app.get("/api/dashboard/widgets", (_req: Request, res: Response) => {
    res.json(WIDGET_LIBRARY);
  });

  app.get("/api/dashboard/views", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const views = await db
        .select()
        .from(dashboardViews)
        .where(
          sql`${dashboardViews.createdByUserId} = ${userId} OR ${dashboardViews.isPublished} = true`
        )
        .orderBy(desc(dashboardViews.createdAt));
      res.json(views);
    } catch (error: any) {
      console.error("Error fetching dashboard views:", error);
      res.status(500).json({ error: "Failed to fetch dashboard views" });
    }
  });

  app.post("/api/dashboard/views", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { name, description, layoutJson, filtersJson, widgetsJson, tags } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const [view] = await db
        .insert(dashboardViews)
        .values({
          createdByUserId: userId,
          name,
          description: description || null,
          layoutJson: layoutJson || null,
          filtersJson: filtersJson || null,
          widgetsJson: widgetsJson || null,
          tags: tags || null,
        })
        .returning();

      res.status(201).json(view);
    } catch (error: any) {
      console.error("Error creating dashboard view:", error);
      res.status(500).json({ error: "Failed to create dashboard view" });
    }
  });

  app.put("/api/dashboard/views/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const viewId = req.params.id;

      const rows = await db
        .select()
        .from(dashboardViews)
        .where(sql`${dashboardViews.id} = ${viewId}` as any);

      const existing = rows[0];
      if (!existing) {
        return res.status(404).json({ error: "View not found" });
      }

      if (existing.createdByUserId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this view" });
      }

      const { name, description, layoutJson, filtersJson, widgetsJson, tags } = req.body;

      const [updated] = await db
        .update(dashboardViews)
        .set({
          name: name ?? existing.name,
          description: description !== undefined ? description : existing.description,
          layoutJson: layoutJson !== undefined ? layoutJson : existing.layoutJson,
          filtersJson: filtersJson !== undefined ? filtersJson : existing.filtersJson,
          widgetsJson: widgetsJson !== undefined ? widgetsJson : existing.widgetsJson,
          tags: tags !== undefined ? tags : existing.tags,
          updatedAt: new Date(),
        })
        .where(sql`${dashboardViews.id} = ${viewId}` as any)
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating dashboard view:", error);
      res.status(500).json({ error: "Failed to update dashboard view" });
    }
  });

  app.delete("/api/dashboard/views/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const viewId = req.params.id;

      const rows = await db
        .select()
        .from(dashboardViews)
        .where(sql`${dashboardViews.id} = ${viewId}` as any);

      const existing = rows[0];
      if (!existing) {
        return res.status(404).json({ error: "View not found" });
      }

      if (existing.createdByUserId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this view" });
      }

      await db.delete(dashboardViews).where(sql`${dashboardViews.id} = ${viewId}` as any);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting dashboard view:", error);
      res.status(500).json({ error: "Failed to delete dashboard view" });
    }
  });

  app.post("/api/dashboard/views/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const viewId = req.params.id;

      const viewRows = await db
        .select()
        .from(dashboardViews)
        .where(sql`${dashboardViews.id} = ${viewId}` as any);

      const view = viewRows[0];
      if (!view) {
        return res.status(404).json({ error: "View not found" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const [updated] = await db
        .update(dashboardViews)
        .set({
          isPublished: !view.isPublished,
          updatedAt: new Date(),
        })
        .where(sql`${dashboardViews.id} = ${viewId}` as any)
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error publishing dashboard view:", error);
      res.status(500).json({ error: "Failed to publish dashboard view" });
    }
  });
}
