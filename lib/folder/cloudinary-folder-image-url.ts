import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

const CLOUDINARY_UPLOAD_REGEX =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i;

function stripUrlQueryAndHash(u: string): string {
  const noHash = u.split("#")[0] ?? u;
  return noHash.split("?")[0] ?? noHash;
}

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

/** Recorte exato para molduras do folder, sem marca d'água. */
export function buildFolderCloudinaryImageUrl(
  url: string,
  width: number,
  height: number
): string {
  const normalized = normalizePublicImageUrl(url.trim());
  if (!normalized) return url;

  const pathOnly = stripUrlQueryAndHash(normalized);
  const match = pathOnly.match(CLOUDINARY_UPLOAD_REGEX);
  const transform = `c_fill,g_auto,w_${width},h_${height},f_jpg,q_auto`;

  if (!match) {
    return ensureHttps(pathOnly);
  }

  const bareAssetPath = stripCloudinaryTransformations(match[1]);
  const uploadPrefix = pathOnly.replace(/\/upload\/.+$/, "/upload");
  return ensureHttps(`${uploadPrefix}/${transform}/${bareAssetPath}`);
}
