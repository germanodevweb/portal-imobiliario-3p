import { buildCloudinaryDeliveryUrl } from "@/lib/cloudinary/delivery-url";
import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

/** Feeds Meta/Google: uma única transformação por foto (sem marca d'água). */
const FEED_DELIVERY_TRANSFORMATION = "f_auto,q_auto,w_1080,c_limit";

/**
 * URL de imagem para catálogos e feeds: original Cloudinary otimizada, sem overlay.
 * Políticas Meta e Google Merchant proíbem marca d'água em image_link.
 */
export function getFeedImageUrl(url: string): string {
  const normalized = normalizePublicImageUrl(url.trim());
  if (!normalized) return url;
  return buildCloudinaryDeliveryUrl(normalized, FEED_DELIVERY_TRANSFORMATION);
}
