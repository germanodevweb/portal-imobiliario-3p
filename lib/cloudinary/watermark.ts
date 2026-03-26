/**
 * Marca d'água via transformação do Cloudinary.
 *
 * O portal público usa URLs com marca d'água.
 * O admin usa URLs originais (sem marca).
 *
 * Variável de ambiente:
 * - CLOUDINARY_WATERMARK_PUBLIC_ID (ex: 3p/logo) — public_id da logo no Cloudinary
 *
 * A logo deve ser enviada manualmente ao Cloudinary como PNG com fundo transparente.
 */

const CLOUDINARY_UPLOAD_REGEX = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/;

const DEFAULT_WATERMARK_ID = "3p/logo";

/**
 * Retorna a URL da imagem com marca d'água aplicada.
 * Se a URL não for do Cloudinary, retorna a URL original.
 */
export function getWatermarkedImageUrl(url: string): string {
  if (!url?.startsWith("https://res.cloudinary.com/")) {
    return url;
  }

  const publicId = process.env.CLOUDINARY_WATERMARK_PUBLIC_ID ?? DEFAULT_WATERMARK_ID;
  const overlayId = publicId.replace(/\//g, ":");

  const transformation = [
    `l_${overlayId}`,
    "o_35",
    "c_scale",
    "w_0.25",
    "g_center",
    "fl_layer_apply",
  ].join(",");

  const match = url.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) return url;

  const pathAfterUpload = match[1];
  const baseUrl = url.replace(/\/upload\/.+$/, "/upload");
  return `${baseUrl}/${transformation}/${pathAfterUpload}`;
}
