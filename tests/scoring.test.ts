import { describe, expect, it } from "vitest";
import { compareLeads, scoreLead } from "@/lib/scoring";
import { normalizePlaces } from "@/lib/normalize";

const ctx = { city: "Franca", state: "SP", niches: ["Pizzarias"], source: "apify" as const };

describe("pontuação", () => {
  it("soma 100 pontos para o lead ideal", () => {
    const { score, breakdown } = scoreLead({
      siteStatus: "sem_site",
      phoneDigits: "5516991234567",
      whatsappStatus: "provavel",
      reviewsCount: 21,
      rating: 4,
      street: "Rua A, 10",
      city: "Franca",
      state: "SP",
      postalCode: null,
      address: "Rua A, 10, Franca - SP",
    });
    expect(score).toBe(100);
    expect(breakdown.map((b) => b.points)).toEqual([40, 20, 15, 10, 10, 5]);
  });

  it("respeita os limites (20 avaliações não pontua, nota 3.9 não pontua)", () => {
    const { score } = scoreLead({
      siteStatus: "possui_site",
      phoneDigits: "551637221234",
      whatsappStatus: "nao",
      reviewsCount: 20,
      rating: 3.9,
      street: null,
      city: "Franca",
      state: "SP",
      postalCode: null,
      address: null,
    });
    expect(score).toBe(20);
  });

  it("'Não identificado' não recebe os 40 pontos de sem site", () => {
    const { score } = scoreLead({
      siteStatus: "nao_identificado",
      phoneDigits: null,
      whatsappStatus: "nao",
      reviewsCount: null,
      rating: null,
      street: null,
      city: null,
      state: null,
      postalCode: null,
      address: null,
    });
    expect(score).toBe(0);
  });

  it("ordena pela maior pontuação com leads sem site no topo", () => {
    const leads = normalizePlaces(
      [
        { title: "Com site", placeId: "a", website: "https://pizzaria.com.br", phone: "(16) 3722-1234", totalScore: 4.8, reviewsCount: 300 },
        { title: "Sem site", placeId: "b", website: null, phone: "(16) 99123-4567", totalScore: 4.5, reviewsCount: 50 },
        { title: "Só Instagram", placeId: "c", website: "https://instagram.com/pizzaria", totalScore: 4.1, reviewsCount: 5 },
      ],
      ctx,
    );
    expect(leads.map((l) => l.name)).toEqual(["Sem site", "Só Instagram", "Com site"]);
    for (let i = 1; i < leads.length; i++) expect(compareLeads(leads[i - 1], leads[i])).toBeLessThanOrEqual(0);
  });
});
