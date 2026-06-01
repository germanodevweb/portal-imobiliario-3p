/**
 * URLs legadas Code49: www.3pinheirosconsultoria.com.br/admin/imovel/*.jpg
 * No portal novo, /admin/* exige login — o browser recebe HTML em vez de JPEG.
 */

import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

const LEGACY_HOSTS = new Set([
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
]);

const LEGACY_PATH_PREFIX = "/admin/imovel/";

export function isLegacyCode49PropertyImageUrl(raw: string): boolean {
  const normalized = normalizePublicImageUrl(raw.trim());
  if (!normalized) return false;
  try {
    const u = new URL(normalized);
    return (
      LEGACY_HOSTS.has(u.hostname.toLowerCase()) &&
      u.pathname.toLowerCase().startsWith(LEGACY_PATH_PREFIX)
    );
  } catch {
    return false;
  }
}

/** Origem alternativa onde os arquivos .jpg ainda existem (servidor antigo / backup). */
export function getLegacyPropertyImageOrigin(): string | null {
  const raw = process.env.LEGACY_PROPERTY_IMAGE_ORIGIN?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/**
 * URL usada pelo proxy/migração para baixar o binário real da foto.
 * Se LEGACY_PROPERTY_IMAGE_ORIGIN estiver definida, troca só o origin mantendo o path.
 */
export function resolveLegacyPropertyImageFetchUrl(raw: string): string {
  const normalized = normalizePublicImageUrl(raw.trim());
  if (!isLegacyCode49PropertyImageUrl(normalized)) return normalized;

  const legacyOrigin = getLegacyPropertyImageOrigin();
  if (!legacyOrigin) return normalized;

  try {
    const u = new URL(normalized);
    return `${legacyOrigin}${u.pathname}${u.search}`;
  } catch {
    return normalized;
  }
}

export function legacyPropertyImagePathPattern(): string {
  return LEGACY_PATH_PREFIX;
}
