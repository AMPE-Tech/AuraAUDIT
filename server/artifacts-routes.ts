import { Express, Request, Response } from "express";
import { artifacts } from "@shared/schema";
import { requireAuth } from "./auth";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { createHash } from "crypto";

const VALID_TYPES = ["ai_output", "official", "quick"] as const;
const VALID_STATUSES = ["draft", "reviewed", "approved"] as const;
const VALID_TRANSITIONS: Record<string, string> = {
  draft: "reviewed",
  reviewed: "approved",
};

export function registerArtifactsRoutes(app: Express) {
  app.get("/api/reports/artifacts", requireAuth, async (req: Request, res: Response) => {
    try {
      const typeFilter = req.query.type as string | undefined;

      let results;
      if (typeFilter && VALID_TYPES.includes(typeFilter as any)) {
        results = await db
          .select()
          .from(artifacts)
          .where(eq(artifacts.type, typeFilter))
          .orderBy(desc(artifacts.createdAt));
      } else {
        results = await db
          .select()
          .from(artifacts)
          .orderBy(desc(artifacts.createdAt));
      }

      res.json(results);
    } catch (error: any) {
      console.error("Error listing artifacts:", error);
      res.status(500).json({ error: "Failed to list artifacts" });
    }
  });

  app.get("/api/reports/artifacts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [artifact] = await db
        .select()
        .from(artifacts)
        .where(eq(artifacts.id, id));

      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }

      res.json(artifact);
    } catch (error: any) {
      console.error("Error getting artifact:", error);
      res.status(500).json({ error: "Failed to get artifact" });
    }
  });

  app.post("/api/reports/artifacts", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { type, title, content, storageRef, sourceRefsJson } = req.body;

      if (!type || !VALID_TYPES.includes(type)) {
        return res.status(400).json({ error: "Invalid type. Must be one of: ai_output, official, quick" });
      }
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Title is required" });
      }

      let sha256: string | null = null;
      if (content && typeof content === "string") {
        sha256 = createHash("sha256").update(content, "utf8").digest("hex");
      }

      const [artifact] = await db
        .insert(artifacts)
        .values({
          companyId: user.clientId || null,
          createdByUserId: user.id,
          type,
          title: title.trim(),
          status: "draft",
          content: content || null,
          storageRef: storageRef || null,
          sha256,
          sourceRefsJson: sourceRefsJson || null,
        })
        .returning();

      res.status(201).json(artifact);
    } catch (error: any) {
      console.error("Error creating artifact:", error);
      res.status(500).json({ error: "Failed to create artifact" });
    }
  });

  app.put("/api/reports/artifacts/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be one of: draft, reviewed, approved" });
      }

      const [existing] = await db
        .select()
        .from(artifacts)
        .where(eq(artifacts.id, id));

      if (!existing) {
        return res.status(404).json({ error: "Artifact not found" });
      }

      const expectedNext = VALID_TRANSITIONS[existing.status];
      if (status !== expectedNext) {
        return res.status(400).json({
          error: `Invalid transition. Can only go from '${existing.status}' to '${expectedNext}'`,
        });
      }

      const [updated] = await db
        .update(artifacts)
        .set({ status })
        .where(eq(artifacts.id, id))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating artifact status:", error);
      res.status(500).json({ error: "Failed to update artifact status" });
    }
  });

  app.get("/api/reports/artifacts/:id/download", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [artifact] = await db
        .select()
        .from(artifacts)
        .where(eq(artifacts.id, id));

      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }

      if (!artifact.content) {
        return res.status(404).json({ error: "Artifact has no content to download" });
      }

      const sha256 = artifact.sha256 || createHash("sha256").update(artifact.content, "utf8").digest("hex");

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("X-SHA256", sha256);
      res.setHeader("Content-Disposition", `attachment; filename="${artifact.title}.txt"`);
      res.send(artifact.content);
    } catch (error: any) {
      console.error("Error downloading artifact:", error);
      res.status(500).json({ error: "Failed to download artifact" });
    }
  });
}
