export function formatCurrency(value: number | string, currency = "BRL"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case "critical": return "text-red-600 dark:text-red-400";
    case "high": return "text-orange-600 dark:text-orange-400";
    case "medium": return "text-yellow-600 dark:text-yellow-400";
    case "low": return "text-green-600 dark:text-green-400";
    default: return "text-muted-foreground";
  }
}

export function getRiskBadgeVariant(risk: string): "default" | "secondary" | "destructive" | "outline" {
  switch (risk) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    flagged: "Sinalizado",
    under_review: "Em Revisao",
    open: "Aberto",
    in_progress: "Em Andamento",
    closed: "Encerrado",
    resolved: "Resolvido",
  };
  return labels[status] || status;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    airfare: "Passagem Aerea",
    hotel: "Hospedagem",
    meals: "Alimentacao",
    transport: "Transporte",
    event: "Evento",
    other: "Outros",
  };
  return labels[category] || category;
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    travel: "Viagem",
    event: "Evento",
    accommodation: "Hospedagem",
  };
  return labels[type] || type;
}

export function getAnomalyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    duplicate: "Duplicata",
    overpriced: "Sobrepreco",
    policy_violation: "Violacao de Politica",
    missing_receipt: "Sem Comprovante",
    unusual_pattern: "Padrao Incomum",
    vendor_mismatch: "Fornecedor Divergente",
  };
  return labels[type] || type;
}

export function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: "Critico",
    high: "Alto",
    medium: "Medio",
    low: "Baixo",
  };
  return labels[severity] || severity;
}
