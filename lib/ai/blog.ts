/**
 * Serviço de IA para geração de conteúdo do Blog.
 * Integração Google Gemini (@google/genai) com fallback para mock local.
 */

import { GoogleGenAI } from "@google/genai";

export type GenerateBlogContentResult = {
  title: string;
  metaDescription: string;
  content: string;
};

export type GenerateBlogContentOptions = {
  theme: string;
};

/**
 * Ordem: no free tier o 2.5-flash costuma ter cota baixa (ex.: 20 pedidos/dia por modelo);
 * o 3-flash-preview costuma ter quota separada — tentar primeiro reduz espera e falhas 429.
 * Sobrescreva com GEMINI_BLOG_MODEL_PRIMARY / GEMINI_BLOG_MODEL_FALLBACK no .env se quiser.
 */
const GEMINI_MODEL_PRIMARY =
  process.env.GEMINI_BLOG_MODEL_PRIMARY?.trim() || "gemini-3-flash-preview";
const GEMINI_MODEL_FALLBACK =
  process.env.GEMINI_BLOG_MODEL_FALLBACK?.trim() || "gemini-2.5-flash";

function diag(message: string, meta?: Record<string, unknown>) {
  const prod = process.env.NODE_ENV === "production";
  const enabled = prod ? process.env.GEMINI_DIAG === "1" : process.env.GEMINI_DIAG !== "0";
  if (!enabled) return;
  const safe = meta
    ? Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, v === undefined ? "(undefined)" : v]))
    : undefined;
  console.log(`[blog-ai] ${message}`, safe ?? "");
}

function maskKeyInfo(apiKey: string) {
  const t = apiKey.trim();
  return { length: t.length, suffix: t.length > 4 ? `…${t.slice(-4)}` : "(curta)" };
}

function extractJsonFromMarkdown(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) return fence[1].trim();
  return trimmed;
}

/** Rejeita respostas “válidas” porém inúteis (Gemini às vezes devolve strings vazias). */
function isValidBlogGeneration(r: GenerateBlogContentResult): boolean {
  const textLen = r.content.replace(/<[^>]+>/g, "").trim().length;
  return (
    r.title.trim().length >= 5 &&
    r.metaDescription.trim().length >= 20 &&
    textLen >= 25
  );
}

export async function generateBlogContent(options: GenerateBlogContentOptions): Promise<GenerateBlogContentResult> {
  const keyPresent = Boolean(process.env.GEMINI_API_KEY?.trim());
  diag("generateBlogContent: início", {
    hasGeminiKey: keyPresent,
    ...(keyPresent ? maskKeyInfo(process.env.GEMINI_API_KEY!.trim()) : { length: 0, suffix: "(sem chave)" }),
    themeLen: options.theme.length,
  });

  const gemini = await tryGenerateWithGemini(options);
  if (gemini) {
    diag("chamada bem-sucedida (Gemini)", { titleLen: gemini.title.length, contentLen: gemini.content.length });
    return gemini;
  }
  diag("caiu no fallback MOCK");
  return generateBlogContentMock(options);
}

function buildGeminiUserPrompt(options: GenerateBlogContentOptions): string {
  return `Você é um especialista em marketing imobiliário e SEO (Copywriter Sênior).

Seu objetivo é gerar um artigo de blog completo baseado no tema fornecido pelo usuário.

REGRAS:

TÍTULO (title):
- Otimizado para SEO, focado na intenção de busca.
- Entre 50 e 60 caracteres.
- Altamente atrativo.

META DESCRIPTION (metaDescription):
- Resumo conciso para aparecer no Google.
- Entre 150 e 160 caracteres.
- Incluir chamada para ação (CTA) sutil.

CONTEÚDO (content):
- Escrever em português do Brasil.
- Conteúdo escaneável, direto e focado no mercado imobiliário/investimento.
- Entre 600 e 1200 palavras.
- Estrutura OBRIGATÓRIA (os H2 exatos não são obrigatórios, mas as seções lógicas devem existir na ordem abaixo):
  1. Sobre
  2. Localização (quando aplicável)
  3. Mercado
  4. Oportunidade
  5. CTA (Chamada para Ação para a 3 Pinheiros Consultoria)
- NÃO usar Markdown: proibido usar #, ##, **, * e listas markdown com "-" ou "*".
- Formatar a descrição APENAS com tags HTML seguras e limpas:
  <h2>, <p>, <ul>, <li>, <strong>
- Usar parágrafos curtos.
- Usar <h2> para os títulos das seções.
- Usar <ul> e <li> para listas de benefícios/dicas.

TEMA SOLICITADO PELO USUÁRIO:
"${options.theme.trim()}"

Se o tema for uma URL ou nome de site, infira o nicho (ex.: imobiliário, incorporação) e escreva um artigo útil para leitores — não use a URL crua como título nem encha o texto só com o link.

SAÍDA (OBRIGATÓRIA EM JSON, sem markdown cru à volta):
{
  "title": "...",
  "metaDescription": "...",
  "content": "..."
}`;
}

