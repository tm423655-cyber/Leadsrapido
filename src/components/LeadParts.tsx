"use client";

import { useId } from "react";
import { SITE_STATUS_LABEL, WHATSAPP_LABEL } from "@/lib/labels";
import { telLink } from "@/lib/phone";
import { LEAD_STATUSES, type LeadStatus, type StoredLead } from "@/lib/types";
import { CopyIcon, HeartIcon, MapPinIcon, PhoneIcon, RestoreIcon, TrashIcon, UserCheckIcon, WhatsAppIcon } from "./Icons";

export interface LeadActionsHandlers {
  onStatus: (id: string, status: LeadStatus) => void;
  onDiscard: (id: string, discarded: boolean) => void;
  onCopy: (lead: StoredLead) => void;
}

export function SiteBadge({ lead }: { lead: StoredLead }) {
  const cls =
    lead.siteStatus === "sem_site"
      ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
      : lead.siteStatus === "possui_site"
        ? "bg-slate-400/10 text-slate-300 border-slate-400/20"
        : "bg-amber-400/10 text-amber-200 border-amber-400/25";
  return (
    <span className={`badge ${cls}`} title={lead.siteNote ?? undefined}>
      {lead.siteStatus === "sem_site" && <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden />}
      {SITE_STATUS_LABEL[lead.siteStatus]}
      {lead.siteNote && <span className="font-normal opacity-80">· {lead.siteNote.replace("Apenas ", "só ")}</span>}
    </span>
  );
}

const STATUS_STYLE: Record<LeadStatus, string> = {
  novo: "text-sky-200",
  contatar: "text-amber-200",
  contatado: "text-indigo-200",
  interessado: "text-emerald-200",
  sem_interesse: "text-slate-300",
  cliente: "text-fuchsia-200",
};

export function StatusSelect({ lead, onStatus, compact = false }: { lead: StoredLead; onStatus: LeadActionsHandlers["onStatus"]; compact?: boolean }) {
  return (
    <select
      className={`field ${compact ? "py-1.5 text-xs" : "py-2 text-sm"} ${STATUS_STYLE[lead.status]}`}
      value={lead.status}
      onChange={(e) => onStatus(lead.id, e.target.value as LeadStatus)}
      aria-label={`Status do lead ${lead.name}`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export function ScoreRing({ score, breakdown, size = 52 }: { score: number; breakdown: StoredLead["scoreBreakdown"]; size?: number }) {
  const gradientId = useId();
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const title = `Pontuação ${score}/100\n${breakdown.map((b) => `+${b.points} ${b.label}`).join("\n") || "Nenhum critério atendido"}`;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={title} role="img" aria-label={`Pontuação ${score} de 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f7cff" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.08)" strokeWidth={5} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-sm font-semibold tabular-nums">{score}</span>
    </div>
  );
}

function ActionLink({ href, children, label, className = "btn-ghost" }: { href: string | null; children: React.ReactNode; label: string; className?: string }) {
  if (!href) {
    return (
      <span className={`btn ${className}`} aria-disabled="true" title={`${label} indisponível`}>
        {children}
      </span>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      className={`btn ${className}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  );
}

export function LeadActions({ lead, handlers, compact = false }: { lead: StoredLead; handlers: LeadActionsHandlers; compact?: boolean }) {
  const hideText = compact ? "sr-only" : "";
  return (
    <div className="flex flex-col gap-2">
      <div className={`grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4"}`}>
        <ActionLink href={lead.mapsUrl} label={`Abrir ${lead.name} no Google Maps`}>
          <MapPinIcon /> <span className={hideText}>Maps</span>
        </ActionLink>
        <ActionLink href={telLink(lead.phoneDigits)} label={lead.phone ? `Ligar para ${lead.phone}` : "Ligar"}>
          <PhoneIcon /> <span className={hideText}>Ligar</span>
        </ActionLink>
        <ActionLink href={lead.whatsappLink} label={`Abrir WhatsApp (${WHATSAPP_LABEL[lead.whatsappStatus]})`} className="btn-whatsapp">
          <WhatsAppIcon /> <span className={hideText}>WhatsApp</span>
        </ActionLink>
        <button type="button" className="btn btn-ghost" onClick={() => handlers.onCopy(lead)} aria-label={`Copiar dados de ${lead.name}`} title="Copiar dados">
          <CopyIcon /> <span className={hideText}>Copiar</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className={`btn ${lead.status === "contatado" ? "border border-indigo-400/50 bg-indigo-400/15 text-indigo-100" : "btn-ghost"}`}
          onClick={() => handlers.onStatus(lead.id, "contatado")}
          aria-pressed={lead.status === "contatado"}
          title="Marcar como contatado"
        >
          <UserCheckIcon /> <span className={compact ? "sr-only" : "hidden sm:inline"}>Contatado</span>
        </button>
        <button
          type="button"
          className={`btn ${lead.status === "interessado" ? "border border-emerald-400/50 bg-emerald-400/15 text-emerald-100" : "btn-ghost"}`}
          onClick={() => handlers.onStatus(lead.id, "interessado")}
          aria-pressed={lead.status === "interessado"}
          title="Marcar como interessado"
        >
          <HeartIcon /> <span className={compact ? "sr-only" : "hidden sm:inline"}>Interessado</span>
        </button>
        <button
          type="button"
          className="btn btn-ghost text-red-200 hover:border-red-400/40"
          onClick={() => handlers.onDiscard(lead.id, !lead.discarded)}
          title={lead.discarded ? "Restaurar lead" : "Descartar lead"}
        >
          {lead.discarded ? <RestoreIcon /> : <TrashIcon />}
          <span className={compact ? "sr-only" : "hidden sm:inline"}>{lead.discarded ? "Restaurar" : "Descartar"}</span>
        </button>
      </div>
    </div>
  );
}
