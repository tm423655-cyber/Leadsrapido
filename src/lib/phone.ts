/**
 * Utilidades de telefone focadas em números brasileiros.
 * Só trabalham com o número recebido da fonte — nada é inventado.
 */

export function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * Converte o telefone para o formato internacional só com dígitos (ex.: 5516999990000).
 * Retorna null se não houver dígitos suficientes para um número válido.
 */
export function toInternationalDigits(raw: string | null | undefined, defaultCountry = "55"): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  let digits = digitsOnly(trimmed);
  if (!digits) return null;

  if (trimmed.startsWith("+")) {
    return digits.length >= 10 && digits.length <= 15 ? digits : null;
  }
  // Remove prefixo internacional "00" e o zero de tronco nacional ("0 16 ...").
  digits = digits.replace(/^0+/, "");
  if (defaultCountry === "55") {
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits;
    if (digits.length === 10 || digits.length === 11) return `55${digits}`;
    return null;
  }
  return digits.length >= 8 && digits.length <= 15 ? `${defaultCountry}${digits}` : null;
}

/** Celular brasileiro: 55 + DDD (2) + 9 + 8 dígitos. Números móveis quase sempre usam WhatsApp. */
export function isBrazilianMobile(intlDigits: string | null): boolean {
  if (!intlDigits) return false;
  return /^55[1-9]{2}9\d{8}$/.test(intlDigits);
}

export function whatsappLink(intlDigits: string | null): string | null {
  if (!intlDigits) return null;
  return `https://wa.me/${intlDigits}`;
}

export function telLink(intlDigits: string | null): string | null {
  if (!intlDigits) return null;
  return `tel:+${intlDigits}`;
}

/** Formata para exibição: +55 (16) 99999-0000. */
export function formatBrazilianPhone(intlDigits: string | null): string | null {
  if (!intlDigits) return null;
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(intlDigits);
  if (!m) return `+${intlDigits}`;
  return `(${m[1]}) ${m[2]}-${m[3]}`;
}
