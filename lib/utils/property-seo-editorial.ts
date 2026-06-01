/**
 * Utilitários de apoio editorial SEO no admin de imóveis (avisos visuais, sem bloqueio).
 */

export type TitleSeoStatus = "weak" | "good" | "long";

export type DescriptionSeoStatus = "short" | "adequate";

const TITLE_SEO_MIN = 35;
const TITLE_SEO_MAX = 80;
const DESCRIPTION_SEO_MIN_WORDS = 250;

export function getTitleSeoStatus(charCount: number): TitleSeoStatus {
  if (charCount < TITLE_SEO_MIN) return "weak";
  if (charCount > TITLE_SEO_MAX) return "long";
  return "good";
}

export function getTitleSeoHint(charCount: number): {
  status: TitleSeoStatus;
  message: string;
} {
  const status = getTitleSeoStatus(charCount);
  if (status === "weak") {
    return {
      status,
      message: `Fraco para SEO (${charCount} caracteres — ideal: 35–80)`,
    };
  }
  if (status === "long") {
    return {
      status,
      message: `Longo para SEO (${charCount} caracteres — ideal: até 80)`,
    };
  }
  return {
    status,
    message: `Bom para SEO (${charCount} caracteres)`,
  };
}

/** Conta palavras em HTML ou texto plano (descrição do imóvel). */
export function countWordsInPropertyDescription(content: string): number {
  const withoutTags = content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  const words = withoutTags.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function getDescriptionSeoHint(wordCount: number): {
  status: DescriptionSeoStatus;
  message: string;
} {
  if (wordCount < DESCRIPTION_SEO_MIN_WORDS) {
    return {
      status: "short",
      message: `Descrição curta para SEO (${wordCount} palavras — ideal: 250+)`,
    };
  }
  return {
    status: "adequate",
    message: `Descrição adequada (${wordCount} palavras)`,
  };
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  COBERTURA: "Cobertura",
  TERRENO: "Terreno",
  LOTE: "Lote",
  FAZENDA: "Fazenda",
  COMERCIAL: "Imóvel comercial",
  STUDIO: "Studio",
};

export function formatPropertyTypeLabel(type: string | undefined): string | undefined {
  if (!type?.trim()) return undefined;
  return PROPERTY_TYPE_LABELS[type.trim()] ?? type.trim();
}
