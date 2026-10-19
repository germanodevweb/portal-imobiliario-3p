import { GoogleGenAI } from "@google/genai";
import {
  FOLDER_NEARBY_ICON_IDS,
  type FolderNearbyIconId,
  type FolderNearbyPoint,
} from "@/lib/folder/types";

const GEMINI_MODEL_PRIMARY = "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACK = "gemini-3-flash-preview";
const LOCATION_MAX = 320;

export type SuggestFolderLocationInput = {
  description: string;
  neighborhood: string;
  city: string;
};

export type FolderAiPrefillResult = {
  locationText: string;
  nearbyPoints: FolderNearbyPoint[];
};

function trimLocation(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= LOCATION_MAX) return t;
  const slice = t.slice(0, LOCATION_MAX);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 120 ? slice.slice(0, lastSpace) : slice).trimEnd();
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

function extractJsonFromMarkdown(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return raw.trim();
}

function isNearbyIcon(v: string): v is FolderNearbyIconId {
  return (FOLDER_NEARBY_ICON_IDS as readonly string[]).includes(v);
}

function parseNearbyPoints(raw: unknown): FolderNearbyPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: FolderNearbyPoint[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const iconId = "iconId" in item ? item.iconId : null;
    const label = "label" in item ? item.label : null;
    if (typeof iconId !== "string" || !isNearbyIcon(iconId)) continue;
    if (typeof label !== "string" || !label.trim()) continue;
    out.push({ iconId, label: label.trim().slice(0, 28) });
    if (out.length >= 6) break;
  }
  return out;
}

async function tryGeminiPrefill(
  input: SuggestFolderLocationInput
): Promise<FolderAiPrefillResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const iconList = FOLDER_NEARBY_ICON_IDS.join(", ");
  const plainDesc = input.description
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const userPrompt = `Você prepara textos para folder imobiliário (admin), em português do Brasil.

Retorne APENAS JSON válido:
{
  "locationText": "2 ou 3 frases sobre localização (máx. ${LOCATION_MAX} caracteres). Destaque o bairro em contexto natural. Sem inventar rua ou número.",
  "nearbyPoints": [
    { "iconId": "<id>", "label": "legenda curta" }
  ]
}

Regras:
- nearbyPoints: 0 a 6 itens; iconId DEVE ser um destes: ${iconList}
- Baseie-se na descrição; se não houver dados, devolva nearbyPoints: [] e locationText genérico honesto.
- Sem emojis.

Bairro: ${input.neighborhood || "(não informado)"}
Cidade: ${input.city || "(não informada)"}
Descrição:
${plainDesc.slice(0, 5000) || "(sem descrição)"}`;

  const ai = new GoogleGenAI({ apiKey });
  for (const model of [GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK]) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: { temperature: 0.5, responseMimeType: "application/json" },
      });
      const raw = extractTextFromGenerateContentResponse(res);
      if (!raw.trim()) continue;
      const data = JSON.parse(extractJsonFromMarkdown(raw)) as Record<
        string,
        unknown
      >;
      const locationText =
        typeof data.locationText === "string"
          ? trimLocation(data.locationText)
          : "";
      const nearbyPoints = parseNearbyPoints(data.nearbyPoints);
      if (locationText.length >= 20) {
        return { locationText, nearbyPoints };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function suggestFolderAiPrefill(
  input: SuggestFolderLocationInput
): Promise<FolderAiPrefillResult> {
  try {
    const gemini = await tryGeminiPrefill(input);
    if (gemini) return gemini;
  } catch {
    /* fallback vazio */
  }
  return { locationText: "", nearbyPoints: [] };
}

export async function suggestFolderLocationText(
  input: SuggestFolderLocationInput
): Promise<string> {
  const prefill = await suggestFolderAiPrefill(input);
  return prefill.locationText;
}
