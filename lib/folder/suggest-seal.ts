import type { FolderSealPreset } from "@/lib/folder/types";

export type SuggestSealInput = {
  isLaunch: boolean;
  isOpportunity: boolean;
  isFeatured: boolean;
};

/** Prioridade: oportunidade → lançamento → destaque → pronto. */
export function suggestFolderSeal(input: SuggestSealInput): FolderSealPreset {
  if (input.isOpportunity) return "oportunidade";
  if (input.isLaunch) return "lancamento";
  if (input.isFeatured) return "destaque";
  return "pronto";
}

export const FOLDER_SEAL_LINES: Record<
  FolderSealPreset,
  { line1: string; line2: string }
> = {
  pronto: { line1: "Pronto para", line2: "Morar!" },
  lancamento: { line1: "Grande", line2: "Lançamento!" },
  oportunidade: { line1: "Super", line2: "Oportunidade!" },
  destaque: { line1: "Imóvel", line2: "em Destaque!" },
  planta: { line1: "100%", line2: "Na Planta!" },
};
