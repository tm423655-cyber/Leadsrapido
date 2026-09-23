import { describe, expect, it } from "vitest";
import { searchKey, validateSearch } from "@/lib/validation";

describe("validação da busca", () => {
  it("aceita 'Franca, SP' no campo de cidade", () => {
    const r = validateSearch({ city: "Franca, SP", niches: ["Pizzarias"] });
    expect(r.ok && r.value).toMatchObject({ city: "Franca", state: "SP", country: "Brasil", limit: 20 });
  });

  it("rejeita campos vazios e valores inválidos", () => {
    const r = validateSearch({ city: "", state: "XX", niches: [], limit: 0 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.city).toBeTruthy();
      expect(r.errors.state).toBeTruthy();
      expect(r.errors.niches).toBeTruthy();
      expect(r.errors.limit).toBeTruthy();
    }
  });

  it("respeita o limite máximo configurado", () => {
    const r = validateSearch({ city: "Franca", state: "SP", niches: ["Bares"], limit: 500 }, 100);
    expect(r.ok).toBe(false);
  });

  it("bloqueia caracteres suspeitos e remove nichos duplicados", () => {
    expect(validateSearch({ city: "<script>", state: "SP", niches: ["x"] }).ok).toBe(false);
    const r = validateSearch({ city: "Ribeirão Preto", state: "sp", niches: ["Pizzarias", "pizzarias", " Docerias "] });
    expect(r.ok && r.value.niches).toEqual(["pizzarias", "Docerias"]);
  });

  it("gera a mesma chave para buscas equivalentes", () => {
    const a = validateSearch({ city: "Franca", state: "SP", niches: ["A", "B"] });
    const b = validateSearch({ city: "franca", state: "sp", niches: ["b", "a"] });
    expect(a.ok && b.ok && searchKey(a.value) === searchKey(b.value)).toBe(true);
  });
});
