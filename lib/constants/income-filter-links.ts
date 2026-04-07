/**
 * Links de filtro por faixa de renda (preço compatível — regras Caixa / MCMV atualizadas).
 * `renda` diferencia faixas com o mesmo teto (ex.: 3,2k e 5k → até R$ 275 mil).
 * Manter alinhado a `RENDA_PRESETS` / `getRendaPreset` em app/imoveis/page.tsx.
 */
export const INCOME_FILTER_LINKS = [
  { label: "Renda até R$ 3.200", href: "/imoveis?precoMax=275000&renda=3200" },
  { label: "Renda até R$ 5.000", href: "/imoveis?precoMax=275000&renda=5000" },
  { label: "Renda até R$ 9.600", href: "/imoveis?precoMax=400000&renda=9600" },
  { label: "Renda até R$ 13.000", href: "/imoveis?precoMax=600000&renda=13000" },
] as const;
