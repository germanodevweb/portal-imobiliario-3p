import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

const CLOUDINARY_UPLOAD_REGEX =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i;

function stripUrlQueryAndHash(u: string): string {
  const noHash = u.split("#")[0] ?? u;
  return noHash.split("?")[0] ?? noHash;
}

/** Remove cadeias de transformação até versão ou public_id. */
export function stripCloudinaryTransformations(pathAfterUpload: string): string {
  const parts = pathAfterUpload.split("/");
  while (parts.length > 0) {
    const seg = parts[0];
    if (/^v\d+$/.test(seg)) break;
    const looksLikeTransform =
      seg.includes(",") ||
      /^(f_|q_|w_|c_|l_|g_|o_|b_|h_|dpr_|ar_|fl_|e_)/i.test(seg);
    if (looksLikeTransform && /^[\w.,_:+-]+$/i.test(seg)) {
      parts.shift();
      continue;
    }
    break;
  }
  return parts.join("/");
}

export function isCloudinaryResUploadUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.hostname.toLowerCase() !== "res.cloudinary.com") return false;
    return parsed.pathname.toLowerCase().includes("/image/upload/");
  } catch {
    return false;
  }
}

function ensureHttps(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

/**
 * Uma única URL de entrega Cloudinary (sem srcset do next/image).
 * `transformSegment` = parâmetros antes do public_id (ex.: w_640,c_limit,f_auto,q_auto).
 */
export function buildCloudinaryDeliveryUrl(
  url: string,
  transformSegment: string
): string {
  const normalized = normalizePublicImageUrl(url.trim());
  if (!normalized) return url;

  const pathOnly = stripUrlQueryAndHash(normalized);
  if (!isCloudinaryResUploadUrl(pathOnly)) {
    return normalized;
  }

  const match = pathOnly.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) {
    return normalized;
  }

  const bareAssetPath = stripCloudinaryTransformations(match[1]);
  const uploadPrefix = pathOnly.replace(/\/upload\/.+$/, "/upload");
  const tx = transformSegment.replace(/\/+$/, "");
  return ensureHttps(`${uploadPrefix}/${tx}/${bareAssetPath}`);
}
