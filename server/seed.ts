import { db } from "./db";
import { expenses, auditCases, anomalies, auditTrail, clients, dataSources } from "@shared/schema";
import { createHash } from "crypto";
import { sql } from "drizzle-orm";

function hash(data: any, timestamp: string): string {
  const payload = JSON.stringify({ ...data, _ts: timestamp });
  return createHash("sha256").update(payload).digest("hex");
}

export async function seedDatabase() {
  const existingExpenses = await db.select({ id: expenses.id }).from(expenses).limit(1);
  if (existingExpenses.length > 0) return;

  console.log("Seeding database with sample data...");

  const sampleClients = [
    {
      name: "CVC Corp Business Travel",
      type: "travel_agency",
      cnpj: "10.760.260/0001-19",
      contactName: "Mariana Tavares",
      contactEmail: "mariana.tavares@cvccorp.com.br",
      contactPhone: "(11) 3003-9282",
      address: "Rua das Figueiras, 501",
      city: "Santo Andre",
      state: "SP",
      status: "active",
      notes: "Agencia principal - contrato vigente desde 2022",
    },
    {
      name: "Grupo Flytour",
      type: "travel_agency",
      cnpj: "02.296.397/0001-05",
      contactName: "Roberto Nascimento",
      contactEmail: "roberto.nascimento@flytour.com.br",
      contactPhone: "(11) 4003-7700",
      address: "Av. Paulista, 1842",
      city: "Sao Paulo",
      state: "SP",
      status: "active",
      notes: "Agencia secundaria - foco em viagens internacionais",
    },
    {
      name: "BRT Operadora de Viagens",
      type: "travel_agency",
      cnpj: "07.543.218/0001-90",
      contactName: "Claudia Fernandes",
      contactEmail: "claudia@brtviagens.com.br",
      contactPhone: "(21) 3231-5500",
      address: "Rua da Assembleia, 100",
      city: "Rio de Janeiro",
      state: "RJ",
      status: "active",
    },
    {
      name: "Petrobras S.A.",
      type: "corporate_company",
      cnpj: "33.000.167/0001-01",
      contactName: "Eduardo Gomes",
      contactEmail: "eduardo.gomes@petrobras.com.br",
      contactPhone: "(21) 3224-4477",
      address: "Av. Republica do Chile, 65",
      city: "Rio de Janeiro",
      state: "RJ",
      status: "active",
      notes: "Cliente corporativo - auditoria de viagens e eventos 2024/2025",
    },
    {
      name: "Embraer S.A.",
      type: "corporate_company",
      cnpj: "07.689.002/0001-89",
      contactName: "Fernanda Lopes",
      contactEmail: "fernanda.lopes@embraer.com.br",
      contactPhone: "(12) 3927-1000",
      address: "Av. Brigadeiro Faria Lima, 2170",
      city: "Sao Jose dos Campos",
      state: "SP",
      status: "active",
      notes: "Cliente corporativo - alto volume de viagens internacionais",
    },
    {
      name: "Vale S.A.",
      type: "corporate_company",
      cnpj: "33.592.510/0001-54",
      contactName: "Carlos Menezes",
      contactEmail: "carlos.menezes@vale.com",
      contactPhone: "(21) 3485-5000",
      address: "Praia de Botafogo, 186",
      city: "Rio de Janeiro",
      state: "RJ",
      status: "pending",
      notes: "Em processo de onboarding",
    },
  ];

  const createdClients = await db.insert(clients).values(sampleClients).returning();

  const sampleDataSources = [
    {
      clientId: createdClients[3].id,
      name: "Bradesco EBTA - Cartao Corporativo",
      type: "bradesco_ebta",
      status: "connected",
      lastSyncAt: new Date("2026-02-10"),
      syncFrequency: "daily",
      fileFormat: "csv",
      description: "Integracao com Banco Bradesco para conciliacao de cartoes corporativos EBTA. Dados de transacoes, faturas e limites.",
      config: { bankCode: "237", accountType: "corporate_card", product: "EBTA", apiVersion: "v2" },
      totalRecords: 12847,
      totalAmount: "8534200.00",
    },
    {
      clientId: createdClients[0].id,
      name: "CVC Corp - Arquivos Gerenciais",
      type: "travel_agency",
      status: "connected",
      lastSyncAt: new Date("2026-02-01"),
      syncFrequency: "monthly",
      fileFormat: "xlsx",
      description: "Arquivos gerenciais mensais da CVC Corp com detalhamento de reservas, emissoes e faturamento.",
      config: { reportType: "management", deliveryMethod: "sftp", format: "xlsx" },
      totalRecords: 8542,
      totalAmount: "15230000.00",
    },
    {
      clientId: createdClients[1].id,
      name: "Flytour - Relatorios Gerenciais",
      type: "travel_agency",
      status: "connected",
      lastSyncAt: new Date("2026-01-31"),
      syncFrequency: "monthly",
      fileFormat: "csv",
      description: "Relatorios gerenciais mensais do Grupo Flytour incluindo emissoes nacionais e internacionais.",
      config: { reportType: "management", deliveryMethod: "email", format: "csv" },
      totalRecords: 3215,
      totalAmount: "7890000.00",
    },
    {
      clientId: null,
      name: "LATAM Airlines - Dados de Bilhetes",
      type: "airline",
      status: "connected",
      lastSyncAt: new Date("2026-02-08"),
      syncFrequency: "weekly",
      fileFormat: "xml",
      description: "Feed de dados de bilhetes emitidos pela LATAM Airlines para conciliacao com BSP e agencias.",
      config: { airline: "LA/JJ", iataCode: "045", feedType: "ticket_data" },
      totalRecords: 5678,
      totalAmount: "12450000.00",
    },
    {
      clientId: null,
      name: "GOL Linhas Aereas - Emissoes",
      type: "airline",
      status: "connected",
      lastSyncAt: new Date("2026-02-07"),
      syncFrequency: "weekly",
      fileFormat: "csv",
      description: "Dados de emissoes e reembolsos da GOL para reconciliacao.",
      config: { airline: "G3", iataCode: "127", feedType: "ticket_issuance" },
      totalRecords: 3421,
      totalAmount: "5680000.00",
    },
    {
      clientId: null,
      name: "Azul Linhas Aereas - Bilhetes",
      type: "airline",
      status: "pending",
      syncFrequency: "weekly",
      fileFormat: "xml",
      description: "Integracao com Azul para dados de bilhetes e reembolsos.",
      config: { airline: "AD", iataCode: "577", feedType: "ticket_data" },
      totalRecords: 0,
      totalAmount: "0",
    },
    {
      clientId: null,
      name: "Accor Hotels - Reservas e Faturas",
      type: "hotel_chain",
      status: "connected",
      lastSyncAt: new Date("2026-02-05"),
      syncFrequency: "monthly",
      fileFormat: "xlsx",
      description: "Dados de reservas, check-ins e faturas da rede Accor (Novotel, Ibis, Mercure, Pullman).",
      config: { chain: "Accor", brands: ["Novotel", "Ibis", "Mercure", "Pullman"], reportType: "billing" },
      totalRecords: 2340,
      totalAmount: "4560000.00",
    },
    {
      clientId: null,
      name: "Atlantica Hotels - Hospedagem",
      type: "hotel_chain",
      status: "connected",
      lastSyncAt: new Date("2026-02-03"),
      syncFrequency: "monthly",
      fileFormat: "csv",
      description: "Dados de hospedagem da rede Atlantica (Comfort, Quality, Radisson).",
      config: { chain: "Atlantica", brands: ["Comfort", "Quality", "Radisson"], reportType: "stay_report" },
      totalRecords: 1890,
      totalAmount: "3210000.00",
    },
    {
      clientId: null,
      name: "Localiza Hertz - Locacoes",
      type: "car_rental",
      status: "connected",
      lastSyncAt: new Date("2026-02-06"),
      syncFrequency: "monthly",
      fileFormat: "csv",
      description: "Dados de locacoes de veiculos corporativos da Localiza Hertz.",
      config: { provider: "Localiza", contractType: "corporate", includeInsurance: true },
      totalRecords: 1567,
      totalAmount: "2340000.00",
    },
    {
      clientId: null,
      name: "Movida - Frotas e Locacoes",
      type: "car_rental",
      status: "pending",
      syncFrequency: "monthly",
      fileFormat: "xlsx",
      description: "Integracao com Movida para dados de locacoes e gestao de frotas.",
      config: { provider: "Movida", contractType: "fleet_management" },
      totalRecords: 0,
      totalAmount: "0",
    },
    {
      clientId: null,
      name: "Porto Seguro Viagem",
      type: "insurer",
      status: "connected",
      lastSyncAt: new Date("2026-02-04"),
      syncFrequency: "monthly",
      fileFormat: "csv",
      description: "Dados de apolices de seguro viagem corporativo da Porto Seguro.",
      config: { insurer: "Porto Seguro", product: "travel_insurance", policyType: "corporate" },
      totalRecords: 890,
      totalAmount: "456000.00",
    },
    {
      clientId: null,
      name: "GDS Sabre - Reservas e PNRs",
      type: "gds_sabre",
      status: "connected",
      lastSyncAt: new Date("2026-02-09"),
      syncFrequency: "daily",
      fileFormat: "api",
      description: "Integracao com GDS Sabre para captura de PNRs, reservas aereas, hoteis e carros. Dados utilizados para conciliacao com OBT e backoffice.",
      config: { pcc: "4REF", gdsType: "Sabre", apiEndpoint: "webservices.sabre.com", modules: ["air", "hotel", "car"] },
      totalRecords: 18934,
      totalAmount: "28900000.00",
    },
    {
      clientId: null,
      name: "GDS Amadeus - Reservas e PNRs",
      type: "gds_amadeus",
      status: "connected",
      lastSyncAt: new Date("2026-02-09"),
      syncFrequency: "daily",
      fileFormat: "api",
      description: "Integracao com GDS Amadeus para captura de PNRs e reservas. Complementa dados do Sabre para conciliacao cruzada.",
      config: { officeId: "SAOBR08AA", gdsType: "Amadeus", apiEndpoint: "api.amadeus.com", modules: ["air", "hotel"] },
      totalRecords: 7621,
      totalAmount: "11200000.00",
    },
    {
      clientId: null,
      name: "BSPlink - Billing and Settlement",
      type: "bsplink",
      status: "connected",
      lastSyncAt: new Date("2026-02-08"),
      syncFrequency: "weekly",
      fileFormat: "csv",
      description: "Dados do BSPlink (IATA Billing and Settlement Plan) para conciliacao de bilhetes aereos entre agencias e companhias aereas.",
      config: { iataNumber: "12345678", region: "Americas", reportTypes: ["HOT", "STD", "ADM", "ACM"] },
      totalRecords: 15230,
      totalAmount: "21300000.00",
    },
  ];

  await db.insert(dataSources).values(sampleDataSources);

  const sampleExpenses = [
    {
      type: "travel", category: "airfare", description: "Passagem aerea GRU-GIG - Reuniao Diretoria",
      amount: "2450.00", currency: "BRL", date: new Date("2025-11-15"), vendor: "LATAM Airlines",
      department: "Diretoria", employee: "Carlos Mendes", status: "approved", riskLevel: "low",
      origin: "Sao Paulo", destination: "Rio de Janeiro", notes: "Classe executiva autorizada"
    },
    {
      type: "travel", category: "airfare", description: "Passagem aerea GRU-BSB - Conferencia Governanca",
      amount: "1890.00", currency: "BRL", date: new Date("2025-11-20"), vendor: "GOL Linhas Aereas",
      department: "Compliance", employee: "Ana Rodrigues", status: "approved", riskLevel: "low",
      origin: "Sao Paulo", destination: "Brasilia"
    },
    {
      type: "travel", category: "airfare", description: "Passagem aerea GRU-MIA - Treinamento Internacional",
      amount: "8750.00", currency: "BRL", date: new Date("2025-12-01"), vendor: "American Airlines",
      department: "TI", employee: "Ricardo Silva", status: "flagged", riskLevel: "high",
      origin: "Sao Paulo", destination: "Miami", notes: "Valor acima da media - necessita aprovacao especial"
    },
    {
      type: "accommodation", category: "hotel", description: "Hospedagem Hotel Windsor - 3 noites",
      amount: "3600.00", currency: "BRL", date: new Date("2025-11-15"), vendor: "Hotel Windsor Atlantica",
      department: "Diretoria", employee: "Carlos Mendes", status: "approved", riskLevel: "low",
      origin: "Rio de Janeiro", destination: "Rio de Janeiro"
    },
    {
      type: "accommodation", category: "hotel", description: "Hospedagem Hilton Brasilia - 2 noites",
      amount: "2200.00", currency: "BRL", date: new Date("2025-11-20"), vendor: "Hilton Hotels",
      department: "Compliance", employee: "Ana Rodrigues", status: "approved", riskLevel: "low"
    },
    {
      type: "travel", category: "meals", description: "Jantar corporativo - Fornecedores",
      amount: "4500.00", currency: "BRL", date: new Date("2025-11-18"), vendor: "Restaurante Fasano",
      department: "Comercial", employee: "Fernando Costa", status: "flagged", riskLevel: "high",
      notes: "Valor elevado para refeicao - solicitar justificativa"
    },
    {
      type: "travel", category: "transport", description: "Locacao veiculo executivo - 5 dias",
      amount: "1800.00", currency: "BRL", date: new Date("2025-11-22"), vendor: "Localiza Hertz",
      department: "Operacoes", employee: "Patricia Lima", status: "pending", riskLevel: "medium"
    },
    {
      type: "event", category: "event", description: "Inscricao Seminario Auditoria e Compliance 2025",
      amount: "5200.00", currency: "BRL", date: new Date("2025-12-05"), vendor: "IBGC",
      department: "Auditoria", employee: "Marcos Oliveira", status: "approved", riskLevel: "low"
    },
    {
      type: "travel", category: "airfare", description: "Passagem aerea GRU-GIG - Mesma rota duplicada",
      amount: "2450.00", currency: "BRL", date: new Date("2025-11-15"), vendor: "LATAM Airlines",
      department: "Diretoria", employee: "Carlos Mendes", status: "flagged", riskLevel: "critical",
      origin: "Sao Paulo", destination: "Rio de Janeiro", notes: "Possivel duplicidade com outra emissao"
    },
    {
      type: "accommodation", category: "hotel", description: "Suite presidencial - Hotel Copacabana Palace",
      amount: "12500.00", currency: "BRL", date: new Date("2025-12-10"), vendor: "Copacabana Palace",
      department: "Presidencia", employee: "Roberto Andrade", status: "flagged", riskLevel: "critical",
      notes: "Valor muito acima da politica - suite presidencial nao autorizada"
    },
    {
      type: "travel", category: "transport", description: "Uber corporativo - Deslocamento aeroporto",
      amount: "185.00", currency: "BRL", date: new Date("2025-11-25"), vendor: "Uber",
      department: "RH", employee: "Juliana Santos", status: "approved", riskLevel: "low"
    },
    {
      type: "travel", category: "meals", description: "Almoco de trabalho - Equipe auditoria",
      amount: "320.00", currency: "BRL", date: new Date("2025-11-28"), vendor: "Restaurante Outback",
      department: "Auditoria", employee: "Marcos Oliveira", status: "approved", riskLevel: "low"
    },
    {
      type: "event", category: "event", description: "Workshop Anticorrupcao - Modulo Avancado",
      amount: "3800.00", currency: "BRL", date: new Date("2025-12-15"), vendor: "FGV Educacao",
      department: "Juridico", employee: "Lucia Ferreira", status: "pending", riskLevel: "low"
    },
    {
      type: "travel", category: "airfare", description: "Passagem aerea CGH-SDU - Ida e volta mesmo dia",
      amount: "980.00", currency: "BRL", date: new Date("2025-12-02"), vendor: "Azul Linhas Aereas",
      department: "Financeiro", employee: "Eduardo Martins", status: "approved", riskLevel: "low",
      origin: "Sao Paulo", destination: "Rio de Janeiro"
    },
    {
      type: "accommodation", category: "hotel", description: "Hospedagem sem comprovante fiscal",
      amount: "1950.00", currency: "BRL", date: new Date("2025-11-30"), vendor: "Pousada Centro",
      department: "Comercial", employee: "Fernando Costa", status: "flagged", riskLevel: "high",
      notes: "Comprovante fiscal nao anexado"
    },
  ];

  const createdExpenses = await db.insert(expenses).values(sampleExpenses).returning();

  const sampleCases = [
    {
      title: "Revisao Despesas Viagens Q4/2025",
      description: "Auditoria completa das despesas de viagens corporativas do quarto trimestre de 2025, incluindo passagens aereas, hospedagem e alimentacao.",
      status: "in_progress",
      priority: "high",
      assignedTo: "Ana Rodrigues",
      methodology: "Amostragem estatistica com analise de 100% das transacoes acima de R$ 5.000,00. Cruzamento de dados com fornecedores e benchmarking de mercado.",
      scope: "Todas as despesas de viagens registradas entre outubro e dezembro de 2025, abrangendo todos os departamentos.",
      findings: "Identificadas 3 possiveiis duplicidades em emissoes aereas, 2 despesas com hoteis acima da politica corporativa, e 1 jantar com valor fora do padrao.",
      recommendations: "Implementar controle preventivo de emissoes duplicadas, revisar limites da politica de hospedagem e estabelecer teto para despesas com alimentacao.",
      totalAmount: "45895.00",
      savingsIdentified: "16300.00",
    },
    {
      title: "Investigacao Duplicidade Bilhetes Aereos",
      description: "Investigacao de possivel emissao duplicada de bilhetes aereos na rota GRU-GIG em novembro/2025.",
      status: "open",
      priority: "critical",
      assignedTo: "Marcos Oliveira",
      methodology: "Analise forense comparativa de bilhetes emitidos, confronto com registros BSP e verificacao junto a companhia aerea.",
      scope: "Bilhetes aereos emitidos para o funcionario Carlos Mendes em novembro de 2025.",
      totalAmount: "4900.00",
      savingsIdentified: "2450.00",
    },
    {
      title: "Conformidade Politica de Hospedagem",
      description: "Verificacao de aderencia das despesas de hospedagem a politica de viagens corporativas vigente.",
      status: "open",
      priority: "medium",
      assignedTo: "Patricia Lima",
      methodology: "Comparacao sistematica entre valores praticados e limites estabelecidos na politica de viagens por cidade e cargo.",
      scope: "Todas as reservas de hospedagem realizadas nos ultimos 6 meses.",
      totalAmount: "20250.00",
      savingsIdentified: "12500.00",
    },
  ];

  const createdCases = await db.insert(auditCases).values(sampleCases).returning();

  const sampleAnomalies = [
    {
      expenseId: createdExpenses[8].id,
      type: "duplicate",
      severity: "critical",
      description: "Bilhete aereo possivelmente duplicado - mesma rota, data e passageiro (GRU-GIG, Carlos Mendes, 15/11/2025)",
      resolved: false,
    },
    {
      expenseId: createdExpenses[9].id,
      type: "overpriced",
      severity: "critical",
      description: "Hospedagem em suite presidencial (R$ 12.500) excede em 520% o limite da politica corporativa (R$ 2.000/noite)",
      resolved: false,
    },
    {
      expenseId: createdExpenses[5].id,
      type: "overpriced",
      severity: "high",
      description: "Jantar corporativo de R$ 4.500 para 4 pessoas - valor medio por pessoa de R$ 1.125 acima do padrao de R$ 250",
      resolved: false,
    },
    {
      expenseId: createdExpenses[14].id,
      type: "missing_receipt",
      severity: "high",
      description: "Despesa de hospedagem de R$ 1.950 sem comprovante fiscal anexado - exigencia obrigatoria",
      resolved: false,
    },
    {
      expenseId: createdExpenses[2].id,
      type: "policy_violation",
      severity: "medium",
      description: "Passagem internacional sem autorizacao previa do gestor conforme politica de viagens internacionais",
      resolved: false,
    },
    {
      expenseId: createdExpenses[6].id,
      type: "unusual_pattern",
      severity: "medium",
      description: "Locacao de veiculo executivo por 5 dias para deslocamento que normalmente utiliza transporte publico/taxi",
      resolved: true,
      resolvedBy: "Ana Rodrigues",
      resolution: "Verificado que a funcionaria necessitou visitar 3 unidades em cidades diferentes durante o periodo. Justificativa aceita.",
    },
    {
      expenseId: createdExpenses[0].id,
      type: "policy_violation",
      severity: "low",
      description: "Classe executiva utilizada sem pre-aprovacao formal - politica exige autorizacao por escrito do diretor",
      resolved: true,
      resolvedBy: "Marcos Oliveira",
      resolution: "Aprovacao retroativa concedida pelo diretor. Processo de aprovacao previa recomendado.",
    },
  ];

  await db.insert(anomalies).values(sampleAnomalies);

  const seedTimestamp = new Date().toISOString();

  const trailEntries = createdExpenses.slice(0, 5).map((exp) => ({
    userId: "system",
    action: "create",
    entityType: "expense",
    entityId: exp.id,
    dataBefore: null,
    dataAfter: exp as any,
    integrityHash: hash(exp, seedTimestamp),
    ipAddress: "127.0.0.1",
  }));

  trailEntries.push(
    ...createdCases.map((c) => ({
      userId: "system",
      action: "create",
      entityType: "audit_case",
      entityId: c.id,
      dataBefore: null,
      dataAfter: c as any,
      integrityHash: hash(c, seedTimestamp),
      ipAddress: "127.0.0.1",
    }))
  );

  trailEntries.push(
    ...createdClients.map((cl) => ({
      userId: "system",
      action: "create",
      entityType: "client",
      entityId: cl.id,
      dataBefore: null,
      dataAfter: cl as any,
      integrityHash: hash(cl, seedTimestamp),
      ipAddress: "127.0.0.1",
    }))
  );

  trailEntries.push({
    userId: "Ana Rodrigues",
    action: "flag",
    entityType: "expense",
    entityId: createdExpenses[8].id,
    dataBefore: { status: "pending" } as any,
    dataAfter: { status: "flagged", riskLevel: "critical" } as any,
    integrityHash: hash({ action: "flag", id: createdExpenses[8].id }, seedTimestamp),
    ipAddress: "192.168.1.50",
  });

  trailEntries.push({
    userId: "Marcos Oliveira",
    action: "resolve",
    entityType: "anomaly",
    entityId: "resolved-anomaly",
    dataBefore: { resolved: false } as any,
    dataAfter: { resolved: true, resolvedBy: "Marcos Oliveira" } as any,
    integrityHash: hash({ action: "resolve" }, seedTimestamp),
    ipAddress: "192.168.1.55",
  });

  await db.insert(auditTrail).values(trailEntries);

  console.log("Database seeded successfully!");
}
