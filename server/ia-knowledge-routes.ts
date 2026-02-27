import { Express, Request, Response } from "express";
import { db } from "./db";
import { iaKnowledgeDocs } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { createHash } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
let pdfParse: any;
let mammoth: any;
let XLSX: any;

async function loadExtractors() {
  if (!pdfParse) {
    const mod = await import("pdf-parse");
    pdfParse = mod.default || mod;
  }
  if (!mammoth) {
    const mod = await import("mammoth");
    mammoth = mod.default || mod;
  }
  if (!XLSX) {
    const mod = await import("xlsx");
    XLSX = mod.default || mod;
  }
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "uploads", "knowledge");

if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, KNOWLEDGE_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      ".csv", ".xlsx", ".xls", ".pdf", ".doc", ".docx",
      ".txt", ".md", ".json", ".xml", ".pptx", ".ppt",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo nao permitido: ${ext}`));
    }
  },
});

const CATEGORIES = [
  { id: "viagens-eventos", label: "Viagens e Eventos (T&E/MICE)" },
  { id: "despesas-corporativas", label: "Despesas Corporativas" },
  { id: "contratos-fornecedores", label: "Contratos com Terceiros" },
  { id: "telecom-ti", label: "Telecomunicacoes e TI" },
  { id: "frota-logistica", label: "Frota e Logistica" },
  { id: "beneficios-rh", label: "Beneficios e RH" },
  { id: "suprimentos-compras", label: "Suprimentos e Compras" },
  { id: "monitoramento-continuo", label: "Monitoramento Continuo" },
  { id: "compliance-etica", label: "Compliance e Business Ethics" },
  { id: "metodologia", label: "Metodologia de Auditoria" },
  { id: "cases-reais", label: "Cases Reais (Anonimizado)" },
  { id: "benchmark-mercado", label: "Benchmark de Mercado" },
  { id: "legislacao", label: "Legislacao e Normas" },
  { id: "general", label: "Conhecimento Geral" },
];

async function extractText(filePath: string, ext: string): Promise<string> {
  try {
    await loadExtractors();

    if ([".txt", ".md", ".csv", ".json", ".xml"].includes(ext)) {
      return fs.readFileSync(filePath, "utf-8").slice(0, 100000);
    }

    if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const result = await pdfParse(buffer);
      return (result.text || "").slice(0, 100000);
    }

    if (ext === ".docx" || ext === ".doc") {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return (result.value || "").slice(0, 100000);
    }

    if (ext === ".xlsx" || ext === ".xls") {
      const workbook = XLSX.readFile(filePath);
      const sheets: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        sheets.push(`[${sheetName}]\n${csv}`);
      }
      return sheets.join("\n\n").slice(0, 100000);
    }

    if (ext === ".pptx" || ext === ".ppt") {
      return "";
    }

    return "";
  } catch (error) {
    console.error(`Text extraction failed for ${ext}:`, error);
    return "";
  }
}

export function registerIaKnowledgeRoutes(app: Express) {
  app.get("/api/admin/ia-knowledge/categories", requireAuth, (_req: Request, res: Response) => {
    res.json({ categories: CATEGORIES });
  });

  app.get("/api/admin/ia-knowledge", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
      }
      const docs = await db.select().from(iaKnowledgeDocs).orderBy(desc(iaKnowledgeDocs.createdAt));
      res.json({ documents: docs, categories: CATEGORIES });
    } catch (error: any) {
      console.error("Error fetching knowledge docs:", error.message);
      res.status(500).json({ error: "Erro ao buscar documentos" });
    }
  });

  app.post(
    "/api/admin/ia-knowledge",
    requireAuth,
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        if (req.session.role !== "admin") {
          return res.status(403).json({ error: "Acesso restrito a administradores" });
        }

        if (!req.file) {
          return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const { title, description, category } = req.body;
        if (!title) {
          return res.status(400).json({ error: "Titulo e obrigatorio" });
        }

        const filePath = path.join(KNOWLEDGE_DIR, req.file.filename);
        const fileBuffer = fs.readFileSync(filePath);
        const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

        const ext = path.extname(req.file.originalname).toLowerCase();
        const extractedText = await extractText(filePath, ext);

        const [doc] = await db.insert(iaKnowledgeDocs).values({
          title,
          description: description || null,
          category: category || "general",
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          sha256,
          extractedText: extractedText || null,
          isActive: true,
          uploadedBy: req.session.userId || null,
        }).returning();

        res.status(201).json({ document: doc });
      } catch (error: any) {
        console.error("Error uploading knowledge doc:", error.message);
        res.status(500).json({ error: "Erro ao enviar documento" });
      }
    }
  );

  app.patch("/api/admin/ia-knowledge/:id/toggle", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
      }

      const [existing] = await db.select().from(iaKnowledgeDocs).where(eq(iaKnowledgeDocs.id, req.params.id));
      if (!existing) {
        return res.status(404).json({ error: "Documento nao encontrado" });
      }

      const [updated] = await db.update(iaKnowledgeDocs)
        .set({ isActive: !existing.isActive })
        .where(eq(iaKnowledgeDocs.id, req.params.id))
        .returning();

      res.json({ document: updated });
    } catch (error: any) {
      console.error("Error toggling knowledge doc:", error.message);
      res.status(500).json({ error: "Erro ao atualizar documento" });
    }
  });

  app.patch("/api/admin/ia-knowledge/:id/text", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
      }

      const { extractedText } = req.body;
      if (typeof extractedText !== "string") {
        return res.status(400).json({ error: "extractedText e obrigatorio" });
      }

      const [updated] = await db.update(iaKnowledgeDocs)
        .set({ extractedText: extractedText.slice(0, 100000) })
        .where(eq(iaKnowledgeDocs.id, req.params.id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Documento nao encontrado" });
      }

      res.json({ document: updated });
    } catch (error: any) {
      console.error("Error updating text:", error.message);
      res.status(500).json({ error: "Erro ao atualizar texto" });
    }
  });

  app.delete("/api/admin/ia-knowledge/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
      }

      const [doc] = await db.select().from(iaKnowledgeDocs).where(eq(iaKnowledgeDocs.id, req.params.id));
      if (!doc) {
        return res.status(404).json({ error: "Documento nao encontrado" });
      }

      const filePath = path.join(KNOWLEDGE_DIR, doc.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await db.delete(iaKnowledgeDocs).where(eq(iaKnowledgeDocs.id, req.params.id));
      res.json({ deleted: true });
    } catch (error: any) {
      console.error("Error deleting knowledge doc:", error.message);
      res.status(500).json({ error: "Erro ao excluir documento" });
    }
  });
}

export async function getKnowledgeContext(): Promise<string> {
  try {
    const activeDocs = await db.select().from(iaKnowledgeDocs)
      .where(eq(iaKnowledgeDocs.isActive, true))
      .orderBy(iaKnowledgeDocs.category);

    if (activeDocs.length === 0) return "";

    const grouped: Record<string, string[]> = {};
    for (const doc of activeDocs) {
      if (!doc.extractedText) continue;
      const cat = doc.category || "general";
      if (!grouped[cat]) grouped[cat] = [];
      const snippet = doc.extractedText.slice(0, 8000);
      grouped[cat].push(`[${doc.title}]: ${snippet}`);
    }

    if (Object.keys(grouped).length === 0) return "";

    const MAX_TOTAL_CHARS = 30000;
    let context = "\n\n## Base de Conhecimento Proprietaria AuraAUDIT (16+ anos de experiencia)\n\n";
    context += "IMPORTANTE: O conteudo abaixo e material CONFIDENCIAL da base de conhecimento da AuraAUDIT, resultado de 16+ anos de auditoria forense. ";
    context += "Voce deve usar este conhecimento para fornecer respostas mais profundas e especializadas aos clientes da AuraAUDIT. ";
    context += "NUNCA revele nomes de clientes, valores especificos de contratos ou dados confidenciais contidos nestes documentos. ";
    context += "Utilize o conhecimento de forma anonimizada para enriquecer suas analises e recomendacoes.\n\n";

    let currentChars = context.length;
    for (const [cat, items] of Object.entries(grouped)) {
      const catLabel = CATEGORIES.find(c => c.id === cat)?.label || cat;
      const header = `### ${catLabel}\n`;
      if (currentChars + header.length > MAX_TOTAL_CHARS) break;
      context += header;
      currentChars += header.length;
      for (const item of items) {
        const entry = `${item}\n\n`;
        if (currentChars + entry.length > MAX_TOTAL_CHARS) break;
        context += entry;
        currentChars += entry.length;
      }
    }

    return context;
  } catch (error) {
    console.error("Error loading knowledge context:", error);
    return "";
  }
}
