/**
 * Loader customizado do next/image:
 * - Cloudinary: entrega direta com w_{width}, c_limit (sem proxy /_next/image na Vercel).
 *   Largura é sempre um segmento NOVO logo após `/upload/`, antes de marca d'água ou public_id.
 *   A URL `src` já deve incluir f_auto, q_auto e marca d'água (getWatermarkedImageUrl).
 * - Demais hosts: fallback ao otimizador padrão do Next (/_next/image).
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

function buildDefaultNextImageOptimizerUrl(
  src: string,
  width: number,
  quality: number
): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export default function cloudinaryImageLoader({
  src,
  width,
  quality,
}: LoaderParams): string {
  const q = quality ?? 75;

  if (src.startsWith("/") && !src.startsWith("//")) {
    return buildDefaultNextImageOptimizerUrl(src, width, q);
  }

  try {
    const parsed = new URL(src);
    if (parsed.hostname.toLowerCase() === "res.cloudinary.com") {
      return buildCloudinaryImageLoaderUrl(src, width);
    }
  } catch {
    /* fallback */
  }

  return buildDefaultNextImageOptimizerUrl(src, width, q);
}
