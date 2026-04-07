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

const GEMINI_MODEL_PRIMARY = "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACK = "gemini-3-flash-preview";

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

function isModelNotFound(e: unknown): boolean {
  const status = typeof e === "object" && e !== null && "status" in e ? Number((e as { status?: number }).status) : NaN;
  const msg = e instanceof Error ? e.message : String(e);
  return status === 404 || /404|not\s+found|NOT_FOUND|model.*not found/i.test(msg);
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
    if (!parsed) return null;
    return {
      title: parsed.title.trim(),
      metaDescription: parsed.metaDescription.trim(),
      content: normalizeContentForEditor(parsed.content),
    };
  };

  try {
    const out = await runModel(GEMINI_MODEL_PRIMARY);
    if (out) return out;
    return null;
  } catch (e) {
    if (!isModelNotFound(e)) {
      console.error("[blog-ai] Gemini erro primário:", e);
      return null;
    }
    try {
      return await runModel(GEMINI_MODEL_FALLBACK);
    } catch (e2) {
      console.error("[blog-ai] Gemini erro fallback:", e2);
      return null;
    }
  }
}

async function generateContentJsonString(ai: GoogleGenAI, modelId: string, textPrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: textPrompt,
    config: { temperature: 0.7, responseMimeType: "application/json" },
  });
  const raw = typeof response.text === "string" ? response.text : (response as any).text?.();
  if (typeof raw !== "string" || !raw.trim()) throw new Error("Resposta vazia");
  return raw;
}

function parseGeminiJsonResponse(raw: string): { title: string; metaDescription: string; content: string; } | null {
  const cleaned = raw.trim().replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
  try {
    const data = JSON.parse(cleaned) as Record<string, unknown>;
    if (!data || typeof data.title !== "string" || typeof data.metaDescription !== "string" || typeof data.content !== "string") {
      return null;
    }
    return { title: data.title, metaDescription: data.metaDescription, content: data.content };
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
