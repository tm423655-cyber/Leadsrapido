"use client";

import { useMemo } from "react";
import { STATUS_LABEL, formatRating } from "@/lib/labels";
import { LEAD_STATUSES, type StoredLead } from "@/lib/types";
import { BuildingIcon, GlobeIcon, SparklesIcon, StarIcon } from "./Icons";

interface Props {
  leads: StoredLead[];
  onPickNiche: (niche: string) => void;
  onPickStatus: (status: StoredLead["status"]) => void;
}

function StatTile({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: React.ReactNode }) {
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-white/5 text-indigo-200">{icon}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-faint">{hint}</div>}
    </div>
  );
}

function BarList({
  title,
  rows,
  onPick,
  emptyText,
}: {
  title: string;
  rows: { key: string; label: string; value: number }[];
  onPick: (key: string) => void;
  emptyText: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <section className="card p-4 sm:p-5" aria-label={title}>
      <h3 className="mb-3 text-sm font-semibold text-muted">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-faint">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row) => {
            const pct = total ? Math.round((row.value / total) * 100) : 0;
            return (
              <li key={row.key}>
                <button
                  type="button"
                  onClick={() => onPick(row.key)}
                  className="group grid w-full grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 rounded-lg px-1.5 py-1.5 text-left hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-brand-3"
                  title={`${row.label}: ${row.value} lead${row.value === 1 ? "" : "s"} (${pct}%) — clique para filtrar`}
                >
                  <span className="truncate text-sm text-ink">{row.label}</span>
                  <span className="h-2 rounded-full bg-white/5">
                    <span
                      className="block h-2 rounded-full bg-brand-gradient transition-[width] duration-500"
                      style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-sm tabular-nums text-muted">{row.value}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard({ leads, onPickNiche, onPickStatus }: Props) {
  const stats = useMemo(() => {
    const active = leads.filter((l) => !l.discarded);
    const noSite = active.filter((l) => l.siteStatus === "sem_site").length;
    const rated = active.filter((l) => l.rating !== null);
    const avgRating = rated.length ? rated.reduce((s, l) => s + (l.rating ?? 0), 0) / rated.length : null;
    const avgScore = active.length ? Math.round(active.reduce((s, l) => s + l.score, 0) / active.length) : null;
    const withWhats = active.filter((l) => l.whatsappStatus !== "nao").length;

    const nicheMap = new Map<string, number>();
    for (const l of active) nicheMap.set(l.niche, (nicheMap.get(l.niche) ?? 0) + 1);
    const byNiche = [...nicheMap.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
      .map(([niche, value]) => ({ key: niche, label: niche, value }));

    const byStatus = LEAD_STATUSES.map((s) => ({
      key: s.value,
      label: STATUS_LABEL[s.value],
      value: active.filter((l) => l.status === s.value).length,
    })).filter((r) => r.value > 0);

    return { total: active.length, discarded: leads.length - active.length, noSite, avgRating, avgScore, withWhats, byNiche, byStatus, ratedCount: rated.length };
  }, [leads]);

  const pctNoSite = stats.total ? Math.round((stats.noSite / stats.total) * 100) : 0;

  return (
    <section aria-label="Resumo dos leads" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Total de leads"
          value={stats.total.toLocaleString("pt-BR")}
          hint={stats.discarded ? `${stats.discarded} descartado${stats.discarded === 1 ? "" : "s"}` : "salvos neste dispositivo"}
          icon={<BuildingIcon />}
        />
        <StatTile label="Sem site" value={stats.noSite.toLocaleString("pt-BR")} hint={`${pctNoSite}% da base · melhores oportunidades`} icon={<GlobeIcon />} />
        <StatTile
          label="Média das notas"
          value={stats.avgRating === null ? "—" : formatRating(stats.avgRating)}
          hint={stats.ratedCount ? `${stats.ratedCount} empresas avaliadas` : "sem avaliações ainda"}
          icon={<StarIcon />}
        />
        <StatTile
          label="Pontuação média"
          value={stats.avgScore === null ? "—" : String(stats.avgScore)}
          hint={`${stats.withWhats} com WhatsApp (confirmado/provável)`}
          icon={<SparklesIcon />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Leads por nicho" rows={stats.byNiche.slice(0, 8)} onPick={onPickNiche} emptyText="Faça uma busca para ver a distribuição por nicho." />
        <BarList
          title="Leads por status"
          rows={stats.byStatus}
          onPick={(key) => onPickStatus(key as StoredLead["status"])}
          emptyText="Os status aparecem aqui conforme você organiza seus leads."
        />
      </div>
    </section>
  );
}