async function tryGenerateWithGemini(options: GenerateBlogContentOptions): Promise<GenerateBlogContentResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const textPrompt = buildGeminiUserPrompt(options);

  const runModel = async (modelId: string): Promise<GenerateBlogContentResult | null> => {
    diag("tentando modelo", { model: modelId });
    const raw = await generateContentJsonString(ai, modelId, textPrompt);
    const parsed = parseGeminiJsonResponse(raw);
    if (!parsed) {
      diag("parse JSON inválido ou campos vazios", { model: modelId });
      return null;
    }
    const out: GenerateBlogContentResult = {
      title: parsed.title.trim(),
      metaDescription: parsed.metaDescription.trim(),
      content: normalizeContentForEditor(parsed.content),
    };
    if (!isValidBlogGeneration(out)) {
      diag("resposta rejeitada (conteúdo curto ou vazio após normalizar)", {
        model: modelId,
      });
      return null;
    }
    return out;
  };

  const models = [GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK].filter(
    (m, i, a) => a.indexOf(m) === i
  );

  for (const modelId of models) {
    try {
      const out = await runModel(modelId);
      if (out) return out;
    } catch (e) {
      console.error(`[blog-ai] Gemini (${modelId}):`, e);
    }
  }
  return null;
}

type GenContentPart = { text?: string };
type GenContentResponseLike = {
  text?: string;
  candidates?: Array<{ content?: { parts?: GenContentPart[] } }>;
};

/** Junta texto do SDK (getter `.text`) ou, em fallback, das parts do 1.º candidate. */
function extractTextFromGenerateContentResponse(response: unknown): string {
  const r = response as GenContentResponseLike;
  const fromGetter = r.text;
  if (typeof fromGetter === "string" && fromGetter.trim()) {
    return fromGetter;
  }
  const parts = r.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .map((p) => (typeof p?.text === "string" ? p.text : ""))
      .join("");
    if (joined.trim()) return joined;
  }
  return "";
}

async function generateContentJsonString(ai: GoogleGenAI, modelId: string, textPrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: textPrompt,
    config: { temperature: 0.7, responseMimeType: "application/json" },
  });

  const raw = extractTextFromGenerateContentResponse(response);
  if (!raw.trim()) {
    throw new Error("Resposta vazia do modelo");
  }
  return raw;
}

function parseGeminiJsonResponse(raw: string): { title: string; metaDescription: string; content: string; } | null {
  const cleaned = extractJsonFromMarkdown(raw);
  try {
    const data = JSON.parse(cleaned) as Record<string, unknown>;
    if (!data || typeof data !== "object") return null;
    const title = data.title;
    const metaDescription = data.metaDescription;
    const content = data.content;
    if (
      typeof title !== "string" ||
      typeof metaDescription !== "string" ||
      typeof content !== "string"
    ) {
      return null;
    }
    const t = title.trim();
    const m = metaDescription.trim();
    const c = content.trim();
    if (!t || !m || !c) return null;
    return { title: t, metaDescription: m, content: c };
  } catch {
    return null;
  }
}

const ALLOWED_HTML_TAGS = new Set(["h2", "p", "ul", "li", "strong", "h3"]);

function normalizeContentForEditor(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return "";

  const withoutScripts = cleaned.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");

  return withoutScripts.replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (full, tagName: string) => {
    const tag = tagName.toLowerCase();
    const isClosing = full.startsWith("</");
    if (!ALLOWED_HTML_TAGS.has(tag)) return "";
    return isClosing ? `</${tag}>` : `<${tag}>`;
  });
}

async function generateBlogContentMock(options: GenerateBlogContentOptions): Promise<GenerateBlogContentResult> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    title: `Guia sobre: ${options.theme.slice(0, 40)}...`,
    metaDescription: `Aprenda tudo sobre ${options.theme.slice(0, 50)}. Um guia completo preparado pelos especialistas da 3 Pinheiros.`,
    content: `<h2>Sobre o Mercado</h2><p>Este é um conteúdo de exemplo gerado localmente porque a chave da API não está configurada.</p><h2>Oportunidade</h2><p>O tema escolhido foi: <strong>${options.theme}</strong>.</p>`,
  };
}
