/** Normaliza preço digitado (BR: 200.000 ou 200000) para filtro numérico na URL. */
export function normalizePriceQueryParam(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  let s = trimmed.replace(/[^\d.,]/g, "");

  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }

  if (!/^\d+(\.\d+)?$/.test(s)) return "";

  const integerPart = s.split(".")[0] ?? s;
  return integerPart.length > 0 ? integerPart : "";
}
