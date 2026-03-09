import { Express, Request, Response } from "express";
import { db } from "./db";
import { conciliacaoNfse, conciliacaoErp, conciliacaoBanco, conciliacaoResultado } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { createHash } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import xml2js from "xml2js";
import * as XLSX from "xlsx";

const uploadDir = path.join(process.cwd(), "uploads", "conciliacao");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const VALID_PASTAS = ["pagar", "receber"] as const;
function validatePasta(val: any): "pagar" | "receber" {
  if (val === "pagar" || val === "receber") return val;
  return "pagar";
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".xml", ".csv", ".xlsx", ".xls", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Formato não suportado: ${ext}`));
    }
  },
});

function parseNfseXml(xmlContent: string): any[] {
  const results: any[] = [];
  let parsed: any = null;

  xml2js.parseString(xmlContent, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
    if (err) throw new Error("Erro ao parsear XML: " + err.message);
    parsed = result;
  });

  if (!parsed) return results;

  const nfses = findNfseNodes(parsed);

  for (const nfse of nfses) {
    const nota: any = {};

    nota.numeroNota = findValue(nfse, ["Numero", "NumeroNfse", "InfNfse.Numero", "IdentificacaoNfse.Numero"]);
    nota.dataEmissao = findValue(nfse, ["DataEmissao", "DataEmissaoNfse", "InfNfse.DataEmissao"]);
    nota.cnpjPrestador = findValue(nfse, ["PrestadorServico.IdentificacaoPrestador.CpfCnpj.Cnpj", "Prestador.Cnpj", "CpfCnpj.Cnpj", "PrestadorServico.IdentificacaoPrestador.Cnpj"]);
    nota.razaoSocialPrestador = findValue(nfse, ["PrestadorServico.RazaoSocial", "Prestador.RazaoSocial", "PrestadorServico.NomeFantasia"]);
    nota.cnpjTomador = findValue(nfse, ["TomadorServico.IdentificacaoTomador.CpfCnpj.Cnpj", "Tomador.Cnpj", "TomadorServico.IdentificacaoTomador.Cnpj"]);
    nota.razaoSocialTomador = findValue(nfse, ["TomadorServico.RazaoSocial", "Tomador.RazaoSocial"]);
    nota.valorServico = findValue(nfse, ["Servico.Valores.ValorServicos", "ValorServicos", "Servico.ValorServicos", "ValorLiquidoNfse"]);
    nota.valorIss = findValue(nfse, ["Servico.Valores.ValorIss", "ValorIss", "Servico.ValorIss"]);
    nota.aliquotaIss = findValue(nfse, ["Servico.Valores.Aliquota", "Aliquota", "Servico.Aliquota"]);
    nota.codigoServico = findValue(nfse, ["Servico.ItemListaServico", "CodigoServico", "Servico.CodigoCnae"]);
    nota.descricaoServico = findValue(nfse, ["Servico.Discriminacao", "Discriminacao", "Servico.Descricao"]);
    nota.statusNota = findValue(nfse, ["NfseCancelamento", "Cancelamento"]) ? "cancelada" : "ativa";

    if (nota.numeroNota || nota.valorServico || nota.cnpjPrestador) {
      results.push(nota);
    }
  }

  return results;
}

function findNfseNodes(obj: any, depth = 0): any[] {
  if (depth > 10) return [];
  const results: any[] = [];

  if (typeof obj !== "object" || obj === null) return results;

  const nfseKeys = ["Nfse", "CompNfse", "ListaNfse", "tcCompNfse", "InfNfse", "NFS-e"];
  for (const key of Object.keys(obj)) {
    if (nfseKeys.some(k => key.includes(k))) {
      const val = obj[key];
      if (Array.isArray(val)) {
        for (const item of val) {
          results.push(item);
        }
      } else if (typeof val === "object") {
        if (findValue(val, ["Numero", "NumeroNfse", "ValorServicos"])) {
          results.push(val);
        } else {
          results.push(...findNfseNodes(val, depth + 1));
        }
      }
    }
  }

  if (results.length === 0 && depth === 0) {
    results.push(obj);
  }

  return results;
}

function findValue(obj: any, paths: string[]): string | null {
  for (const p of paths) {
    const parts = p.split(".");
    let current = obj;
    let found = true;
    for (const part of parts) {
      if (current && typeof current === "object") {
        const keys = Object.keys(current);
        const match = keys.find(k => k === part || k.endsWith(":" + part) || k.includes(part));
        if (match) {
          current = current[match];
        } else {
          found = false;
          break;
        }
      } else {
        found = false;
        break;
      }
    }
    if (found && current !== null && current !== undefined) {
      if (typeof current === "object" && current._) return current._;
      if (typeof current === "object" && current["$"]) continue;
      if (typeof current === "string" || typeof current === "number") return String(current);
    }
  }
  return null;
}

function parseBrNumber(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  let str = String(val).trim().replace(/[^\d.,-]/g, "");
  if (!str) return 0;

  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    if (lastComma > lastDot) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = str.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      str = str.replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  }

  const result = parseFloat(str);
  return isNaN(result) ? 0 : result;
}

function parseSpreadsheet(filePath: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return data as any[];
}

function normalizeErpRow(row: any): any {
  const keys = Object.keys(row);
  const find = (patterns: string[]) => {
    for (const p of patterns) {
      const k = keys.find(k => k.toLowerCase().replace(/[_\s-]/g, "").includes(p.toLowerCase().replace(/[_\s-]/g, "")));
      if (k) return row[k];
    }
    return null;
  };

  return {
    numeroNf: find(["numero", "nf", "nota", "numeronf", "notafiscal", "nfse", "doc"]),
    fornecedor: find(["fornecedor", "razaosocial", "nome", "prestador", "empresa"]),
    cnpjFornecedor: find(["cnpj", "cpfcnpj", "documento"]),
    valorBruto: parseBrNumber(find(["valorbruto", "valor", "valortotal", "bruto", "total"])),
    valorLiquido: parseBrNumber(find(["valorliquido", "liquido", "vlrliquido"])),
    dataPagamento: find(["datapagamento", "dtpgto", "pagamento", "datapgto"]),
    dataVencimento: find(["datavencimento", "vencimento", "dtvencimento"]),
    centroCusto: find(["centrocusto", "cc", "centro"]),
    contrato: find(["contrato", "pedido", "ordem"]),
    formaPagamento: find(["formapagamento", "forma", "tipopagamento"]),
    descricao: find(["descricao", "historico", "observacao", "obs"]),
  };
}

function normalizeBancoRow(row: any): any {
  const keys = Object.keys(row);
  const find = (patterns: string[]) => {
    for (const p of patterns) {
      const k = keys.find(k => k.toLowerCase().replace(/[_\s-]/g, "").includes(p.toLowerCase().replace(/[_\s-]/g, "")));
      if (k) return row[k];
    }
    return null;
  };

  const valorRaw = find(["valor", "vlr", "montante", "amount"]);
  const valor = parseBrNumber(valorRaw);
  const isNegative = String(valorRaw || "").trim().startsWith("-");

  return {
    dataTransacao: find(["data", "datatransacao", "dt", "date"]),
    descricao: find(["descricao", "historico", "lancamento", "description", "obs"]),
    valor: Math.abs(valor),
    tipo: isNegative || valor < 0 ? "debito" : "credito",
    saldo: parseBrNumber(find(["saldo", "balance"])),
    banco: find(["banco", "instituicao", "bank"]),
    agencia: find(["agencia", "ag"]),
    conta: find(["conta", "cc", "account"]),
    documentoRef: find(["documento", "doc", "referencia", "nrdocumento"]),
  };
}

function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const str = String(val).trim();

  const brMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) return new Date(`${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`);

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return new Date(str);

  if (typeof val === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + val * 86400000);
  }

  return null;
}

export function registerConciliarContasRoutes(app: Express) {
  app.post("/api/conciliacao/nfse/upload", requireAuth, upload.array("files", 10), async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId || null;
      const pasta = validatePasta(req.body.pasta);
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo XML enviado" });
      }

      const imported: any[] = [];

      for (const file of files) {
        const xmlContent = fs.readFileSync(file.path, "utf-8");
        const sha256 = createHash("sha256").update(xmlContent).digest("hex");

        try {
          const notas = parseNfseXml(xmlContent);

          for (const nota of notas) {
            const dataEmissao = parseDate(nota.dataEmissao);
            const record = await db.insert(conciliacaoNfse).values({
              clientId,
              userId,
              tipo: "emitida",
              pasta,
              numeroNota: nota.numeroNota,
              dataEmissao,
              cnpjTomador: nota.cnpjTomador,
              cnpjPrestador: nota.cnpjPrestador,
              razaoSocialTomador: nota.razaoSocialTomador,
              razaoSocialPrestador: nota.razaoSocialPrestador,
              valorServico: nota.valorServico,
              valorIss: nota.valorIss,
              aliquotaIss: nota.aliquotaIss,
              codigoServico: nota.codigoServico,
              descricaoServico: nota.descricaoServico,
              statusNota: nota.statusNota || "ativa",
              municipio: "Curitiba",
              xmlOriginal: xmlContent,
              sha256,
            }).returning();

            imported.push(record[0]);
          }

          if (notas.length === 0) {
            const record = await db.insert(conciliacaoNfse).values({
              clientId,
              userId,
              tipo: "emitida",
              pasta,
              xmlOriginal: xmlContent,
              sha256,
              municipio: "Curitiba",
            }).returning();
            imported.push(record[0]);
          }
        } catch (parseErr: any) {
          imported.push({ error: `Erro no arquivo ${file.originalname}: ${parseErr.message}` });
        }
      }

      res.json({ success: true, count: imported.filter(r => !r.error).length, records: imported });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/conciliacao/erp/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId || null;
      const pasta = validatePasta(req.body.pasta);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const rows = parseSpreadsheet(file.path);
      const imported: any[] = [];

      for (const row of rows) {
        const normalized = normalizeErpRow(row);
        const dataPagamento = parseDate(normalized.dataPagamento);
        const dataVencimento = parseDate(normalized.dataVencimento);

        const record = await db.insert(conciliacaoErp).values({
          clientId,
          userId,
          pasta,
          numeroNf: normalized.numeroNf ? String(normalized.numeroNf) : null,
          fornecedor: normalized.fornecedor ? String(normalized.fornecedor) : null,
          cnpjFornecedor: normalized.cnpjFornecedor ? String(normalized.cnpjFornecedor) : null,
          valorBruto: normalized.valorBruto ? String(normalized.valorBruto) : null,
          valorLiquido: normalized.valorLiquido ? String(normalized.valorLiquido) : null,
          dataPagamento,
          dataVencimento,
          centroCusto: normalized.centroCusto ? String(normalized.centroCusto) : null,
          contrato: normalized.contrato ? String(normalized.contrato) : null,
          formaPagamento: normalized.formaPagamento ? String(normalized.formaPagamento) : null,
          descricao: normalized.descricao ? String(normalized.descricao) : null,
          sistemaOrigem: "STUR",
        }).returning();

        imported.push(record[0]);
      }

      res.json({ success: true, count: imported.length, records: imported });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/conciliacao/banco/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId || null;
      const pasta = validatePasta(req.body.pasta);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const rows = parseSpreadsheet(file.path);
      const imported: any[] = [];

      for (const row of rows) {
        const normalized = normalizeBancoRow(row);
        const dataTransacao = parseDate(normalized.dataTransacao);

        const record = await db.insert(conciliacaoBanco).values({
          clientId,
          userId,
          pasta,
          dataTransacao,
          descricao: normalized.descricao ? String(normalized.descricao) : null,
          valor: normalized.valor ? String(normalized.valor) : null,
          tipo: normalized.tipo || "debito",
          saldo: normalized.saldo ? String(normalized.saldo) : null,
          banco: normalized.banco ? String(normalized.banco) : null,
          agencia: normalized.agencia ? String(normalized.agencia) : null,
          conta: normalized.conta ? String(normalized.conta) : null,
          documentoRef: normalized.documentoRef ? String(normalized.documentoRef) : null,
        }).returning();

        imported.push(record[0]);
      }

      res.json({ success: true, count: imported.length, records: imported });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/conciliacao/nfse", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.query.pasta);

      const whereClause = clientId
        ? and(eq(conciliacaoNfse.clientId, clientId), eq(conciliacaoNfse.pasta, pasta))
        : and(eq(conciliacaoNfse.userId, userId), eq(conciliacaoNfse.pasta, pasta));

      const records = await db.select().from(conciliacaoNfse).where(whereClause).orderBy(desc(conciliacaoNfse.importedAt));
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/conciliacao/erp", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.query.pasta);

      const whereClause = clientId
        ? and(eq(conciliacaoErp.clientId, clientId), eq(conciliacaoErp.pasta, pasta))
        : and(eq(conciliacaoErp.userId, userId), eq(conciliacaoErp.pasta, pasta));

      const records = await db.select().from(conciliacaoErp).where(whereClause).orderBy(desc(conciliacaoErp.importedAt));
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/conciliacao/banco", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.query.pasta);

      const whereClause = clientId
        ? and(eq(conciliacaoBanco.clientId, clientId), eq(conciliacaoBanco.pasta, pasta))
        : and(eq(conciliacaoBanco.userId, userId), eq(conciliacaoBanco.pasta, pasta));

      const records = await db.select().from(conciliacaoBanco).where(whereClause).orderBy(desc(conciliacaoBanco.importedAt));
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/conciliacao/executar", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.body.pasta);

      const nfseWhere = clientId
        ? and(eq(conciliacaoNfse.clientId, clientId), eq(conciliacaoNfse.pasta, pasta))
        : and(eq(conciliacaoNfse.userId, userId), eq(conciliacaoNfse.pasta, pasta));

      const erpWhere = clientId
        ? and(eq(conciliacaoErp.clientId, clientId), eq(conciliacaoErp.pasta, pasta))
        : and(eq(conciliacaoErp.userId, userId), eq(conciliacaoErp.pasta, pasta));

      const bancoWhere = clientId
        ? and(eq(conciliacaoBanco.clientId, clientId), eq(conciliacaoBanco.pasta, pasta))
        : and(eq(conciliacaoBanco.userId, userId), eq(conciliacaoBanco.pasta, pasta));

      const nfseRecords = await db.select().from(conciliacaoNfse).where(nfseWhere);
      const erpRecords = await db.select().from(conciliacaoErp).where(erpWhere);
      const bancoRecords = await db.select().from(conciliacaoBanco).where(bancoWhere);

      await db.delete(conciliacaoResultado).where(
        clientId
          ? and(eq(conciliacaoResultado.clientId, clientId), eq(conciliacaoResultado.pasta, pasta))
          : and(eq(conciliacaoResultado.userId, userId), eq(conciliacaoResultado.pasta, pasta))
      );

      const results: any[] = [];
      const matchedErpIds = new Set<string>();
      const matchedBancoIds = new Set<string>();
      const TOLERANCE = 0.05;

      for (const nfse of nfseRecords) {
        const valorNota = parseFloat(nfse.valorServico || "0");
        let bestErp: any = null;
        let bestBanco: any = null;

        for (const erp of erpRecords) {
          if (matchedErpIds.has(erp.id)) continue;

          const valorErp = parseFloat(erp.valorBruto || erp.valorLiquido || "0");
          const diff = Math.abs(valorNota - valorErp);
          const tolerance = valorNota * TOLERANCE;

          const nfMatch = nfse.numeroNota && erp.numeroNf &&
            nfse.numeroNota.replace(/\D/g, "") === erp.numeroNf.replace(/\D/g, "");

          const cnpjMatch = nfse.cnpjPrestador && erp.cnpjFornecedor &&
            nfse.cnpjPrestador.replace(/\D/g, "") === erp.cnpjFornecedor.replace(/\D/g, "");

          const valorMatch = diff <= tolerance;

          if (nfMatch || (cnpjMatch && valorMatch) || (valorMatch && diff < 0.01)) {
            bestErp = erp;
            break;
          }
        }

        for (const banco of bancoRecords) {
          if (matchedBancoIds.has(banco.id)) continue;

          const valorBanco = parseFloat(banco.valor || "0");
          const diff = Math.abs(valorNota - valorBanco);
          const tolerance = valorNota * TOLERANCE;

          if (diff <= tolerance) {
            bestBanco = banco;
            break;
          }
        }

        let status = "pendente";
        let observacao = "";
        const valorPago = bestErp ? parseFloat(bestErp.valorBruto || bestErp.valorLiquido || "0") : null;
        const valorBanco = bestBanco ? parseFloat(bestBanco.valor || "0") : null;

        if (bestErp && bestBanco) {
          const diffErp = Math.abs(valorNota - (valorPago || 0));
          const diffBanco = Math.abs(valorNota - (valorBanco || 0));

          if (diffErp < 0.01 && diffBanco < 0.01) {
            status = "conciliado";
            observacao = "NFS-e × ERP × Banco: valores conferem";
          } else if (diffErp <= valorNota * TOLERANCE && diffBanco <= valorNota * TOLERANCE) {
            status = "conciliado_parcial";
            observacao = `Diferença ERP: R$ ${diffErp.toFixed(2)} | Diferença Banco: R$ ${diffBanco.toFixed(2)}`;
          } else {
            status = "divergente";
            observacao = `Divergência: ERP R$ ${diffErp.toFixed(2)} | Banco R$ ${diffBanco.toFixed(2)}`;
          }
          matchedErpIds.add(bestErp.id);
          matchedBancoIds.add(bestBanco.id);
        } else if (bestErp) {
          const diffErp = Math.abs(valorNota - (valorPago || 0));
          if (diffErp < 0.01) {
            status = "conciliado_parcial";
            observacao = "NFS-e × ERP: valores conferem, sem confirmação bancária";
          } else {
            status = "divergente";
            observacao = `Diferença NFS-e vs ERP: R$ ${diffErp.toFixed(2)}`;
          }
          matchedErpIds.add(bestErp.id);
        } else if (bestBanco) {
          status = "conciliado_parcial";
          observacao = "NFS-e × Banco: valor encontrado no extrato, sem registro no ERP";
          matchedBancoIds.add(bestBanco.id);
        } else {
          status = "nota_sem_pagamento";
          observacao = "NFS-e emitida sem correspondência no ERP ou banco";
        }

        if (nfse.statusNota === "cancelada") {
          if (bestErp) {
            status = "divergente";
            observacao = "ALERTA: Nota cancelada mas com pagamento registrado no ERP";
          } else {
            status = "nota_cancelada";
            observacao = "Nota fiscal cancelada";
          }
        }

        const diferenca = valorPago !== null ? valorNota - valorPago : null;

        const record = await db.insert(conciliacaoResultado).values({
          clientId,
          userId,
          pasta,
          nfseId: nfse.id,
          erpId: bestErp?.id || null,
          bancoId: bestBanco?.id || null,
          statusConciliacao: status,
          valorNota: String(valorNota),
          valorPago: valorPago !== null ? String(valorPago) : null,
          valorBanco: valorBanco !== null ? String(valorBanco) : null,
          diferenca: diferenca !== null ? String(diferenca) : null,
          observacao,
        }).returning();

        results.push(record[0]);
      }

      for (const erp of erpRecords) {
        if (matchedErpIds.has(erp.id)) continue;

        const valorErp = parseFloat(erp.valorBruto || erp.valorLiquido || "0");
        let bestBanco: any = null;

        for (const banco of bancoRecords) {
          if (matchedBancoIds.has(banco.id)) continue;
          const valorBanco = parseFloat(banco.valor || "0");
          if (Math.abs(valorErp - valorBanco) <= valorErp * TOLERANCE) {
            bestBanco = banco;
            break;
          }
        }

        const record = await db.insert(conciliacaoResultado).values({
          clientId,
          userId,
          pasta,
          nfseId: null,
          erpId: erp.id,
          bancoId: bestBanco?.id || null,
          statusConciliacao: "pagamento_sem_nota",
          valorNota: null,
          valorPago: String(valorErp),
          valorBanco: bestBanco ? String(parseFloat(bestBanco.valor || "0")) : null,
          diferenca: null,
          observacao: "Pagamento registrado no ERP sem nota fiscal correspondente",
        }).returning();

        results.push(record[0]);
        if (bestBanco) matchedBancoIds.add(bestBanco.id);
      }

      const resumo = {
        totalNotas: nfseRecords.length,
        totalErp: erpRecords.length,
        totalBanco: bancoRecords.length,
        conciliados: results.filter(r => r.statusConciliacao === "conciliado").length,
        parciais: results.filter(r => r.statusConciliacao === "conciliado_parcial").length,
        divergentes: results.filter(r => r.statusConciliacao === "divergente").length,
        notaSemPagamento: results.filter(r => r.statusConciliacao === "nota_sem_pagamento").length,
        pagamentoSemNota: results.filter(r => r.statusConciliacao === "pagamento_sem_nota").length,
        notasCanceladas: results.filter(r => r.statusConciliacao === "nota_cancelada").length,
      };

      res.json({ success: true, resumo, results });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/conciliacao/resultado", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.query.pasta);

      const whereClause = clientId
        ? and(eq(conciliacaoResultado.clientId, clientId), eq(conciliacaoResultado.pasta, pasta))
        : and(eq(conciliacaoResultado.userId, userId), eq(conciliacaoResultado.pasta, pasta));

      const records = await db.select().from(conciliacaoResultado).where(whereClause).orderBy(desc(conciliacaoResultado.createdAt));
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/conciliacao/resumo", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.query.pasta);

      const nfseWhere = clientId
        ? and(eq(conciliacaoNfse.clientId, clientId), eq(conciliacaoNfse.pasta, pasta))
        : and(eq(conciliacaoNfse.userId, userId), eq(conciliacaoNfse.pasta, pasta));

      const erpWhere = clientId
        ? and(eq(conciliacaoErp.clientId, clientId), eq(conciliacaoErp.pasta, pasta))
        : and(eq(conciliacaoErp.userId, userId), eq(conciliacaoErp.pasta, pasta));

      const bancoWhere = clientId
        ? and(eq(conciliacaoBanco.clientId, clientId), eq(conciliacaoBanco.pasta, pasta))
        : and(eq(conciliacaoBanco.userId, userId), eq(conciliacaoBanco.pasta, pasta));

      const resultadoWhere = clientId
        ? and(eq(conciliacaoResultado.clientId, clientId), eq(conciliacaoResultado.pasta, pasta))
        : and(eq(conciliacaoResultado.userId, userId), eq(conciliacaoResultado.pasta, pasta));

      const nfseCount = await db.select().from(conciliacaoNfse).where(nfseWhere);
      const erpCount = await db.select().from(conciliacaoErp).where(erpWhere);
      const bancoCount = await db.select().from(conciliacaoBanco).where(bancoWhere);
      const resultados = await db.select().from(conciliacaoResultado).where(resultadoWhere);

      const totalValorNotas = nfseCount.reduce((sum, n) => sum + parseFloat(n.valorServico || "0"), 0);
      const totalValorErp = erpCount.reduce((sum, e) => sum + parseFloat(e.valorBruto || e.valorLiquido || "0"), 0);

      res.json({
        nfseImportadas: nfseCount.length,
        erpImportados: erpCount.length,
        bancoImportados: bancoCount.length,
        totalValorNotas,
        totalValorErp,
        conciliados: resultados.filter(r => r.statusConciliacao === "conciliado").length,
        parciais: resultados.filter(r => r.statusConciliacao === "conciliado_parcial").length,
        divergentes: resultados.filter(r => r.statusConciliacao === "divergente").length,
        notaSemPagamento: resultados.filter(r => r.statusConciliacao === "nota_sem_pagamento").length,
        pagamentoSemNota: resultados.filter(r => r.statusConciliacao === "pagamento_sem_nota").length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/conciliacao/limpar", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const clientId = req.session.clientId;
      const pasta = validatePasta(req.body.pasta);
      const tipo = req.body.tipo as string;

      const makeWhere = (table: any) => clientId
        ? and(eq(table.clientId, clientId), eq(table.pasta, pasta))
        : and(eq(table.userId, userId), eq(table.pasta, pasta));

      if (!tipo || tipo === "resultado") {
        await db.delete(conciliacaoResultado).where(makeWhere(conciliacaoResultado));
      }
      if (!tipo || tipo === "nfse") {
        await db.delete(conciliacaoNfse).where(makeWhere(conciliacaoNfse));
      }
      if (!tipo || tipo === "erp") {
        await db.delete(conciliacaoErp).where(makeWhere(conciliacaoErp));
      }
      if (!tipo || tipo === "banco") {
        await db.delete(conciliacaoBanco).where(makeWhere(conciliacaoBanco));
      }

      res.json({ success: true, message: "Dados limpos com sucesso" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
