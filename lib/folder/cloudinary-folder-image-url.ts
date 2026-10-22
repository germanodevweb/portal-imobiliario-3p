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
      /^(f_|q_|w_|c_|l_|g_|o_|b_|h_|dpr_|ar_|fl_|e_)/i.test(seg);
    if (looksLikeTransform && /^[\w.,_:+-]+$/i.test(seg)) {
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

function buildCloudinaryUrl(transform: string, url: string): string {
  const normalized = normalizePublicImageUrl(url.trim());
  if (!normalized) return url;

  const pathOnly = stripUrlQueryAndHash(normalized);
  const match = pathOnly.match(CLOUDINARY_UPLOAD_REGEX);

  if (!match) {
    return ensureHttps(pathOnly);
  }

  const bareAssetPath = stripCloudinaryTransformations(match[1]);
  const uploadPrefix = pathOnly.replace(/\/upload\/.+$/, "/upload");
  return ensureHttps(`${uploadPrefix}/${transform}/${bareAssetPath}`);
}

/** Fundo desfocado (mesma foto principal). */
export function buildFolderBlurredBackgroundUrl(
  url: string,
  width: number,
  height: number
): string {
  const transform = `c_fill,w_${width},h_${height},e_blur:1200,f_jpg,q_auto`;
  return buildCloudinaryUrl(transform, url);
}

export type FolderPhotoCropMode = "fill" | "fit";

/** Fundo desfocado dentro do slot (modo foto inteira). */
export function buildFolderSlotBlurredPhotoUrl(
  url: string,
  width: number,
  height: number
): string {
  const transform = `c_fill,w_${width},h_${height},e_blur:800,f_jpg,q_auto`;
  return buildCloudinaryUrl(transform, url);
}

/** Foto principal no slot do layout. */
export function buildFolderMainPhotoUrl(
  url: string,
  width: number,
  height: number,
  mode: FolderPhotoCropMode
): string {
  const crop = mode === "fit" ? "c_fit" : "c_fill,g_auto";
  const transform = `${crop},w_${width},h_${height},f_jpg,q_auto`;
  return buildCloudinaryUrl(transform, url);
}
