/**
 * Validação de imagens de imóveis.
 * Separado do cloudinary.ts para uso no client sem importar o SDK.
 */

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;

export function validatePropertyImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return "Formatos aceitos: JPG, JPEG, PNG";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Tamanho máximo: 5MB";
  }
  return null;
}
