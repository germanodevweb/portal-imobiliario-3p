/**
 * Geração de texto alternativo (alt) para imagens de imóveis.
 * Padrão: [Ambiente] do/da [tipo] à venda no/na [Bairro] em [Cidade]
 *
 * Usado para SEO local e Google Imagens. Não inclui marca, CTA ou marketing.
 */

export const MAX_PROPERTY_IMAGE_ALT_LENGTH = 120;

/** Tipos em linguagem natural (minúsculas), conforme padrão editorial SEO. */
const PROPERTY_TYPE_ALT_LABELS: Record<string, string> = {
  CASA: "casa",
  APARTAMENTO: "apartamento",
  COBERTURA: "cobertura",
  TERRENO: "terreno",
  LOTE: "lote",
  FAZENDA: "fazenda",
  COMERCIAL: "sala comercial",
  STUDIO: "studio",
};

const FEMININE_TYPE_LABELS = new Set(["casa", "cobertura", "fazenda", "sala comercial"]);

const ENVIRONMENT_INFERENCE: { pattern: RegExp; environment: string }[] = [
  { pattern: /\bfachada\b/i, environment: "fachada" },
  { pattern: /\bsala\b/i, environment: "sala" },
  { pattern: /\bcozinha\b/i, environment: "cozinha" },
  { pattern: /\bquarto\b/i, environment: "quarto" },
  { pattern: /\bsu[ií]te\b/i, environment: "suíte" },
  { pattern: /\bvaranda\b/i, environment: "varanda" },
  { pattern: /\bpiscina\b/i, environment: "piscina" },
  { pattern: /\b[aá]rea de lazer\b/i, environment: "área de lazer" },
  { pattern: /\bbanheiro\b/i, environment: "banheiro" },
  { pattern: /\brooftop\b/i, environment: "rooftop" },
  { pattern: /\bgaragem\b/i, environment: "garagem" },
  { pattern: /\blavabo\b/i, environment: "lavabo" },
  { pattern: /\bcorredor\b/i, environment: "corredor" },
];

function getTypeAltLabel(type: string): string {
  const key = type.trim().toUpperCase();
  if (!key) return "";
  return PROPERTY_TYPE_ALT_LABELS[key] ?? key.toLowerCase();
}

function getTypeArticle(typeLabel: string): "do" | "da" {
  return FEMININE_TYPE_LABELS.has(typeLabel) ? "da" : "do";
}

/** "na" para feminino (termina em a), "no" para masculino */
function getPlacePreposition(place: string): "na" | "no" {
  const last = place.trim().slice(-1).toLowerCase();
  return last === "a" ? "na" : "no";
}

function capitalizeEnvironment(environment: string): string {
  const trimmed = environment.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function truncateAlt(text: string, max = MAX_PROPERTY_IMAGE_ALT_LENGTH): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max * 0.6) {
    return cut.slice(0, lastSpace);
  }
  return cut;
}

export type GenerateImageAltParams = {
  type: string;
  neighborhood: string;
  city: string;
  environment: string;
  /** Opcional: "SALE" = à venda, "RENT" = para alugar */
  transactionType?: "SALE" | "RENT";
};

/**
 * Gera o alt sugerido para imagens de imóveis (principal e galeria).
 *
 * Exemplos:
 * - Sala do apartamento à venda na Aldeota em Fortaleza
 * - Fachada da casa à venda no Eusébio em Eusébio
 * - Piscina do apartamento à venda no Meireles em Fortaleza
 *
 * Exige ambiente, tipo e cidade. Retorna "" se faltar algum dado essencial.
 */
export function generateFeaturedImageAlt(params: GenerateImageAltParams): string {
  const { type, neighborhood, city, environment, transactionType = "SALE" } = params;
  const envLabel = capitalizeEnvironment(environment);
  if (!envLabel) return "";

  const typeLabel = getTypeAltLabel(type);
  const c = city.trim();
  if (!typeLabel || !c) return "";

  const txLabel = transactionType === "RENT" ? "para alugar" : "à venda";
  const article = getTypeArticle(typeLabel);
  const n = neighborhood.trim();

  let locationPart: string;
  if (n) {
    const prep = getPlacePreposition(n);
    locationPart = `${prep} ${n} em ${c}`;
  } else {
    locationPart = `em ${c}`;
  }

  const alt = `${envLabel} ${article} ${typeLabel} ${txLabel} ${locationPart}`;
  return truncateAlt(alt);
}

/**
 * Preserva alt personalizado existente; gera automaticamente apenas quando vazio.
 */
export function resolvePropertyImageAlt(
  existingAlt: string | null | undefined,
  params: GenerateImageAltParams
): string {
  const trimmed = existingAlt?.trim();
  if (trimmed) {
    return truncateAlt(trimmed);
  }
  return generateFeaturedImageAlt(params);
}

/** Infere ambiente a partir de legenda ou texto livre (importação / backfill). */
export function inferEnvironmentFromText(text: string): string | null {
  const source = text.trim();
  if (!source) return null;
  for (const { pattern, environment } of ENVIRONMENT_INFERENCE) {
    if (pattern.test(source)) return environment;
  }
  return null;
}

export type PropertyImageAltContext = {
  type: string;
  neighborhood: string | null;
  city: string;
  transactionType?: "SALE" | "RENT";
};

type ImageWithOptionalAlt = {
  alt: string | null;
  environment: string | null;
};

/** Preenche alt ausente no save/import sem sobrescrever alt personalizado. */
export function fillMissingImageAlts<T extends ImageWithOptionalAlt>(
  images: T[],
  context: PropertyImageAltContext
): T[] {
  return images.map((img) => {
    if (img.alt?.trim()) return img;
    const environment = img.environment?.trim();
    if (!environment) return img;

    const alt = generateFeaturedImageAlt({
      type: context.type,
      neighborhood: context.neighborhood ?? "",
      city: context.city,
      environment,
      transactionType: context.transactionType ?? "SALE",
    });

    if (!alt) return img;
    return { ...img, alt };
  });
}
