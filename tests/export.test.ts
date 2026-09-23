import { describe, expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { leadsToCsv, leadsToText, leadsToXlsx } from "@/lib/export";
import { mergeLeads, updateLead } from "@/lib/storage";
import { applyFilters, DEFAULT_FILTERS } from "@/lib/filters";
import { normalizePlaces } from "@/lib/normalize";

const ctx = { city: "Franca", state: "SP", niches: ["Pizzarias"], source: "apify" as const };
const raw = [
  { title: "Pizzaria \"Aspas\"; Ltda", placeId: "1", website: null, phone: "(16) 99123-4567", totalScore: 4.5, reviewsCount: 30, street: "Rua A, 1", city: "Franca", state: "SP" },
  { title: "=HYPERLINK(\"x\")", placeId: "2", website: "https://site.com.br", phone: "(16) 3722-0000", totalScore: 3.5, reviewsCount: 5, city: "Franca" },
  { title: "Doce <Lar> & Cia", placeId: "3", website: null, totalScore: 4.9, reviewsCount: 100, city: "Franca" },
];

describe("exportação e armazenamento", () => {
  const stored = mergeLeads([], normalizePlaces(raw, ctx), "s1");

  it("gera CSV com BOM, separador ; e proteção contra fórmulas", () => {
    const csv = leadsToCsv(stored);
    expect(csv.startsWith("﻿Pontuação;Empresa")).toBe(true);
    expect(csv).toContain('"Pizzaria ""Aspas""; Ltda"');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("4,5");
    expect(csv.trim().split("\r\n")).toHaveLength(4);
  });

  it("gera um .xlsx válido (zip com planilha e textos escapados)", () => {
    const files = unzipSync(leadsToXlsx(stored));
    expect(Object.keys(files)).toEqual(expect.arrayContaining(["[Content_Types].xml", "xl/workbook.xml", "xl/worksheets/sheet1.xml", "xl/styles.xml"]));
    const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
    expect(sheet).toContain("Doce &lt;Lar&gt; &amp; Cia");
    expect(sheet).toContain('<row r="4">');
  });

  it("copia leads em texto legível", () => {
    expect(leadsToText(stored.slice(0, 1))).toContain("WhatsApp: https://wa.me/5516991234567");
  });

  it("preserva status ao mesclar novas buscas e filtra corretamente", () => {
    const contacted = updateLead(stored, "p_1", { status: "contatado" });
    const discarded = updateLead(contacted, "p_3", { discarded: true });
    const merged = mergeLeads(discarded, normalizePlaces(raw, ctx), "s2");
    expect(merged.find((l) => l.id === "p_1")!.status).toBe("contatado");
    expect(merged.find((l) => l.id === "p_3")!.discarded).toBe(true);

    const noSite = applyFilters(merged, { ...DEFAULT_FILTERS, onlyNoSite: true }, "s2");
    expect(noSite.map((l) => l.id)).toEqual(["p_1"]);
    const shownDiscarded = applyFilters(merged, { ...DEFAULT_FILTERS, showDiscarded: true }, "s2");
    expect(shownDiscarded.map((l) => l.id)).toEqual(["p_3"]);
    expect(applyFilters(merged, { ...DEFAULT_FILTERS, withWhatsApp: true }, null).map((l) => l.id)).toEqual(["p_1"]);
    expect(applyFilters(merged, { ...DEFAULT_FILTERS, minScore: 50 }, null).every((l) => l.score >= 50)).toBe(true);
  });
});
