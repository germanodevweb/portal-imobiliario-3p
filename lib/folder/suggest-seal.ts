export type SuggestSealInput = {
  isLaunch: boolean;
  isOpportunity: boolean;
  isFeatured: boolean;
};

/** Prioridade: oportunidade → lançamento → destaque → pronto. */
export function suggestFolderSealBannerText(input: SuggestSealInput): string {
  if (input.isOpportunity) return "SUPER OPORTUNIDADE";
  if (input.isLaunch) return "GRANDE LANÇAMENTO";
  if (input.isFeatured) return "IMÓVEL EM DESTAQUE";
  return "PRONTO PARA MORAR";
}
