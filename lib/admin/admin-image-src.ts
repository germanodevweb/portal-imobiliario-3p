/**
 * URLs de preview no admin: mesmo pipeline que o portal (next/image + remotePatterns),
 * com fallback para o proxy só quando o host não está na allowlist do Next.
 */

const NEXT_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
  "images.unsplash.com",
  "picsum.photos",
]);

export function adminImageSrc(url: string): string {
  if (!url?.trim()) return url;
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return url;
    if (NEXT_IMAGE_HOSTS.has(u.hostname)) return url;
  } catch {
    return url;
  }
  return `/api/admin/property-image?url=${encodeURIComponent(url)}`;
}
