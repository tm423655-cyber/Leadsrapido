import { describe, expect, it } from "vitest";
import { normalizePlace, normalizePlaces, socialNetworkOf } from "@/lib/normalize";

const ctx = { city: "Franca", state: "SP", niches: ["Pizzarias", "Docerias"], source: "apify" as const, now: new Date("2026-09-23T12:00:00Z") };

const googleMapsItem = {
  title: "Pizzaria Teste",
  categoryName: "Pizzaria",
  searchString: "Pizzarias",
  address: "R. Voluntários da Franca, 1234 - Centro, Franca - SP, 14400-490",
  street: "R. Voluntários da Franca, 1234",
  neighborhood: "Centro",
  city: "Franca",
  state: "São Paulo",
  postalCode: "14400-490",
  phone: "(16) 99123-4567",
  phoneUnformatted: "+5516991234567",
  website: null,
  totalScore: 4.6,
  reviewsCount: 87,
  url: "https://www.google.com/maps/search/?api=1&query=Pizzaria&query_place_id=ChIJ123",
  placeId: "ChIJ123",
  scrapedAt: "2026-09-20T10:00:00.000Z",
  permanentlyClosed: false,
  temporarilyClosed: false,
};

describe("normalização de itens do Apify", () => {
  it("converte um item do Google Maps Scraper sem inventar dados", () => {
    const lead = normalizePlace(googleMapsItem, ctx)!;
    expect(lead).toMatchObject({
      id: "p_ChIJ123",
      name: "Pizzaria Teste",
      category: "Pizzaria",
      niche: "Pizzarias",
      phone: "(16) 99123-4567",
      phoneDigits: "5516991234567",
      whatsappStatus: "provavel",
      whatsappLink: "https://wa.me/5516991234567",
      siteStatus: "sem_site",
      website: null,
      instagram: null,
      rating: 4.6,
      reviewsCount: 87,
      inCity: true,
      mapsUrl: googleMapsItem.url,
      collectedAt: "2026-09-20T10:00:00.000Z",
      score: 100,
    });
  });

  it("classifica rede social como 'sem site' e extrai o Instagram", () => {
    const lead = normalizePlace({ ...googleMapsItem, website: "https://www.instagram.com/pizzariateste/" }, ctx)!;
    expect(lead.siteStatus).toBe("sem_site");
    expect(lead.siteNote).toBe("Apenas Instagram");
    expect(lead.instagram).toBe("https://www.instagram.com/pizzariateste/");
  });

  it("marca 'possui site' e 'não identificado' corretamente", () => {
    expect(normalizePlace({ ...googleMapsItem, website: "pizzariateste.com.br" }, ctx)!.siteStatus).toBe("possui_site");
    expect(normalizePlace({ name: "Loja X", phone: "16 3722-0000" }, ctx)!.siteStatus).toBe("nao_identificado");
  });

  it("usa WhatsApp confirmado quando a fonte fornece", () => {
    const lead = normalizePlace({ ...googleMapsItem, phone: "(16) 3722-1234", phoneUnformatted: null, whatsapps: ["https://wa.me/5516991112222"] }, ctx)!;
    expect(lead.whatsappStatus).toBe("confirmado");
    expect(lead.whatsappLink).toBe("https://wa.me/5516991112222");
  });

  it("telefone fixo gera link, mas não conta como WhatsApp", () => {
    const lead = normalizePlace({ ...googleMapsItem, phone: "(16) 3722-1234", phoneUnformatted: "+551637221234" }, ctx)!;
    expect(lead.whatsappStatus).toBe("nao");
    expect(lead.whatsappLink).toBe("https://wa.me/551637221234");
  });

  it("descarta fechados definitivamente, duplicados e itens sem nome; sinaliza outra cidade", () => {
    const leads = normalizePlaces(
      [
        googleMapsItem,
        { ...googleMapsItem },
        { ...googleMapsItem, placeId: "x", permanentlyClosed: true },
        { placeId: "sem-nome" },
        { ...googleMapsItem, placeId: "y", title: "Doceria", searchString: "Docerias", city: "Ribeirão Preto" },
      ],
      ctx,
    );
    expect(leads).toHaveLength(2);
    const doceria = leads.find((l) => l.name === "Doceria")!;
    expect(doceria.inCity).toBe(false);
    expect(doceria.niche).toBe("Docerias");
  });

  it("ignora URLs perigosas", () => {
    const lead = normalizePlace({ ...googleMapsItem, website: "javascript:alert(1)" }, ctx)!;
    expect(lead.website).toBeNull();
  });

  it("reconhece redes sociais", () => {
    expect(socialNetworkOf("https://m.facebook.com/abc")).toBe("Facebook");
    expect(socialNetworkOf("linktr.ee/abc")).toBe("Linktree");
    expect(socialNetworkOf("https://minhaempresa.com.br")).toBeNull();
  });
});
