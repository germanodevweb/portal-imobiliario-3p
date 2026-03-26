/**
 * Geração de texto alternativo (alt) para imagens de imóveis.
 * Padrão: {tipo} à venda em {bairro} {cidade} – {ambiente}
 *
 * Usado para SEO e acessibilidade no portal público.
 * Nunca retorna apenas o ambiente (ex: "banheiro") — exige tipo e cidade.
 */

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  COBERTURA: "Cobertura",
  TERRENO: "Terreno",
  COMERCIAL: "Imóvel comercial",
  STUDIO: "Studio",
};

function getTypeLabel(type: string): string {
  const key = type.trim().toUpperCase();
  if (!key) return "";
  return PROPERTY_TYPE_LABELS[key] ?? key.charAt(0) + key.slice(1).toLowerCase();
}

/** "na" para feminino (termina em a), "no" para masculino */
function getPreposition(place: string): "na" | "no" {
  const last = place.trim().slice(-1).toLowerCase();
  return last === "a" ? "na" : "no";
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
 * - Apartamento à venda na Parquelândia em Fortaleza – banheiro
 * - Casa à venda no Eusébio – fachada (bairro = cidade)
 * - Apartamento à venda em Fortaleza – varanda (sem bairro)
 *
 * Nunca retorna apenas o ambiente. Exige tipo e cidade preenchidos.
 */
export function generateFeaturedImageAlt(params: GenerateImageAltParams): string {
  const { type, neighborhood, city, environment, transactionType = "SALE" } = params;
  const env = environment.trim();
  if (!env) return "";

  const typeLabel = getTypeLabel(type);
  const n = neighborhood.trim();
  const c = city.trim();

  /** Nunca retornar apenas o ambiente — fraco para SEO */
  if (!typeLabel || !c) return "";

  const txLabel = transactionType === "RENT" ? "para alugar" : "à venda";
  const envLower = env.toLowerCase();

  if (n && c) {
    if (n.toLowerCase() === c.toLowerCase()) {
      const prep = getPreposition(n);
      return `${typeLabel} ${txLabel} ${prep} ${n} – ${envLower}`;
    }
    const prep = getPreposition(n);
    return `${typeLabel} ${txLabel} ${prep} ${n} em ${c} – ${envLower}`;
  }

  return `${typeLabel} ${txLabel} em ${c} – ${envLower}`;
}
