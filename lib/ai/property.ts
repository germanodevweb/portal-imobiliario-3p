/**
 * Serviço de IA para geração de conteúdo de imóveis.
 * Integração Google Gemini (@google/genai) com fallback para mock local.
 *
 * A IA apenas sugere conteúdo. O usuário revisa e salva manualmente.
 */

import { GoogleGenAI } from "@google/genai";

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

/** Ordem de tentativa: documentação atual Gemini API (Developer). */
const GEMINI_MODEL_PRIMARY = "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACK = "gemini-3-flash-preview";
const TITLE_MAX_LEN = 70;

/**
 * Logs de diagnóstico (sem chave completa):
 * - development: ativo por omissão; desligue com GEMINI_DIAG=0
 * - production: só com GEMINI_DIAG=1
 */
function diag(
  message: string,
  meta?: Record<string, string | number | boolean | undefined>
) {
  const prod = process.env.NODE_ENV === "production";
  const enabled = prod
    ? process.env.GEMINI_DIAG === "1"
    : process.env.GEMINI_DIAG !== "0";
  if (!enabled) return;
  const safe = meta
    ? Object.fromEntries(
        Object.entries(meta).map(([k, v]) => [
          k,
          v === undefined ? "(undefined)" : v,
        ])
      )
    : undefined;
  console.log(`[property-ai] ${message}`, safe ?? "");
}

function maskKeyInfo(apiKey: string): { length: number; suffix: string } {
  const t = apiKey.trim();
  return {
    length: t.length,
    suffix: t.length > 4 ? `…${t.slice(-4)}` : "(curta)",
  };
}

function isModelNotFound(e: unknown): boolean {
  const status =
    typeof e === "object" && e !== null && "status" in e
      ? Number((e as { status?: number }).status)
      : NaN;
  const msg = e instanceof Error ? e.message : String(e);
  return (
    status === 404 ||
    /404|not\s+found|NOT_FOUND|model.*not found/i.test(msg)
  );
}

/**
 * Gera sugestão de título e descrição a partir de um prompt do usuário.
 * Usa Gemini quando `GEMINI_API_KEY` está definida; caso contrário (ou em falha), usa mock.
 */
export async function generatePropertyContent(
  options: GeneratePropertyContentOptions
): Promise<GeneratePropertyContentResult> {
  const keyPresent = Boolean(process.env.GEMINI_API_KEY?.trim());
  diag("generatePropertyContent: início", {
    hasGeminiKey: keyPresent,
    ...(keyPresent
      ? maskKeyInfo(process.env.GEMINI_API_KEY!.trim())
      : { length: 0, suffix: "(sem chave)" }),
    promptLen: options.prompt.length,
    hasType: Boolean(options.context?.type),
    hasCity: Boolean(options.context?.city),
  });

  const gemini = await tryGenerateWithGemini(options);
  if (gemini) {
    diag("chamada bem-sucedida (Gemini)", {
      titleLen: gemini.title.length,
      descLen: gemini.description.length,
    });
    return gemini;
  }
  diag("caiu no fallback MOCK (chave ausente, modelos indisponíveis, erro de API ou JSON inválido)");
  return generatePropertyContentMock(options);
}

// ---------------------------------------------------------------------------
// Gemini (@google/genai)
// ---------------------------------------------------------------------------

