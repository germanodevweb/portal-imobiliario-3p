/**
 * Converte duração ISO 8601 (ex.: PT41S, PT1M30S) em segundos (video sitemap).
 */
export function iso8601DurationToSeconds(iso: string | null | undefined): number | null {
  const trimmed = iso?.trim();
  if (!trimmed || !trimmed.startsWith("PT")) return null;

  const match = trimmed.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
}
