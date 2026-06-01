/**
 * Marca d'água via transformação do Cloudinary.
 *
 * O portal público aplica a logo (ex. 3 Pinheiros) no centro da imagem.
 * O admin usa URLs originais (sem marca).
 *
 * Variáveis de ambiente (mesmo `public_id` no Cloudinary, ex.: `3p/logo`):
 * - `NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID` — necessária para a galeria do imóvel
 *   (`PropertyGallery` é Client Component; só variáveis `NEXT_PUBLIC_*` existem no browser).
 * - `CLOUDINARY_WATERMARK_PUBLIC_ID` — usada no servidor (cards em RSC, feeds, OG).
 *
 * A pasta no `public_id` usa `:` na URL do overlay (ex.: `3p/logo` → `l_3p:logo`).
 * `fl_relative` junto de `w_0.xx` faz a largura ser relativa à imagem base (documentação Cloudinary).
 *
 * Ver `docs/cloudinary-watermark.md`.
 *
 * Diagnóstico temporário (dev): defina `NEXT_PUBLIC_WATERMARK_DEBUG=1` no `.env.local` e
 * reinicie o `pnpm dev`; o terminal e a consola do browser mostram `[watermark:DEBUG]`.
 * Remover a env e as chamadas a `watermarkDebugLog` quando já não precisar.
 */

import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";
import { isLegacyCode49PropertyImageUrl } from "@/lib/property/legacy-image-url";

const WM_DEBUG =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_WATERMARK_DEBUG === "1";

function watermarkDebugLog(payload: {
  step: string;
  hasPublicId: boolean;
  appliedOverlay: boolean;
  inSample: string;
  outSample: string;
}): void {
  if (!WM_DEBUG) return;
  // eslint-disable-next-line no-console -- opt-in dev only (NEXT_PUBLIC_WATERMARK_DEBUG)
  console.info("[watermark:DEBUG]", JSON.stringify(payload));
}

function sampleUrl(u: string, max: number): string {
  const t = u.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

/** Caminho após `/image/upload/` (versão, pasta, ficheiro). */
const CLOUDINARY_UPLOAD_REGEX =
  /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/i;

/** Detalhe / hero: marca um pouco mais visível. Cards e miniaturas: mais discreta. */
export type WatermarkDisplay = "default" | "compact";

function normalizeEnvPublicId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.length > 0 ? s : undefined;
}

/**
 * Public_id da logo no Media Library (mesmo valor em `docs/cloudinary-watermark.md`).
 * Usado quando as envs não estão definidas ou não entram no bundle do cliente — evita
 * retorno prematuro com URL original em URLs Cloudinary válidas.
 */
const DEFAULT_WATERMARK_LOGO_PUBLIC_ID = "3p/logo";

function resolveWatermarkPublicId(): string {
  const pub = normalizeEnvPublicId(process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID);
  const serverOnly = normalizeEnvPublicId(process.env.CLOUDINARY_WATERMARK_PUBLIC_ID);
  return pub ?? serverOnly ?? DEFAULT_WATERMARK_LOGO_PUBLIC_ID;
}

function isCloudinaryResUploadUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== "res.cloudinary.com") return false;
    return parsed.pathname.toLowerCase().includes("/image/upload/");
  } catch {
    return false;
  }
}

/** Remove `?` / `#` só para montar o path; URLs de entrega Cloudinary raramente precisam de query. */
function stripUrlQueryAndHash(u: string): string {
  const noHash = u.split("#")[0] ?? u;
  const noQuery = noHash.split("?")[0] ?? noHash;
  return noQuery;
}

/** Entrega otimizada (formato/qualidade) antes do overlay — compatível com next/image e CDN. */
const DELIVERY_AUTO = ["f_auto", "q_auto"] as const;

function buildOverlayTransformation(overlayId: string, display: WatermarkDisplay): string {
  const [opacity, width] =
    display === "compact" ? (["o_55", "w_0.22"] as const) : (["o_55", "w_0.25"] as const);
  return [
    ...DELIVERY_AUTO,
    `l_${overlayId}`,
    opacity,
    "c_scale",
    "fl_relative",
    width,
    "g_center",
    "fl_layer_apply",
  ].join(",");
}

/**
 * Retorna a URL da imagem com marca d'água aplicada.
 * Se a URL não for do Cloudinary `image/upload`, devolve a original (fallback seguro).
 */
export function getWatermarkedImageUrl(
  url: string,
  display: WatermarkDisplay = "default"
): string {
  const normalized = normalizePublicImageUrl(url.trim());
  if (!normalized) return url;

  const pathOnly = stripUrlQueryAndHash(normalized);
  if (!isCloudinaryResUploadUrl(pathOnly)) {
    watermarkDebugLog({
      step: "skip:not-cloudinary-upload",
      hasPublicId: true,
      appliedOverlay: false,
      inSample: sampleUrl(pathOnly, 140),
      outSample: sampleUrl(normalized, 140),
    });
    return normalized;
  }

  const publicId = resolveWatermarkPublicId();
  const overlayId = publicId.replace(/\//g, ":");
  const transformation = buildOverlayTransformation(overlayId, display);

  const match = pathOnly.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) {
    watermarkDebugLog({
      step: "skip:url-regex-no-match",
      hasPublicId: true,
      appliedOverlay: false,
      inSample: sampleUrl(pathOnly, 140),
      outSample: sampleUrl(normalized, 140),
    });
    return normalized;
  }

  const pathAfterUpload = match[1];
  const baseUrl = pathOnly.replace(/\/upload\/.+$/, "/upload");
  const transformed = `${baseUrl}/${transformation}/${pathAfterUpload}`;
  watermarkDebugLog({
    step: "ok:overlay-applied",
    hasPublicId: true,
    appliedOverlay: true,
    inSample: sampleUrl(pathOnly, 140),
    outSample: sampleUrl(transformed, 200),
  });
  return transformed;
}

/**
 * `next/image` otimiza no servidor; hosts legados (ex.: fotos em /admin/imovel/)
 * costumam falhar no fetch do otimizador (404). Cloudinary responde de forma previsível.
 * Em `pnpm dev`, o otimizador local costuma falhar com URLs Cloudinary longas (marca d'água);
 * produção na Vercel não tem esse problema — daí fotos OK em prod e quebradas no localhost.
 */
export function shouldUseUnoptimizedNextImage(url: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (isLegacyCode49PropertyImageUrl(url)) return true;
  const resolved = getWatermarkedImageUrl(url);
  const isCloudinary =
    resolved.startsWith("https://res.cloudinary.com/") ||
    resolved.startsWith("http://res.cloudinary.com/");
  return !isCloudinary;
}
