import { Express, Request, Response } from "express";
import { db } from "./db";
import { clientUploads, iaKnowledgeDocs } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { createHash } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const DOCUMENT_REQUIREMENTS: Record<string, {
  title: string;
  category: string;
  knowledgeCategories: string[];
  requirements: string[];
  commonServices: string[];
  paymentMethods: string[];
  minimumFields: string[];
}> = {
  "contratos-prestadores": {
    title: "Contratos com Prestadores e Clientes",
    category: "contratos-fornecedores",
    knowledgeCategories: ["contratos-fornecedores", "compliance-etica"],
    requirements: [
      "Contrato original assinado entre a agencia e cada fornecedor (cias aereas, hoteis, locadoras, seguradoras)",
      "Contratos com clientes corporativos que utilizam os servicos da agencia",
      "Termos aditivos, renovacoes e alteracoes contratuais",
      "Tabelas de comissionamento, rebate e incentivos acordados por fornecedor",
      "Clausulas de SLA, penalidades e condicoes comerciais",
    ],
    commonServices: ["Cias aereas", "Redes hoteleiras", "Locadoras de veiculos", "Seguradoras", "Operadores de eventos"],
    paymentMethods: [],
    minimumFields: ["Razao social", "CNPJ", "Vigencia", "Objeto", "Valores", "Assinaturas"],
  },
  "backoffice-agencia": {
    title: "Back Office da Agencia",
    category: "despesas-corporativas",
    knowledgeCategories: ["viagens-eventos", "despesas-corporativas"],
    requirements: [
      "Relatorio completo do sistema de backoffice (Wintour, STUR, Argo ou outro)",
      "Dados de todas as transacoes: emissoes, reemissoes, cancelamentos, no-shows",
      "Detalhamento por servico: aereo, hotel, carro, seguro, evento, pacote",
      "Campos obrigatorios: localizador/PNR, data emissao, data viagem, passageiro, centro de custo, fornecedor, tarifa, taxas, fee, markup",
      "Periodo completo conforme escopo da auditoria (2024-2025)",
    ],
    commonServices: ["Emissao aerea", "Reserva hotel", "Locacao veiculo", "Seguro viagem", "Eventos", "Alimentos e bebidas", "Salas de reunioes", "Equipamentos", "Pacotes", "Outros"],
    paymentMethods: [],
    minimumFields: ["Localizador/PNR", "Data emissao", "Passageiro/Viajante", "Fornecedor", "Servico", "Tarifa", "Taxas", "Fee/Markup", "Centro de custo", "Forma de pagamento"],
  },
  "admin-bsplink-cias": {
    title: "BSPLink e Cias Aereas Integradas",
    category: "viagens-eventos",
    knowledgeCategories: ["viagens-eventos", "benchmark-mercado"],
    requirements: [
      "Relatorio BSPlink completo com billing e settlement de todas as cias aereas",
      "Dados IATA de emissao, reemissao e reembolso",
      "Relatorios das cias aereas integradas (LATAM, GOL, Azul e internacionais)",
      "Detalhamento de comissoes, over-commission e incentivos por companhia",
      "Dados de ADMs (Agency Debit Memos) e ACMs (Agency Credit Memos)",
    ],
    commonServices: ["LATAM", "GOL", "Azul", "Cias internacionais"],
    paymentMethods: ["BSP settlement", "Faturamento direto"],
    minimumFields: ["Numero bilhete", "PNR", "Cia aerea", "Trecho", "Classe", "Tarifa", "Taxa embarque", "Comissao", "Data emissao", "Status"],
  },
  "portais-hoteleiros": {
    title: "Portais de Redes Hoteleiras e Operadores",
    category: "viagens-eventos",
    knowledgeCategories: ["viagens-eventos", "contratos-fornecedores"],
    requirements: [
      "Extratos e relatorios dos portais administrativos de redes hoteleiras (Accor, Atlantica, IHG, Marriott, etc.)",
      "Dados de reservas, check-in, check-out, no-shows e cancelamentos",
      "Relatorios de operadores e consolidadores hoteleiros",
      "Tarifas negociadas vs. tarifas praticadas",
      "Comissoes e rebates hoteleiros",
    ],
    commonServices: ["Accor", "Atlantica", "IHG", "Marriott", "Wyndham", "Operadores", "Consolidadores"],
    paymentMethods: ["Faturamento", "Cartao virtual (VCN)", "Pagamento direto"],
    minimumFields: ["Confirmacao", "Hotel", "Cidade", "Check-in", "Check-out", "Diarias", "Tarifa/noite", "Total", "Hospede", "Status"],
  },
  "acordos-corporativos": {
    title: "Acordos Corporativos",
    category: "contratos-fornecedores",
    knowledgeCategories: ["contratos-fornecedores", "benchmark-mercado"],
    requirements: [
      "Todos os acordos corporativos vigentes com cias aereas (tarifas negociadas, descontos, upgrades)",
      "Acordos com redes hoteleiras (tarifas corporativas, last room availability)",
      "Acordos com locadoras de veiculos (tarifas, categorias, cobertura)",
      "Acordos bancarios para cartoes corporativos e virtuais",
      "Programas de incentivo, rebate e bonificacao de fornecedores",
    ],
    commonServices: ["Cias aereas", "Hoteis", "Locadoras", "Bancos", "Seguradoras"],
    paymentMethods: [],
    minimumFields: ["Fornecedor", "Vigencia", "Condicoes", "Tarifas/Descontos", "Metas", "Contrapartidas"],
  },
  "obt-gds": {
    title: "Sistemas OBT e GDS",
    category: "viagens-eventos",
    knowledgeCategories: ["viagens-eventos", "metodologia"],
    requirements: [
      "Exportacao completa do OBT (Online Booking Tool) com todas as reservas e solicitacoes",
      "Dados do GDS (Sabre, Amadeus, Travelport) com PNRs e historico de alteracoes",
      "Comparativo OBT vs. GDS vs. Backoffice para reconciliacao",
      "Dados de self-booking vs. offline (assistido)",
      "Relatorio de adocao e compliance do OBT",
    ],
    commonServices: ["Reservas aereas", "Reservas hotel", "Reservas carro", "Solicitacoes de viagem"],
    paymentMethods: [],
    minimumFields: ["PNR/Localizador", "Solicitante", "Viajante", "Origem/Destino", "Datas", "Fornecedor", "Tarifa", "Status", "Canal (online/offline)"],
  },
  "reembolso-credito": {
    title: "Controle de Reembolso e Credito",
    category: "despesas-corporativas",
    knowledgeCategories: ["despesas-corporativas", "compliance-etica"],
    requirements: [
      "Relatorio de todos os creditos gerados (cancelamentos, reemissoes, no-shows com credito)",
      "Controle de reembolsos solicitados e efetivados",
      "Creditos utilizados e creditos pendentes/expirados",
      "Conciliacao de creditos entre OBT, backoffice e fornecedores",
      "Evidencia de repasse de creditos ao cliente final",
    ],
    commonServices: ["Creditos aereos", "Creditos hoteleiros", "Reembolsos", "Vouchers"],
    paymentMethods: ["Credito em conta", "Abatimento em fatura", "Reemissao"],
    minimumFields: ["Bilhete/Reserva original", "Valor credito", "Data geracao", "Data utilizacao/expiracao", "Beneficiario", "Status"],
  },
  "pgtos-realizados": {
    title: "Pagamentos Realizados e Pendentes",
    category: "despesas-corporativas",
    knowledgeCategories: ["despesas-corporativas", "compliance-etica"],
    requirements: [
      "Relatorio gerencial de todos os pagamentos realizados a fornecedores",
      "Faturas de cobranca dos fornecedores (cias aereas, hoteis, locadoras, eventos)",
      "Notas de debito emitidas pelos fornecedores",
      "Notas fiscais correspondentes a cada pagamento",
      "Detalhamento de descontos aplicados: comissoes, incentivos, rebates, over-commission",
      "Pagamentos pendentes e aging de contas a pagar",
    ],
    commonServices: ["Cias aereas", "Hoteis", "Locadoras", "Eventos", "A&B", "Seguros"],
    paymentMethods: [
      "Cartao corporativo virtual (VCN) — Bradesco HCard, Itau CTA, CTA Hoteis, Purchase",
      "Cartao virtual Santander/Cielo",
      "OuroCard Banco do Brasil",
      "Faturamento + Nota de debito + Nota fiscal",
      "Boleto bancario",
      "PIX",
      "Deposito/Transferencia bancaria",
    ],
    minimumFields: ["Fornecedor", "CNPJ", "Fatura/NF", "Valor bruto", "Descontos (comissao/rebate/incentivo)", "Valor liquido", "Data vencimento", "Data pagamento", "Forma pagamento", "Status"],
  },
  "receitas-recebidas": {
    title: "Receitas Recebidas e Pendentes",
    category: "despesas-corporativas",
    knowledgeCategories: ["despesas-corporativas", "compliance-etica"],
    requirements: [
      "Relatorio gerencial de todas as receitas recebidas dos clientes corporativos",
      "Faturas emitidas pela agencia aos clientes",
      "Notas fiscais de servico emitidas",
      "Receitas pendentes e aging de contas a receber",
      "Conciliacao receita vs. servico prestado vs. pagamento ao fornecedor",
    ],
    commonServices: ["Fee de servico", "Markup", "Comissoes", "Incentivos repassados"],
    paymentMethods: [
      "Cartao credito corporativo do cliente",
      "Cartao virtual (VCN) do cliente — Bradesco EBTA/HCard, Itau CTA, Santander/Cielo, OuroCard BB",
      "Faturamento mensal",
      "Boleto bancario",
      "PIX",
      "Deposito/Transferencia",
    ],
    minimumFields: ["Cliente", "CNPJ", "Fatura/NF", "Periodo ref.", "Valor", "Data emissao", "Data recebimento", "Forma pagamento", "Status"],
  },
  "extratos-cartoes": {
    title: "Extratos de Cartoes de Credito Corporativos",
    category: "despesas-corporativas",
    knowledgeCategories: ["despesas-corporativas", "viagens-eventos"],
    requirements: [
      "Extratos originais completos de todos os cartoes corporativos utilizados",
      "Extratos de cartoes virtuais (VCN - Virtual Card Number)",
      "Identificacao clara de cada transacao com data, fornecedor e valor",
      "Extratos do periodo completo da auditoria (2024-2025)",
    ],
    commonServices: [],
    paymentMethods: [
      "Bradesco EBTA (Extrato Bancario de Transacoes da Agencia)",
      "Bradesco HCard",
      "Itau CTA (Cartao de Transacoes da Agencia)",
      "Itau CTA Hoteis",
      "Itau Purchase",
      "Santander / Cielo",
      "OuroCard Banco do Brasil",
      "Outros bancos e cartoes virtuais (VCN)",
    ],
    minimumFields: ["Data transacao", "Descricao/Fornecedor", "Valor", "Numero cartao (ultimos 4)", "Tipo (credito/debito)", "Status"],
  },
  "reservas-hospedagem": {
    title: "Reservas e Faturas de Hospedagem",
    category: "viagens-eventos",
    knowledgeCategories: ["viagens-eventos", "contratos-fornecedores"],
    requirements: [
      "Reservas originais de todas as hospedagens no periodo",
      "Faturas detalhadas dos hoteis com diarias, extras, taxas e impostos",
      "Comprovantes de check-in e check-out",
      "No-shows e cancelamentos com respectivas penalidades",
      "Comparativo tarifa negociada vs. tarifa praticada",
    ],
    commonServices: ["Hoteis nacionais", "Hoteis internacionais", "Flats/Apartamentos", "Resorts"],
    paymentMethods: ["Cartao virtual (VCN)", "Faturamento", "Pagamento direto"],
    minimumFields: ["Confirmacao", "Hotel", "Cidade", "Hospede", "Check-in", "Check-out", "Diarias", "Tarifa", "Extras", "Total", "Forma pagamento"],
  },
  "fee-rebate-comissoes": {
    title: "FEE, Rebate, Comissoes e Incentivos",
    category: "despesas-corporativas",
    knowledgeCategories: ["contratos-fornecedores", "benchmark-mercado", "despesas-corporativas"],
    requirements: [
      "Relatorio detalhado de cobranca de fee (transaction fee, management fee, consulting fee)",
      "Demonstrativo de rebates recebidos por fornecedor e periodo",
      "Comissoes recebidas de cada fornecedor (aereo, hotel, carro, seguro)",
      "Incentivos, bonificacoes e over-commission por meta atingida",
      "Conciliacao: fee cobrado do cliente vs. comissao/rebate recebido do fornecedor",
      "Transparencia na cadeia de valor: cliente → agencia → fornecedor",
    ],
    commonServices: ["Fee de servico", "Comissao aerea", "Comissao hoteleira", "Rebate por volume", "Incentivo por meta", "Over-commission"],
    paymentMethods: ["Desconto em fatura", "Credito em conta", "Repasse direto"],
    minimumFields: ["Tipo (fee/rebate/comissao/incentivo)", "Fornecedor", "Cliente", "Periodo", "Base calculo", "Percentual/Valor", "Data pagamento", "Status"],
  },
};

