import { LEAD_STATUSES, type LeadStatus, type SiteStatus, type WhatsAppStatus } from "./types";

export const SITE_STATUS_LABEL: Record<SiteStatus, string> = {
  sem_site: "Sem site",
  possui_site: "Possui site",
  nao_identificado: "Não identificado",
};

export const WHATSAPP_LABEL: Record<WhatsAppStatus, string> = {
  confirmado: "Confirmado pela fonte",
  provavel: "Provável (celular)",
  nao: "Não identificado",
};

export const STATUS_LABEL = Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, s.label])) as Record<LeadStatus, string>;

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatRating(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
