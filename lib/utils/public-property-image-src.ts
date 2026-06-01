/**
 * URLs no portal público: hosts na allowlist passam direto, exceto fotos legadas Code49
 * (/admin/imovel/*), que hoje devolvem login — usam proxy same-origin.
 */
import { isLegacyCode49PropertyImageUrl } from "@/lib/property/legacy-image-url";
const NEXT_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
  "images.unsplash.com",
  "picsum.photos",
]);

function isDirectRemoteHost(hostname: string): boolean {
  if (NEXT_IMAGE_HOSTS.has(hostname)) return true;
  if (hostname.endsWith(".cloudinary.com")) return true;
  return false;
}

export function publicPropertyImageSrc(url: string): string {
  if (!url?.trim()) return url;
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return url;
    if (isLegacyCode49PropertyImageUrl(url)) {
      return `/api/public/property-image?url=${encodeURIComponent(url)}`;
    }
    if (isDirectRemoteHost(u.hostname)) return url;
  } catch {
    return url;
  }
  return `/api/public/property-image?url=${encodeURIComponent(url)}`;
}