function buildGeminiUserPrompt(options: GeneratePropertyContentOptions): string {
  const { prompt, context } = options;
  const type = context?.type ?? "";
  const city = context?.city ?? "";
  const bedrooms =
    context?.bedrooms != null && context.bedrooms >= 0
      ? String(context.bedrooms)
      : "";
  const price =
    context?.price != null &&
    typeof context.price === "number" &&
    !Number.isNaN(context.price) &&
    context.price > 0
      ? `R$ ${context.price.toLocaleString("pt-BR")}`
      : "";

  return `Você é um especialista em marketing imobiliário e SEO local no Brasil.

Seu objetivo é gerar:
1. Um título altamente atrativo e otimizado para mecanismos de busca
2. Uma descrição profissional, escaneável e estruturada

REGRAS:

TÍTULO:
- Máximo 60–70 caracteres
- Incluir tipo do imóvel + localização + diferencial
- Linguagem natural e comercial
- Evitar termos genéricos

DESCRIÇÃO:
- Escrever em português do Brasil
- Entre 500 e 900 palavras (quando houver conteúdo suficiente nas observações; se o usuário enviou pouco texto, expanda com base no contexto de forma honesta, sem inventar dados concretos inexistentes)
- Estrutura obrigatória com estes títulos:
  Sobre o imóvel
  Localização
  Infraestrutura
  Diferenciais
  Potencial de investimento (quando aplicável)
  Situação legal
  Valor
- NÃO usar Markdown: proibido usar #, ##, **, * e listas markdown com "-" ou "*"
- Formatar a descrição como HTML simples e seguro, usando somente estas tags:
  <h2>, <p>, <ul>, <li>, <strong>

- Usar parágrafos curtos
- Usar listas quando fizer sentido
- Incluir termos de busca locais naturalmente (cidade, região quando fizer sentido)
- Não repetir frases genéricas
- Não usar linguagem robótica

ENTRADA DO USUÁRIO:
Tipo: ${type || "(não informado)"}
Cidade: ${city || "(não informada)"}
Quartos: ${bedrooms || "(não informado)"}
Preço: ${price || "(não informado)"}
Descrição base: ${prompt.trim() || "(nenhuma — infira apenas a partir do contexto acima, de forma conservadora)"}

SAÍDA (OBRIGATÓRIA EM JSON, sem markdown à volta do JSON):

{
  "title": "...",
  "description": "..."
}

O campo "description" deve ser HTML limpo e compatível com editor, sem Markdown cru.`;
}

async function tryGenerateWithGemini(
  options: GeneratePropertyContentOptions
): Promise<GeneratePropertyContentResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    diag("GEMINI_API_KEY ausente no processo do servidor");
    return null;
  }

  diag("iniciando chamada Gemini (SDK @google/genai)", {
    ...maskKeyInfo(apiKey),
    modelPrimary: GEMINI_MODEL_PRIMARY,
    modelFallback: GEMINI_MODEL_FALLBACK,
  });

  const ai = new GoogleGenAI({ apiKey });
  const textPrompt = buildGeminiUserPrompt(options);

  const runModel = async (
    modelId: string
  ): Promise<GeneratePropertyContentResult | null> => {
    diag("tentando modelo", { model: modelId });
    const raw = await generateContentJsonString(ai, modelId, textPrompt);
    diag("resposta recebida", {
      model: modelId,
      rawChars: raw.length,
      rawPreview: raw.slice(0, 120).replace(/\s+/g, " "),
    });
    const parsed = parseGeminiJsonResponse(raw);
    if (!parsed) {
      diag("parse JSON falhou — cai no MOCK", { model: modelId });
      return null;
    }
    diag("modelo aplicado com sucesso", { model: modelId });
    return {
      title: clampTitle(parsed.title),
      description: normalizeDescriptionForEditor(parsed.description),
    };
  };

  try {
    const out = await runModel(GEMINI_MODEL_PRIMARY);
    if (out) return out;
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    diag("erro no modelo primário", { message: msg.slice(0, 300) });
    if (!isModelNotFound(e)) {
      console.error("[property-ai] Gemini:", e);
      return null;
    }
    diag("404 no modelo primário — tentando fallback", {
      fallback: GEMINI_MODEL_FALLBACK,
    });
    try {
      const out = await runModel(GEMINI_MODEL_FALLBACK);
      return out;
    } catch (e2) {
      diag("erro no modelo fallback", {
        message: (e2 instanceof Error ? e2.message : String(e2)).slice(0, 300),
      });
      console.error("[property-ai] Gemini (fallback):", e2);
      return null;
    }
  }
}

