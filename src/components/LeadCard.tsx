"use client";

import { WHATSAPP_LABEL, formatDateTime, formatRating } from "@/lib/labels";
import type { StoredLead } from "@/lib/types";
import { ClockIcon, GlobeIcon, InstagramIcon, MapPinIcon, PhoneIcon, StarIcon, WhatsAppIcon } from "./Icons";
import { LeadActions, ScoreRing, SiteBadge, StatusSelect, type LeadActionsHandlers } from "./LeadParts";

function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export default function LeadCard({ lead, handlers }: { lead: StoredLead; handlers: LeadActionsHandlers }) {
  return (
    <article
      className={`card flex flex-col gap-4 p-4 sm:p-5 ${lead.siteStatus === "sem_site" ? "ring-1 ring-emerald-400/20" : ""} ${lead.discarded ? "opacity-60" : ""}`}
      aria-label={lead.name}
    >
      <header className="flex items-start gap-3">
        <ScoreRing score={lead.score} breakdown={lead.scoreBreakdown} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <SiteBadge lead={lead} />
            {lead.source === "demo" && <span className="badge border-amber-400/30 bg-amber-400/10 text-amber-200">Fictício</span>}
            {lead.inCity === false && <span className="badge border-orange-400/30 bg-orange-400/10 text-orange-200">Outra cidade</span>}
            {lead.temporarilyClosed && <span className="badge border-red-400/30 bg-red-400/10 text-red-200">Fechado temporariamente</span>}
          </div>
          <h3 className="mt-1.5 font-display text-base font-semibold leading-snug break-words">{lead.name}</h3>
          <p className="truncate text-xs text-muted">
            {[lead.category, lead.category && lead.category.toLowerCase() === lead.niche.toLowerCase() ? null : lead.niche].filter(Boolean).join(" · ")}
          </p>
        </div>
      </header>

      <dl className="grid gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="sr-only">Endereço</dt>
          <MapPinIcon className="mt-0.5 shrink-0 text-faint" />
          <dd className="text-muted">{lead.address ?? <span className="text-faint">Endereço não informado</span>}</dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Telefone</dt>
            <PhoneIcon className="shrink-0 text-faint" />
            <dd>{lead.phone ?? <span className="text-faint">Sem telefone</span>}</dd>
          </div>
          <div className="flex items-center gap-2" title={WHATSAPP_LABEL[lead.whatsappStatus]}>
            <dt className="sr-only">WhatsApp</dt>
            <WhatsAppIcon className={`shrink-0 ${lead.whatsappStatus === "nao" ? "text-faint" : "text-emerald-300"}`} />
            <dd className={lead.whatsappStatus === "nao" ? "text-faint" : "text-emerald-200"}>
              {lead.whatsappStatus === "confirmado" ? "WhatsApp" : lead.whatsappStatus === "provavel" ? "WhatsApp provável" : "WhatsApp não identificado"}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Avaliação</dt>
          <StarIcon className="shrink-0 text-amber-300" />
          <dd>
            {lead.rating === null ? (
              <span className="text-faint">Sem nota</span>
            ) : (
              <>
                <span className="font-semibold">{formatRating(lead.rating)}</span>{" "}
                <span className="text-muted">({(lead.reviewsCount ?? 0).toLocaleString("pt-BR")} avaliações)</span>
              </>
            )}
          </dd>
        </div>
        {(lead.website || lead.instagram) && (
          <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2">
            {lead.website && lead.siteStatus === "possui_site" && (
              <a className="flex min-w-0 items-center gap-2 text-indigo-200 hover:underline" href={lead.website} target="_blank" rel="noopener noreferrer">
                <GlobeIcon className="shrink-0" />
                <span className="truncate">{shortUrl(lead.website)}</span>
              </a>
            )}
            {lead.instagram && (
              <a className="flex min-w-0 items-center gap-2 text-pink-200 hover:underline" href={lead.instagram} target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="shrink-0" />
                <span className="truncate">Instagram</span>
              </a>
            )}
            {lead.website && lead.siteStatus === "sem_site" && !lead.instagram && (
              <a className="flex min-w-0 items-center gap-2 text-indigo-200 hover:underline" href={lead.website} target="_blank" rel="noopener noreferrer">
                <GlobeIcon className="shrink-0" />
                <span className="truncate">{lead.siteNote ?? shortUrl(lead.website)}</span>
              </a>
            )}
          </div>
        )}
      </dl>

      <div className="mt-auto grid grid-cols-[1fr_auto] items-center gap-3 border-t border-line pt-3">
        <StatusSelect lead={lead} onStatus={handlers.onStatus} />
        <span className="flex items-center gap-1 text-xs text-faint" title="Data da coleta">
          <ClockIcon size={13} /> {formatDateTime(lead.collectedAt)}
        </span>
      </div>
      <LeadActions lead={lead} handlers={handlers} />
    </article>
  );
}
