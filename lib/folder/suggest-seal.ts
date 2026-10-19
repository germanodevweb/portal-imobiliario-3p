import type { FolderSealPreset } from "@/lib/folder/types";
import { normalizeEnvironmentText } from "@/lib/folder/normalize-environment";

export type SuggestSealInput = {
  isLaunch: boolean;
  isOpportunity: boolean;
  isFeatured: boolean;
  title: string;
  description: string;
};

function textSuggestsNaPlanta(title: string, description: string): boolean {
  const blob = normalizeEnvironmentText(`${title} ${description}`);
  return (
    blob.includes("na planta") ||
    blob.includes("pre-lancamento") ||
    blob.includes("pre lancamento") ||
    blob.includes("em construcao")
  );
}

/** Prioridade: oportunidade → lançamento → destaque → na planta (texto) → pronto. */
export function suggestFolderSeal(input: SuggestSealInput): FolderSealPreset {
  if (input.isOpportunity) return "oportunidade";
  if (input.isLaunch) return "lancamento";
  if (input.isFeatured) return "pronto";
  if (textSuggestsNaPlanta(input.title, input.description)) return "planta";
  return "pronto";
}

export const FOLDER_SEAL_LINES: Record<
  FolderSealPreset,
  { line1: string; line2: string }
> = {
  pronto: { line1: "Pronto para", line2: "Morar!" },
  lancamento: { line1: "Grande", line2: "Lançamento!" },
  oportunidade: { line1: "Super", line2: "Oportunidade!" },
  planta: { line1: "100%", line2: "Na Planta!" },
};
