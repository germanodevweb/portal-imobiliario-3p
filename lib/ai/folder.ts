import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL_PRIMARY = "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACK = "gemini-3-flash-preview";
const MAX_LEN = 160;

export type SuggestFolderLocationInput = {
  description: string;
  neighborhood: string;
  city: string;
};

function trimToMax(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= MAX_LEN) return t;
  const slice = t.slice(0, MAX_LEN);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trimEnd();
}

function mockLocation(input: SuggestFolderLocationInput): string {
  const bairro = input.neighborhood.trim();
  const cidade = input.city.trim();
  if (bairro && cidade) {
    return trimToMax(
      `Localizado no ${bairro}, em ${cidade}, com conveniência e infraestrutura ao redor.`
    );
  }
  if (bairro) {
    return trimToMax(
      `Localizado no ${bairro}, com fácil acesso a comércio, serviços e vias principais.`
    );
  }
  return trimToMax(
    "Localização privilegiada, com acesso rápido a serviços, comércio e principais vias."
  );
}

function extractTextFromGenerateContentResponse(response: unknown): string {
  if (
    typeof response === "object" &&
    response !== null &&
    "text" in response &&
    typeof (response as { text: unknown }).text === "string"
  ) {
    return (response as { text: string }).text;
  }
  return "";
}

async function tryGemini(input: SuggestFolderLocationInput): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const plainDesc = input.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const userPrompt = `Escreva UM único parágrafo em português do Brasil para folder imobiliário.
Máximo ${MAX_LEN} caracteres. Tom comercial, sem emojis, sem aspas.
Não invente endereço, número ou rua. Use apenas bairro/cidade informados e fatos da descrição.

Bairro: ${input.neighborhood || "(não informado)"}
Cidade: ${input.city || "(não informada)"}
Descrição do imóvel:
${plainDesc.slice(0, 4000) || "(sem descrição)"}`;

  const ai = new GoogleGenAI({ apiKey });
  const models = [GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK];

  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: userPrompt,
      });
      const text = extractTextFromGenerateContentResponse(res).trim();
      if (text.length >= 20) {
        return trimToMax(text);
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function suggestFolderLocationText(
  input: SuggestFolderLocationInput
): Promise<string> {
  const gemini = await tryGemini(input);
  if (gemini) return gemini;
  return mockLocation(input);
}
