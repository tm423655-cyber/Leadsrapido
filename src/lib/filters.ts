import { fold } from "./text";
import type { LeadStatus, StoredLead } from "./types";

export interface LeadFilters {
  onlyNoSite: boolean;
  withPhone: boolean;
  withWhatsApp: boolean;
  minRating: number;
  minReviews: number;
  minScore: number;
  niche: string;
  city: string;
  status: LeadStatus | "";
  query: string;
  onlyLastSearch: boolean;
  showDiscarded: boolean;
}

export const DEFAULT_FILTERS: LeadFilters = {
  onlyNoSite: false,
  withPhone: false,
  withWhatsApp: false,
  minRating: 0,
  minReviews: 0,
  minScore: 0,
  niche: "",
  city: "",
  status: "",
  query: "",
  onlyLastSearch: false,
  showDiscarded: false,
};

export function leadCityLabel(lead: StoredLead): string {
  return lead.city ? [lead.city, lead.state].filter(Boolean).join(" - ") : lead.searchLocation.replace(", ", " - ");
}

export function applyFilters(leads: StoredLead[], f: LeadFilters, lastSearchId: string | null): StoredLead[] {
  const q = fold(f.query);
  return leads.filter((l) => {
    if (l.discarded !== f.showDiscarded) return false;
    if (f.onlyNoSite && l.siteStatus !== "sem_site") return false;
    if (f.withPhone && !l.phoneDigits) return false;
    if (f.withWhatsApp && l.whatsappStatus === "nao") return false;
    if (f.minRating > 0 && (l.rating ?? 0) < f.minRating) return false;
    if (f.minReviews > 0 && (l.reviewsCount ?? 0) < f.minReviews) return false;
    if (f.minScore > 0 && l.score < f.minScore) return false;
    if (f.niche && l.niche !== f.niche) return false;
    if (f.city && leadCityLabel(l) !== f.city) return false;
    if (f.status && l.status !== f.status) return false;
    if (f.onlyLastSearch && lastSearchId && l.searchId !== lastSearchId) return false;
    if (q && !fold(`${l.name} ${l.category ?? ""} ${l.address ?? ""}`).includes(q)) return false;
    return true;
  });
}

export function countActiveFilters(f: LeadFilters): number {
  return (Object.keys(DEFAULT_FILTERS) as (keyof LeadFilters)[]).filter((k) => f[k] !== DEFAULT_FILTERS[k]).length;
}
