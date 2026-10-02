/**
 * Loader opt-in para next/image em fotos Cloudinary (imóveis).
 * Não usar como loader global — imagens locais dependem do otimizador padrão /_next/image.
 */
type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

const UPLOAD_MARKER = "/upload/";

/**
 * Insere `w_{width},c_limit/` imediatamente após `/upload/`, sem mesclar com transformações existentes.
 * Com `fl_relative` na marca, o overlay escala sobre a imagem já limitada em largura.
 */
export function buildCloudinaryImageLoaderUrl(src: string, width: number): string {
  const uploadIdx = src.indexOf(UPLOAD_MARKER);
  if (uploadIdx === -1) return src;

  const widthTx = `w_${width},c_limit`;
  const prefix = src.slice(0, uploadIdx + UPLOAD_MARKER.length);
  const pathAfterUpload = src.slice(uploadIdx + UPLOAD_MARKER.length);
  return `${prefix}${widthTx}/${pathAfterUpload}`;
}

/** URL entregue pelo next/image em res.cloudinary.com (com ou sem marca d'água). */
export function isCloudinaryImageUrl(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return false;
  try {
    const normalized = src.startsWith("//") ? `https:${src}` : src;
    const parsed = new URL(normalized);
    return parsed.hostname.toLowerCase() === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function cloudinaryImageLoader({ src, width }: LoaderParams): string {
  return buildCloudinaryImageLoaderUrl(src, width);
}

/** Props do next/image: loader só quando `src` é Cloudinary. */
export function cloudinaryImageLoaderProps(src: string): {
  loader?: typeof cloudinaryImageLoader;
} {
  return isCloudinaryImageUrl(src) ? { loader: cloudinaryImageLoader } : {};
}