const VALID_DOCUMENT_KEYS = Object.keys(DOCUMENT_REQUIREMENTS);

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

  app.get("/api/uploads/requirements/:documentKey", requireAuth, async (req: Request, res: Response) => {
    try {
      const { documentKey } = req.params;
      const docReq = DOCUMENT_REQUIREMENTS[documentKey];
      if (!docReq) {
        return res.status(404).json({ error: "Documento nao encontrado" });
      }

      let knowledgeNotes: string[] = [];
      try {
        const knowledgeDocs = await db
          .select()
          .from(iaKnowledgeDocs)
          .where(eq(iaKnowledgeDocs.isActive, true));

        const relevant = knowledgeDocs.filter(
          (d) => docReq.knowledgeCategories.includes(d.category || "general")
        );

        for (const doc of relevant.slice(0, 5)) {
          if (doc.extractedText) {
            const snippet = doc.extractedText.substring(0, 1500);
            knowledgeNotes.push(`[${doc.title}]: ${snippet}`);
          }
        }
      } catch (e) {
        // knowledge base optional
      }

      res.json({
        documentKey,
        title: docReq.title,
        category: docReq.category,
        requirements: docReq.requirements,
        commonServices: docReq.commonServices,
        paymentMethods: docReq.paymentMethods,
        minimumFields: docReq.minimumFields,
        knowledgeNotes: knowledgeNotes.length > 0 ? knowledgeNotes : null,
      });
    } catch (error: any) {
      console.error("Error fetching requirements:", error.message);
      res.status(500).json({ error: "Erro ao buscar requisitos" });
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
            status: "em_analise",
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
          status: checked === true ? "aguardando_validacao" : "em_analise",
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
