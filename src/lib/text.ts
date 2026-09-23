/** Remove acentos e normaliza para comparação. */
export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function formatLocation(city: string, state: string, country?: string): string {
  return [city.trim(), state.trim(), country?.trim()].filter(Boolean).join(", ");
}
