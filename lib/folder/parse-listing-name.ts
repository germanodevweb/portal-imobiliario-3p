const NAME_SPLIT = /[:–—|]/u;

/** Primeira parte do title antes de ":" ou travessão — nome do empreendimento. */
export function parseListingDevelopmentName(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(NAME_SPLIT);
  const first = parts[0]?.trim() ?? trimmed;
  return first.length > 0 ? first : trimmed;
}
