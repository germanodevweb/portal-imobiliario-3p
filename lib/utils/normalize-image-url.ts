/**
 * Normaliza URLs de imagem vindas de migração (XML Code49, planilhas, etc.).
 * Evita //host, www. sem esquema e strings que não batem na comparação com featuredImage.
 */
export function normalizePublicImageUrl(input: string): string {
  let u = input.trim();
  if (!u) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (/^www\./i.test(u)) return `https://${u}`;
  return u;
}
