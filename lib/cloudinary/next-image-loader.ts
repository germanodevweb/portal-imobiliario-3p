/**
 * Loader customizado do next/image:
 * - Cloudinary: entrega direta com w_{width}, c_limit (sem proxy /_next/image na Vercel).
 *   A URL `src` já deve incluir f_auto, q_auto e marca d'água (getWatermarkedImageUrl).
 * - Demais hosts: fallback ao otimizador padrão do Next (/_next/image).
 */
type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

const CLOUDINARY_UPLOAD_PATH =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i;

function appendWidthToCloudinaryUploadPath(pathAfterUpload: string, width: number): string {
  const widthTx = `w_${width},c_limit`;
  const slashIdx = pathAfterUpload.indexOf("/");
  if (slashIdx === -1) {
    if (pathAfterUpload.includes("_")) {
      return `${pathAfterUpload},${widthTx}`;
    }
    return `${widthTx}/${pathAfterUpload}`;
  }

  const firstSegment = pathAfterUpload.slice(0, slashIdx);
  const rest = pathAfterUpload.slice(slashIdx + 1);

  if (firstSegment.includes("_")) {
    return `${firstSegment},${widthTx}/${rest}`;
  }

  return `${widthTx}/${pathAfterUpload}`;
}

function buildCloudinaryLoaderUrl(src: string, width: number): string {
  const marker = "/upload/";
  const uploadIdx = src.indexOf(marker);
  if (uploadIdx === -1) return src;

  const prefix = src.slice(0, uploadIdx + marker.length);
  const pathAfterUpload = src.slice(uploadIdx + marker.length);
  return prefix + appendWidthToCloudinaryUploadPath(pathAfterUpload, width);
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
      return buildCloudinaryLoaderUrl(src, width);
    }
  } catch {
    /* fallback */
  }

  return buildDefaultNextImageOptimizerUrl(src, width, q);
}
