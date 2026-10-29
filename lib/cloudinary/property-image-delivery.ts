import { buildCloudinaryDeliveryUrl } from "@/lib/cloudinary/delivery-url";
import { resolveWatermarkPublicId } from "@/lib/cloudinary/watermark-internals";

/** Larguras fixas — uma transformação Cloudinary por contexto (sem srcset). */
export const PROPERTY_IMAGE_DELIVERY_WIDTH = {
  card: 640,
  galleryHero: 1280,
  galleryThumb: 256,
  lightbox: 1600,
  openGraph: 1200,
} as const;

export type PropertyImageDeliveryContext = keyof typeof PROPERTY_IMAGE_DELIVERY_WIDTH;

function buildWatermarkTransformSegment(width: number): string {
  const publicId = resolveWatermarkPublicId();
  const overlayId = publicId.replace(/\//g, ":");
  return [
    `w_${width}`,
    "c_limit",
    "f_auto",
    "q_auto",
    `l_${overlayId}`,
    "o_55",
    "c_scale",
    "fl_relative",
    "w_0.25",
    "g_center",
    "fl_layer_apply",
  ].join(",");
}

/**
 * URL final da foto de imóvel no portal (marca d'água + largura fixa).
 */
export function getPropertyImageDeliveryUrl(
  url: string,
  context: PropertyImageDeliveryContext
): string {
  const width = PROPERTY_IMAGE_DELIVERY_WIDTH[context];
  return buildCloudinaryDeliveryUrl(url, buildWatermarkTransformSegment(width));
}
