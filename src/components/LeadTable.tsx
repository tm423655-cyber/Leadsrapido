"use client";

import { formatDateTime, formatRating } from "@/lib/labels";
import type { StoredLead } from "@/lib/types";
import { InstagramIcon, GlobeIcon } from "./Icons";
import { LeadActions, SiteBadge, StatusSelect, type LeadActionsHandlers } from "./LeadParts";

export default function LeadTable({ leads, handlers }: { leads: StoredLead[]; handlers: LeadActionsHandlers }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <caption className="sr-only">Leads encontrados, ordenados pela pontuação</caption>
        <thead className="border-b border-line text-xs uppercase tracking-wide text-faint">
          <tr>
            <th scope="col" className="px-4 py-3">Pontos</th>
            <th scope="col" className="px-4 py-3">Empresa</th>
            <th scope="col" className="px-4 py-3">Site</th>
            <th scope="col" className="px-4 py-3">Contato</th>
            <th scope="col" className="px-4 py-3">Nota</th>
            <th scope="col" className="px-4 py-3">Endereço</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className={`border-b border-line/60 align-top hover:bg-white/[0.02] ${lead.discarded ? "opacity-60" : ""}`}>
              <td className="px-4 py-3">
                <span
                  className="inline-grid size-10 place-items-center rounded-full bg-brand-gradient font-display text-sm font-semibold tabular-nums"
                  title={lead.scoreBreakdown.map((b) => `+${b.points} ${b.label}`).join("\n")}
                >
                  {lead.score}
                </span>
              </td>
              <td className="max-w-56 px-4 py-3">
                <div className="font-semibold break-words">{lead.name}</div>
                <div className="text-xs text-muted">{lead.category ?? lead.niche}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {lead.source === "demo" && <span className="badge border-amber-400/30 bg-amber-400/10 text-amber-200">Fictício</span>}
                  {lead.inCity === false && <span className="badge border-orange-400/30 bg-orange-400/10 text-orange-200">Outra cidade</span>}
                </div>
                <div className="mt-1 text-[11px] text-faint">Coleta: {formatDateTime(lead.collectedAt)}</div>
              </td>
              <td className="px-4 py-3">
                <SiteBadge lead={lead} />
                <div className="mt-1.5 flex flex-col gap-1 text-xs">
                  {lead.website && (
                    <a className="flex items-center gap-1 text-indigo-200 hover:underline" href={lead.website} target="_blank" rel="noopener noreferrer">
                      <GlobeIcon size={12} /> Abrir link
                    </a>
                  )}
                  {lead.instagram && (
                    <a className="flex items-center gap-1 text-pink-200 hover:underline" href={lead.instagram} target="_blank" rel="noopener noreferrer">
                      <InstagramIcon size={12} /> Instagram
                    </a>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div>{lead.phone ?? <span className="text-faint">—</span>}</div>
                <div className={`text-xs ${lead.whatsappStatus === "nao" ? "text-faint" : "text-emerald-300"}`}>
                  {lead.whatsappStatus === "confirmado" ? "WhatsApp" : lead.whatsappStatus === "provavel" ? "WhatsApp provável" : "Sem WhatsApp identificado"}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {lead.rating === null ? <span className="text-faint">—</span> : <>★ {formatRating(lead.rating)}</>}
                <div className="text-xs text-muted">{lead.reviewsCount ?? 0} aval.</div>
              </td>
              <td className="max-w-64 px-4 py-3 text-muted">{lead.address ?? "—"}</td>
              <td className="w-40 px-4 py-3">
                <StatusSelect lead={lead} onStatus={handlers.onStatus} compact />
              </td>
              <td className="w-60 px-4 py-3">
                <LeadActions lead={lead} handlers={handlers} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
