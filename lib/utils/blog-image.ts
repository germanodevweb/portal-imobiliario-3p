import {
  buildCloudinaryDeliveryUrl,
  isCloudinaryResUploadUrl,
} from "@/lib/cloudinary/delivery-url";
import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

/**
 * Hostnames permitidos para o otimizador do `next/image` (imagens locais / allowlist).
 * Manter alinhado a `next.config.js` → `images.remotePatterns`.
 */
const ALLOWED_REMOTE_IMAGE_HOSTNAMES = new Set([
  "images.unsplash.com",
  "picsum.photos",
  "res.cloudinary.com",
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
]);

const BLOG_CLOUDINARY_WIDTH = {
  card: 640,
  hero: 1200,
} as const;

export type BlogCoverContext = keyof typeof BLOG_CLOUDINARY_WIDTH;

/**
 * Capa do blog: URL fixa no Cloudinary (sem srcset); demais hosts seguem regras do next/image.
 */
export function getBlogCoverImageProps(
  rawSrc: string,
  context: BlogCoverContext = "card"
): {
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
    if (isCloudinaryResUploadUrl(src)) {
      const w = BLOG_CLOUDINARY_WIDTH[context];
      return {
        src: buildCloudinaryDeliveryUrl(
          src,
          `w_${w},c_limit,f_auto,q_auto`
        ),
        unoptimized: true,
      };
    }
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
