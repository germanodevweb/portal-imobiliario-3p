import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

/** Entrega para feeds (Meta / Google): sem marca d'água, mínimo 1080 px de largura. */
const FEED_DELIVERY_TRANSFORMATION = "f_auto,q_auto,w_1080,c_limit";

const CLOUDINARY_UPLOAD_REGEX =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i;

function stripUrlQueryAndHash(u: string): string {
  const noHash = u.split("#")[0] ?? u;
  const noQuery = noHash.split("?")[0] ?? noHash;
  return noQuery;
}

/** Remove cadeias de transformação (incl. overlay de marca) até versão ou public_id. */
function stripCloudinaryTransformations(pathAfterUpload: string): string {
  const parts = pathAfterUpload.split("/");
  while (parts.length > 0) {
    const seg = parts[0];
    if (/^v\d+$/.test(seg)) break;
    const looksLikeTransform =
      seg.includes(",") ||
      /^(f_|q_|w_|c_|l_|g_|o_|b_|h_|dpr_|ar_|fl_)/i.test(seg);
    if (looksLikeTransform && /^[\w.,_-]+$/i.test(seg)) {
      parts.shift();
      continue;
    }
    break;
  }
  return parts.join("/");
}

function ensureHttps(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

/**
 * URL de imagem para catálogos e feeds: original Cloudinary otimizada, sem overlay.
 * Políticas Meta e Google Merchant proíbem marca d'água em image_link.
 */
export function getFeedImageUrl(url: string): string {
  const normalized = normalizePublicImageUrl(url.trim());
  if (!normalized) return url;

  const pathOnly = stripUrlQueryAndHash(normalized);
  const match = pathOnly.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) {
    return ensureHttps(pathOnly);
  }

  const bareAssetPath = stripCloudinaryTransformations(match[1]);
  const uploadPrefix = pathOnly.replace(/\/upload\/.+$/, "/upload");
  return ensureHttps(
    `${uploadPrefix}/${FEED_DELIVERY_TRANSFORMATION}/${bareAssetPath}`
  );
}
