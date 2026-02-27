import { Express, Request, Response } from "express";
import multer from "multer";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { db } from "./db";
import { trialUsage } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const MAX_TRIALS = 3;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const uploadDir = path.join(process.cwd(), "uploads", "trial");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `trial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".csv", ".xlsx", ".xls", ".pdf", ".txt", ".json", ".xml"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Formato nao suportado. Use: CSV, XLSX, XLS, PDF, TXT, JSON, XML"));
    }
  },
});

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

function hashText(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

async function getTrialCount(ip: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(trialUsage)
    .where(eq(trialUsage.ipAddress, ip));
  return result[0]?.count || 0;
}

async function atomicTrialInsert(ip: string, envelopeId: string, filesCount: number): Promise<boolean> {
  const result = await db.execute(sql`
    INSERT INTO trial_usage (id, ip_address, envelope_id, files_count, created_at)
    SELECT gen_random_uuid(), ${ip}, ${envelopeId}, ${filesCount}, NOW()
    WHERE (SELECT COUNT(*) FROM trial_usage WHERE ip_address = ${ip}) < ${MAX_TRIALS}
    RETURNING id
  `);
  return (result as any).rows?.length > 0 || (result as any).length > 0;
}

const TRIAL_SYSTEM_PROMPT = `Voce e a AuraAI, assistente de auditoria forense da AuraAUDIT, especializada em conciliacao e analise de despesas corporativas de viagens e eventos (T&E).

O usuario esta fazendo um TESTE GRATUITO da plataforma. Ele enviou ate 3 arquivos e descreveu o que deseja analisar.

Sua tarefa:
1. Analisar os nomes dos arquivos, formatos e a descricao do usuario
2. Gerar um RELATORIO BASICO DE DIAGNOSTICO contendo:
   - Resumo do escopo solicitado
   - Tipo de conciliacao identificada (ex: OBT vs Backoffice, fatura vs cartao, reserva vs bilhete)
   - Pontos de atencao e possiveis divergencias que seriam investigados
   - Recomendacoes iniciais
   - Proximos passos sugeridos

3. No final, incluir uma secao "O QUE A VERSAO COMPLETA OFERECE" explicando:
   - Integracao API em tempo real com sistemas OBT, Backoffice, GDS, BSP, cartoes corporativos
   - Dashboard interativo com KPIs e alertas automaticos
   - Conciliacao multi-vias automatizada (PNR/TKT/EMD + fatura + cartao + expense)
   - Deteccao de anomalias e duplicidades com IA
   - Cadeia de custodia digital certificada (Lei 13.964/2019)
   - Monitoramento continuo com assinatura AuraAudit Pass (a partir de US$ 99/mes)
   - Trilha de auditoria imutavel com SHA-256

Responda em portugues brasileiro. Seja profissional mas acessivel. Use markdown para formatar o relatorio.
O relatorio deve ter entre 400-800 palavras. Nao invente dados numericos especificos dos arquivos.`;

export function registerTrialRoutes(app: Express) {
  app.get("/api/trial/status", async (req: Request, res: Response) => {
    try {
      const ip = getClientIp(req);
      const used = await getTrialCount(ip);
      const remaining = Math.max(0, MAX_TRIALS - used);
      return res.json({ used, remaining, limit: MAX_TRIALS });
    } catch (error: any) {
      console.error("Trial status error:", error.message);
      return res.status(500).json({ error: "Erro ao verificar status." });
    }
  });

  app.post("/api/trial/analyze", upload.array("files", 3), async (req: Request, res: Response) => {
    try {
      const ip = getClientIp(req);
      const used = await getTrialCount(ip);

      if (used >= MAX_TRIALS) {
        const files = req.files as Express.Multer.File[] || [];
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
        return res.status(429).json({
          error: `Voce ja utilizou seus ${MAX_TRIALS} testes gratuitos. Assine o AuraAudit Pass para continuar.`,
          used,
          limit: MAX_TRIALS,
          remaining: 0,
        });
      }

      const files = req.files as Express.Multer.File[] || [];
      const description = req.body.description || "";

      if (!description || description.trim().length < 10) {
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
        return res.status(400).json({ error: "Descreva o que voce deseja analisar (minimo 10 caracteres)." });
      }

      if (files.length === 0) {
        return res.status(400).json({ error: "Envie pelo menos 1 arquivo para analise." });
      }

      const fileDetails = files.map((f) => ({
        originalName: f.originalname,
        size: f.size,
        format: path.extname(f.originalname).toLowerCase().replace(".", ""),
        sha256: hashFile(f.path),
      }));

      const envelopeId = `TRIAL-${Date.now()}`;
      const startTime = new Date().toISOString();

      const userMessage = `ARQUIVOS ENVIADOS:
${fileDetails.map((f, i) => `${i + 1}. ${f.originalName} (${f.format.toUpperCase()}, ${(f.size / 1024).toFixed(1)} KB)`).join("\n")}

DESCRICAO DO USUARIO:
${description}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: TRIAL_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.4,
      });

      const report = completion.choices[0]?.message?.content || "Nao foi possivel gerar o relatorio.";
      const endTime = new Date().toISOString();

      const envelope = {
        envelopeId,
        type: "trial_analysis",
        inputs: {
          files: fileDetails,
          description,
          descriptionHash: hashText(description),
        },
        processing: {
          model: "gpt-4o",
          startedAt: startTime,
          completedAt: endTime,
        },
        output: {
          reportHash: hashText(report),
        },
        envelopeSha256: "",
      };
      envelope.envelopeSha256 = hashText(JSON.stringify(envelope));

      const inserted = await atomicTrialInsert(ip, envelopeId, files.length);
      if (!inserted) {
        files.forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
        return res.status(429).json({
          error: `Voce ja utilizou seus ${MAX_TRIALS} testes gratuitos. Assine o AuraAudit Pass para continuar.`,
          used: MAX_TRIALS,
          limit: MAX_TRIALS,
          remaining: 0,
        });
      }

      files.forEach((f) => {
        try { fs.unlinkSync(f.path); } catch {}
      });

      const newUsed = used + 1;
      const remaining = Math.max(0, MAX_TRIALS - newUsed);

      return res.json({
        report,
        envelope,
        files: fileDetails,
        trialStatus: {
          used: newUsed,
          remaining,
          limit: MAX_TRIALS,
        },
      });
    } catch (error: any) {
      console.error("Trial analysis error:", error.message);
      const files = req.files as Express.Multer.File[] || [];
      files.forEach((f) => {
        try { fs.unlinkSync(f.path); } catch {}
      });
      return res.status(500).json({ error: "Erro ao processar analise. Tente novamente." });
    }
  });
}