async function generateContentJsonString(
  ai: GoogleGenAI,
  modelId: string,
  textPrompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: textPrompt,
    config: {
      temperature: 0.65,
      responseMimeType: "application/json",
    },
  });

  const raw =
    typeof response.text === "string"
      ? response.text
      : (response as { text?: () => string }).text?.();
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Resposta vazia do modelo");
  }
  return raw;
}

function parseGeminiJsonResponse(raw: string): {
  title: string;
  description: string;
} | null {
  const cleaned = extractJsonFromMarkdown(raw);
  try {
    const data = JSON.parse(cleaned) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    const title = o.title;
    const description = o.description;
    if (typeof title !== "string" || typeof description !== "string") {
      return null;
    }
    const t = title.trim();
    const desc = description.trim();
    if (!t || !desc) return null;
    return { title: t, description: desc };
  } catch {
    return null;
  }
}

function extractJsonFromMarkdown(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) return fence[1].trim();
  return trimmed;
}

function clampTitle(title: string): string {
  if (title.length <= TITLE_MAX_LEN) return title;
  return `${title.slice(0, TITLE_MAX_LEN - 3).trimEnd()}...`;
}

const ALLOWED_HTML_TAGS = new Set(["h2", "p", "ul", "li", "strong"]);
const SECTION_TITLES = [
  "Sobre o imóvel",
  "Localização",
  "Infraestrutura",
  "Diferenciais",
  "Potencial de investimento",
  "Situação legal",
  "Valor",
] as const;

function normalizeDescriptionForEditor(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return "";

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(cleaned);
  if (hasHtml) {
    return sanitizeAllowedHtml(cleaned);
  }

  return markdownLikeToSafeHtml(cleaned);
}

function sanitizeAllowedHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  return withoutScripts.replace(
    /<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi,
    (full, tagName: string) => {
      const tag = tagName.toLowerCase();
      const isClosing = full.startsWith("</");
      if (!ALLOWED_HTML_TAGS.has(tag)) return "";
      return isClosing ? `</${tag}>` : `<${tag}>`;
    }
  );
}

function markdownLikeToSafeHtml(text: string): string {
  const lines = text.split(/\r?\n/);
  const chunks: string[] = [];
  let listItems: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const p = paragraphBuffer.join(" ").trim();
    if (p) chunks.push(`<p>${formatInlineText(p)}</p>`);
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems.map((item) => `<li>${formatInlineText(item)}</li>`).join("");
    chunks.push(`<ul>${items}</ul>`);
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const markdownHeading = line.match(/^#{1,6}\s*(.+)$/);
    const plainSection = findSectionTitle(line);
    if (markdownHeading || plainSection) {
      flushParagraph();
      flushList();
      const heading = plainSection ?? markdownHeading![1]!.trim();
      chunks.push(`<h2>${escapeHtml(heading)}</h2>`);
      continue;
    }

    const bullet =
      line.match(/^[-*]\s+(.+)$/) ?? line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1]!.trim());
      continue;
    }

    if (listItems.length > 0) {
      flushList();
    }
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return sanitizeAllowedHtml(chunks.join(""));
}

function findSectionTitle(line: string): string | null {
  const normalized = line.replace(/:$/, "").trim().toLowerCase();
  for (const section of SECTION_TITLES) {
    if (normalized === section.toLowerCase()) return section;
  }
  return null;
}

function formatInlineText(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Mock (fallback — mesmo comportamento lógico anterior)
// ---------------------------------------------------------------------------

async function generatePropertyContentMock(
  options: GeneratePropertyContentOptions
): Promise<GeneratePropertyContentResult> {
  const { prompt, context } = options;

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
    LOTE: "Lote",
    FAZENDA: "Fazenda",
    COMERCIAL: "Imóvel comercial",
    STUDIO: "Studio",
  };
  return map[type] ?? type;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 3).trim()}...`;
}

function simulateLatency(): Promise<void> {
  return new Promise((r) => setTimeout(r, 800));
}
