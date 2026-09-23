"use client";

import { useState } from "react";
import { DEFAULT_FILTERS, countActiveFilters, type LeadFilters } from "@/lib/filters";
import { LEAD_STATUSES } from "@/lib/types";
import { FilterIcon, SearchIcon, XIcon } from "./Icons";

interface Props {
  filters: LeadFilters;
  onChange: (next: LeadFilters) => void;
  niches: string[];
  cities: string[];
  hasLastSearch: boolean;
}

export default function FiltersPanel({ filters, onChange, niches, cities, hasLastSearch }: Props) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters);
  const set = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => onChange({ ...filters, [key]: value });

  const toggles: { key: keyof LeadFilters; label: string; hidden?: boolean }[] = [
    { key: "onlyNoSite", label: "Apenas sem site" },
    { key: "withPhone", label: "Com telefone" },
    { key: "withWhatsApp", label: "Com WhatsApp" },
    { key: "onlyLastSearch", label: "Somente última busca", hidden: !hasLastSearch },
    { key: "showDiscarded", label: "Ver descartados" },
  ];

  return (
    <section className="card p-4 sm:p-5" aria-label="Filtros">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            className="field pl-9"
            placeholder="Buscar por nome, categoria ou endereço…"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            aria-label="Buscar nos leads"
          />
        </div>
        <button type="button" className="btn btn-ghost md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="filters-body">
          <FilterIcon /> Filtros {active > 0 && <span className="badge bg-brand-gradient text-white">{active}</span>}
        </button>
        {active > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
            <XIcon /> Limpar
          </button>
        )}
      </div>

      <div id="filters-body" className={`${open ? "block" : "hidden"} mt-4 space-y-4 md:block`}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros rápidos">
          {toggles
            .filter((t) => !t.hidden)
            .map((t) => (
              <button
                key={t.key}
                type="button"
                className="chip"
                aria-pressed={Boolean(filters[t.key])}
                onClick={() => set(t.key, !filters[t.key] as never)}
              >
                {t.label}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="text-xs text-muted">
            Nicho
            <select className="field mt-1" aria-label="Filtrar por nicho" value={filters.niche} onChange={(e) => set("niche", e.target.value)}>
              <option value="">Todos</option>
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Cidade
            <select className="field mt-1" aria-label="Filtrar por cidade" value={filters.city} onChange={(e) => set("city", e.target.value)}>
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Status
            <select className="field mt-1" aria-label="Filtrar por status" value={filters.status} onChange={(e) => set("status", e.target.value as LeadFilters["status"])}>
              <option value="">Todos</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Nota mínima
            <select className="field mt-1" aria-label="Nota mínima" value={filters.minRating} onChange={(e) => set("minRating", Number(e.target.value))}>
              <option value={0}>Qualquer</option>
              {[3, 3.5, 4, 4.5].map((n) => (
                <option key={n} value={n}>
                  {n.toLocaleString("pt-BR")}+ ★
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Avaliações mínimas
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className="field mt-1"
              aria-label="Quantidade mínima de avaliações"
              value={filters.minReviews || ""}
              placeholder="0"
              onChange={(e) => set("minReviews", Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
          <label className="text-xs text-muted">
            <span className="flex justify-between">
              Pontuação mínima <span className="tabular-nums text-ink">{filters.minScore}</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              className="mt-3 w-full accent-indigo-400"
              aria-label="Pontuação mínima"
              value={filters.minScore}
              onChange={(e) => set("minScore", Number(e.target.value))}
              aria-valuetext={`${filters.minScore} pontos`}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
