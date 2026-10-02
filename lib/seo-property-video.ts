/**
 * SEO de páginas de exibição de vídeo (/imoveis/[slug]/video) — funções puras.
 */

import { collapseWhitespace } from "@/lib/utils/collapse-whitespace";
import { htmlToPlainText } from "@/lib/utils/html-to-plain-text";
import {
  getPropertyTypeSingular,
  TITLE_BRAND_SUFFIX,
  type PropertyMetaTitleInput,
} from "@/lib/seo-meta";
import { buildCanonicalUrl } from "@/lib/seo";
import { formatPropertyAreaDisplay } from "@/lib/utils/property-area";
import {
  type CacheableDate,
  toIsoStringFromCacheableDate,
} from "@/lib/utils/cacheable-date";

const AREA_TYPE_SLUGS = new Set(["terreno", "lote", "fazenda"]);

function bedroomSegment(bedrooms: number, propertyTypeSlug: string): string {
  if (propertyTypeSlug === "studio") return "studio";
  if (bedrooms <= 0) return "";
  const n = bedrooms >= 4 ? "4+" : String(bedrooms);
  return `${n} quarto${bedrooms === 1 ? "" : "s"}`;
}

function areaSegment(input: PropertyMetaTitleInput): string {
  const display = formatPropertyAreaDisplay(input);
  if (!display.hasArea) return "";
  const compact = display.compact.replace(/m²/g, " m²");
  return compact.includes("m²") ? compact : `${compact} m²`;
}

function pickFirstFittingVideoTitle(candidates: string[]): string {
  const META_TITLE_MAX_LEN = 60;
  for (const core of candidates) {
    const full = `${core}${TITLE_BRAND_SUFFIX}`;
    if (full.length <= META_TITLE_MAX_LEN) return full;
  }
  const last = candidates[candidates.length - 1] ?? "Vídeo";
  const maxCore = META_TITLE_MAX_LEN - TITLE_BRAND_SUFFIX.length;
  let trimmed = last;
  while (trimmed.length > maxCore && trimmed.includes(" ")) {
    trimmed = trimmed.replace(/\s+\S+$/, "").trim();
  }
  if (trimmed.length > maxCore) trimmed = trimmed.slice(0, maxCore).trim();
  return `${trimmed}${TITLE_BRAND_SUFFIX}`;
}

/** Title meta: "Vídeo: {Tipo} {N} quartos em {Bairro}, {Cidade} | 3Pinheiros" */
export function buildPropertyVideoWatchPageTitle(
  input: PropertyMetaTitleInput
): string {
  const tipo = getPropertyTypeSingular(input.propertyTypeSlug);
  const useArea = AREA_TYPE_SLUGS.has(input.propertyTypeSlug);
  const spec = useArea ? areaSegment(input) : bedroomSegment(input.bedrooms, input.propertyTypeSlug);
  const specPart = spec ? ` ${spec}` : "";
  const bairro = input.neighborhood?.trim();
  const cidade = input.city.trim();

  const candidates: string[] = [];
  if (bairro && cidade) {
    candidates.push(`Vídeo: ${tipo}${specPart} em ${bairro}, ${cidade}`);
  }
  if (cidade) {
    candidates.push(`Vídeo: ${tipo}${specPart} em ${cidade}`);
  }
  candidates.push(`Vídeo: ${tipo}${specPart}`);

  return pickFirstFittingVideoTitle(candidates);
}

export function buildPropertyVideoWatchPagePath(slug: string): string {
  return `/imoveis/${slug}/video`;
}

export function buildPropertyVideoWatchCanonical(slug: string): string {
  return buildCanonicalUrl(buildPropertyVideoWatchPagePath(slug));
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export type PropertyVideoSeoFields = {
  youtubeVideoId: string;
  youtubeTitle: string | null;
  youtubeDescription: string | null;
  youtubePublishedAt: CacheableDate | null;
  youtubeDurationIso: string | null;
  propertyTitle: string;
  propertyDescription: string | null;
};

export type ResolvedPropertyVideoSeo = {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDateIso: string | null;
  durationIso: string | null;
  embedUrl: string;
  contentUrl: string;
};

/**
 * Nome, descrição, URLs e datas para JSON-LD, Open Graph e video sitemap.
 * `uploadDate` usa exclusivamente a publicação no YouTube (nunca a do imóvel).
 */
export function resolvePropertyVideoSeo(
  fields: PropertyVideoSeoFields,
  thumbnailUrl: string
): ResolvedPropertyVideoSeo {
  const embedUrl = buildYouTubeEmbedUrl(fields.youtubeVideoId);
  const contentUrl = buildYouTubeWatchUrl(fields.youtubeVideoId);

  const fallbackDesc = collapseWhitespace(
    htmlToPlainText(fields.propertyDescription ?? fields.propertyTitle, 500)
  );

  const name =
    fields.youtubeTitle?.trim() ||
    `Tour em vídeo — ${fields.propertyTitle}`;

  const description =
    collapseWhitespace(fields.youtubeDescription ?? "") ||
    fallbackDesc ||
    `Tour em vídeo do imóvel ${fields.propertyTitle}.`;

  const uploadDateIso = toIsoStringFromCacheableDate(
    fields.youtubePublishedAt
  );

  const durationIso = fields.youtubeDurationIso?.trim() || null;

  return {
    name,
    description,
    thumbnailUrl,
    uploadDateIso,
    durationIso,
    embedUrl,
    contentUrl,
  };
}

export function buildPropertyVideoObjectJsonLd(
  pageUrl: string,
  seo: ResolvedPropertyVideoSeo
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: seo.name,
    description: seo.description,
    thumbnailUrl: seo.thumbnailUrl,
    ...(seo.uploadDateIso ? { uploadDate: seo.uploadDateIso } : {}),
    ...(seo.durationIso ? { duration: seo.durationIso } : {}),
    embedUrl: seo.embedUrl,
    contentUrl: seo.contentUrl,
    url: pageUrl,
  };
}

/** Texto curto na página de exibição (até ~2 parágrafos). */
export function buildPropertyVideoWatchPagePlainDescription(
  propertyDescription: string | null,
  maxChars = 520
): string {
  const plain = htmlToPlainText(propertyDescription ?? "", maxChars * 2);
  const collapsed = collapseWhitespace(plain);
  if (collapsed.length <= maxChars) return collapsed;

  const slice = collapsed.slice(0, maxChars);
  const lastPeriod = slice.lastIndexOf(". ");
  if (lastPeriod > maxChars * 0.5) {
    return slice.slice(0, lastPeriod + 1).trim();
  }
  return `${slice.trimEnd()}…`;
}
