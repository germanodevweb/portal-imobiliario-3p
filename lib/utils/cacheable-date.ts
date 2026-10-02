/** Date após `unstable_cache` (JSON serializa como string ISO). */
export type CacheableDate = Date | string;

export function toValidDate(
  value: CacheableDate | null | undefined
): Date | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toIsoStringFromCacheableDate(
  value: CacheableDate | null | undefined
): string | null {
  const d = toValidDate(value);
  return d ? d.toISOString() : null;
}
