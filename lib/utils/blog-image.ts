import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

/**
 * Hostnames permitidos para o otimizador do `next/image`.
 * Manter alinhado a `next.config.js` → `images.remotePatterns`.
 */
const ALLOWED_REMOTE_IMAGE_HOSTNAMES = new Set([
  "images.unsplash.com",
  "picsum.photos",
  "res.cloudinary.com",
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
]);

/**
 * Capa do blog: normaliza URL e define `unoptimized` quando o host não está
 * em `remotePatterns`, evitando exceção em runtime (lista `/blog`, sidebar, etc.).
 */
export function getBlogCoverImageProps(rawSrc: string): {
  src: string;
  unoptimized: boolean;
} {
  const src = normalizePublicImageUrl(rawSrc);
  if (!src) return { src: "", unoptimized: true };
  if (src.startsWith("/")) return { src, unoptimized: false };
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return { src, unoptimized: true };
  }
  try {
    const host = new URL(src).hostname.toLowerCase();
    if (ALLOWED_REMOTE_IMAGE_HOSTNAMES.has(host)) {
      return { src, unoptimized: false };
    }
    return { src, unoptimized: true };
  } catch {
    return { src, unoptimized: true };
  }
}

/** Aceita `Date` ou string ISO após serialização; evita `.toISOString` em não-Date. */
export function coerceBlogPostDate(
  value: Date | string | null | undefined
): Date | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
