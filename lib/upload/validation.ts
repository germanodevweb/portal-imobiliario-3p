/**
 * Validação de imagens de imóveis.
 * Separado do cloudinary.ts para uso no client sem importar o SDK.
 */

/** Máximo por ficheiro — usar o mesmo valor na UI (PropertyImageGallery). */
export const PROPERTY_IMAGE_MAX_SIZE_MB = 8;
export const PROPERTY_IMAGE_MAX_SIZE_BYTES = PROPERTY_IMAGE_MAX_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;

export function validatePropertyImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return "Formatos aceitos: JPG, JPEG, PNG";
  }
  if (file.size > PROPERTY_IMAGE_MAX_SIZE_BYTES) {
    return `Tamanho máximo: ${PROPERTY_IMAGE_MAX_SIZE_MB}MB`;
  }
  return null;
}
