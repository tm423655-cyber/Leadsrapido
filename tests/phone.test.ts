import { describe, expect, it } from "vitest";
import { formatBrazilianPhone, isBrazilianMobile, telLink, toInternationalDigits, whatsappLink } from "@/lib/phone";

describe("telefone", () => {
  it("normaliza números brasileiros em vários formatos", () => {
    expect(toInternationalDigits("(16) 99123-4567")).toBe("5516991234567");
    expect(toInternationalDigits("+55 16 3722-1234")).toBe("551637221234");
    expect(toInternationalDigits("016 3722-1234")).toBe("551637221234");
    expect(toInternationalDigits("5516991234567")).toBe("5516991234567");
    expect(toInternationalDigits("(55) 99123-4567")).toBe("5555991234567"); // DDD 55 (RS)
    expect(toInternationalDigits("123")).toBeNull();
    expect(toInternationalDigits("")).toBeNull();
    expect(toInternationalDigits(null)).toBeNull();
  });

  it("identifica celulares (WhatsApp provável)", () => {
    expect(isBrazilianMobile("5516991234567")).toBe(true);
    expect(isBrazilianMobile("551637221234")).toBe(false);
    expect(isBrazilianMobile(null)).toBe(false);
  });

  it("gera links no formato correto", () => {
    expect(whatsappLink("5516991234567")).toBe("https://wa.me/5516991234567");
    expect(telLink("5516991234567")).toBe("tel:+5516991234567");
    expect(whatsappLink(null)).toBeNull();
    expect(formatBrazilianPhone("5516991234567")).toBe("(16) 99123-4567");
    expect(formatBrazilianPhone("551637221234")).toBe("(16) 3722-1234");
  });
});
