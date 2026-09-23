import type { Lead, ScoreItem } from "./types";

type ScoreInput = Pick<
  Lead,
  "siteStatus" | "phoneDigits" | "whatsappStatus" | "reviewsCount" | "rating" | "street" | "city" | "state" | "postalCode" | "address"
>;

/** Endereço completo = rua (com número ou não), cidade e UF/CEP. */
export function hasCompleteAddress(lead: Pick<Lead, "street" | "city" | "state" | "postalCode" | "address">): boolean {
  if (lead.street && lead.city && (lead.state || lead.postalCode)) return true;
  // Sem campos estruturados: aceita endereço textual com rua, número e cidade (≥ 3 partes).
  if (!lead.street && lead.address) {
    const parts = lead.address.split(/[,\-–]/).map((p) => p.trim()).filter(Boolean);
    return parts.length >= 3 && /\d/.test(lead.address);
  }
  return false;
}

/**
 * Pontuação de 0 a 100:
 * +40 sem site · +20 telefone · +15 WhatsApp · +10 mais de 20 avaliações ·
 * +10 nota ≥ 4 · +5 endereço completo.
 */
export function scoreLead(lead: ScoreInput): { score: number; breakdown: ScoreItem[] } {
  const breakdown: ScoreItem[] = [];
  if (lead.siteStatus === "sem_site") breakdown.push({ label: "Sem site", points: 40 });
  if (lead.phoneDigits) breakdown.push({ label: "Tem telefone", points: 20 });
  if (lead.whatsappStatus !== "nao") breakdown.push({ label: "Tem WhatsApp", points: 15 });
  if ((lead.reviewsCount ?? 0) > 20) breakdown.push({ label: "Mais de 20 avaliações", points: 10 });
  if (lead.rating !== null && lead.rating >= 4) breakdown.push({ label: "Nota ≥ 4", points: 10 });
  if (hasCompleteAddress(lead)) breakdown.push({ label: "Endereço completo", points: 5 });
  const score = Math.min(100, breakdown.reduce((sum, item) => sum + item.points, 0));
  return { score, breakdown };
}

const SITE_ORDER = { sem_site: 0, nao_identificado: 1, possui_site: 2 } as const;

/** Maior pontuação primeiro; empate → sem site, mais avaliações, melhor nota, nome. */
export function compareLeads(a: Lead, b: Lead): number {
  return (
    b.score - a.score ||
    SITE_ORDER[a.siteStatus] - SITE_ORDER[b.siteStatus] ||
    (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0) ||
    (b.rating ?? 0) - (a.rating ?? 0) ||
    a.name.localeCompare(b.name, "pt-BR")
  );
}
