/**
 * Hosts permitidos para proxy de imagens (admin + portal público). Evita SSRF.
 * Amplie com ADMIN_IMAGE_PROXY_HOSTS no .env (separados por vírgula).
 */
const BASE_ALLOWED = [
  "res.cloudinary.com",
  "picsum.photos",
  "images.unsplash.com",
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
];

export function isAllowedImageProxyHost(hostname: string): boolean {
  if (BASE_ALLOWED.includes(hostname)) return true;
  if (hostname.endsWith(".cloudinary.com")) return true;
  const extra =
    process.env.ADMIN_IMAGE_PROXY_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean) ??
    [];
  return extra.includes(hostname);
}
