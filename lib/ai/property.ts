/**
 * Serviço de IA para geração de conteúdo de imóveis.
 * Desacoplado do formulário — preparado para integração com OpenAI, Anthropic, etc.
 *
 * A IA apenas sugere conteúdo. O usuário revisa e salva manualmente.
 */

export type GeneratePropertyContentResult = {
  title: string;
  description: string;
};

export type GeneratePropertyContentOptions = {
  prompt: string;
  /** Contexto opcional: tipo, cidade, quartos — melhora a qualidade da sugestão */
  context?: {
    type?: string;
    city?: string;
    bedrooms?: number;
    price?: number;
  };
};

/**
 * Gera sugestão de título e descrição a partir de um prompt do usuário.
 * Implementação mock atual — substituir por chamada real à API quando integrar.
 */
export async function generatePropertyContent(
  options: GeneratePropertyContentOptions
): Promise<GeneratePropertyContentResult> {
  const { prompt, context } = options;

  // Mock: gera sugestão baseada no prompt e contexto
  // Em produção: await openai.chat.completions.create({ ... })
  await simulateLatency();

  const typeLabel = context?.type
    ? formatTypeLabel(context.type)
    : "imóvel";
  const cityPart = context?.city ? ` em ${context.city}` : "";
  const roomsPart =
    context?.bedrooms != null && context.bedrooms > 0
      ? `, ${context.bedrooms} quartos`
      : "";
  const pricePart =
    context?.price != null && context.price > 0
      ? ` — R$ ${context.price.toLocaleString("pt-BR")}`
      : "";

  const baseTitle = `${typeLabel}${cityPart}${roomsPart}${pricePart}`.trim();
  const title = prompt.trim()
    ? `${baseTitle}: ${truncate(prompt, 60)}`
    : baseTitle || "Imóvel à venda";

  const priceDesc =
    context?.price != null && context.price > 0
      ? ` Valor: R$ ${context.price.toLocaleString("pt-BR")}.`
      : "";
  const description = prompt.trim()
    ? `Imóvel à venda${cityPart ? ` ${cityPart}` : ""}. ${prompt.trim()}\n\nEntre em contato para mais informações e agendamento de visita.`
    : `Excelente ${typeLabel}${cityPart}${roomsPart}.${priceDesc}\n\nEntre em contato para mais informações e agendamento de visita.`;

  return { title, description };
}

function formatTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CASA: "Casa",
    APARTAMENTO: "Apartamento",
    COBERTURA: "Cobertura",
    TERRENO: "Terreno",
    COMERCIAL: "Imóvel comercial",
    STUDIO: "Studio",
  };
  return map[type] ?? type;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3).trim() + "...";
}

function simulateLatency(): Promise<void> {
  return new Promise((r) => setTimeout(r, 800));
}
