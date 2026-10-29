/**
 * Marca d'água via transformação do Cloudinary (portal público).
 * Entrega fixa por contexto: `getPropertyImageDeliveryUrl` em property-image-delivery.ts.
 */

import { isLegacyCode49PropertyImageUrl } from "@/lib/property/legacy-image-url";
import {
  getPropertyImageDeliveryUrl,
  type PropertyImageDeliveryContext,
} from "@/lib/cloudinary/property-image-delivery";

/** @deprecated Use getPropertyImageDeliveryUrl(url, context). Mantido para imports legados. */
export function getWatermarkedImageUrl(
  url: string,
  _display?: unknown
): string {
  return getPropertyImageDeliveryUrl(url, "openGraph");
}

export function getWatermarkedImageUrlForContext(
  url: string,
  context: PropertyImageDeliveryContext
): string {
  return getPropertyImageDeliveryUrl(url, context);
}

/**
 * Fotos Cloudinary usam URL fixa (`unoptimized`); legado Code49 continua via proxy.
 */
export function shouldUseUnoptimizedNextImage(url: string): boolean {
  if (isLegacyCode49PropertyImageUrl(url)) return true;
  if (process.env.NODE_ENV === "development") return true;
  return true;
}
