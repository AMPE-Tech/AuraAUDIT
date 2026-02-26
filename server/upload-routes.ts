import { Express, Request, Response } from "express";
import { db } from "./db";
import { clientUploads } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { createHash } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const VALID_DOCUMENT_KEYS = [
  "obt-reserve", "obt-argo", "backoffice-wintour", "backoffice-stur",
  "bradesco-ebta", "gds-sabre-amadeus", "bsplink", "management-files",
  "politica-viagens", "tabela-aprovadores",
];

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      ".csv", ".xlsx", ".xls", ".pdf", ".doc", ".docx",
      ".txt", ".zip", ".rar", ".7z", ".json", ".xml",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo nao permitido: ${ext}`));
    }
  },
});

export function registerUploadRoutes(app: Express) {
  app.get("/api/uploads", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const uploads = await db
        .select()
        .from(clientUploads)
        .where(eq(clientUploads.userId, userId))
        .orderBy(desc(clientUploads.uploadedAt));
      res.json({ uploads });
    } catch (error: any) {
      console.error("Error fetching uploads:", error.message);
      res.status(500).json({ error: "Failed to fetch uploads" });
    }
  });

  app.post(
    "/api/uploads",
    requireAuth,
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const { documentKey } = req.body;
        if (!documentKey || !VALID_DOCUMENT_KEYS.includes(documentKey)) {
          return res.status(400).json({ error: "documentKey invalido" });
        }

        const userId = req.session.userId!;
        const filePath = path.join(UPLOAD_DIR, req.file.filename);
        const fileBuffer = fs.readFileSync(filePath);
        const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

        const [created] = await db
          .insert(clientUploads)
          .values({
            documentKey,
            userId,
            clientId: req.session.clientId || null,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            status: "uploaded",
            clientChecked: false,
            sha256,
          })
          .returning();

        res.json({ upload: created });
      } catch (error: any) {
        console.error("Error uploading file:", error.message);
        res.status(500).json({ error: "Failed to upload file" });
      }
    }
  );

  app.patch("/api/uploads/:id/check", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { checked } = req.body;
      const [updated] = await db
        .update(clientUploads)
        .set({
          clientChecked: checked === true,
          status: checked === true ? "aguardando_validacao" : "uploaded",
        })
        .where(and(eq(clientUploads.id, req.params.id), eq(clientUploads.userId, userId)))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Upload nao encontrado" });
      }

      res.json({ upload: updated });
    } catch (error: any) {
      console.error("Error updating check:", error.message);
      res.status(500).json({ error: "Failed to update check" });
    }
  });

  app.delete("/api/uploads/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const [upload] = await db
        .select()
        .from(clientUploads)
        .where(and(eq(clientUploads.id, req.params.id), eq(clientUploads.userId, userId)))
        .limit(1);

      if (!upload) {
        return res.status(404).json({ error: "Upload nao encontrado" });
      }

      const filePath = path.join(UPLOAD_DIR, upload.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await db.delete(clientUploads).where(and(eq(clientUploads.id, req.params.id), eq(clientUploads.userId, userId)));

      res.json({ deleted: true });
    } catch (error: any) {
      console.error("Error deleting upload:", error.message);
      res.status(500).json({ error: "Failed to delete upload" });
    }
  });
}
