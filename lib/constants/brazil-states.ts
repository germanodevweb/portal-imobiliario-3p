/**
 * UFs brasileiras — exibição no admin (nome oficial + sigla).
 * Valor enviado no formulário: nome completo do estado (ex.: "Ceará").
 */

export const DEFAULT_PROPERTY_COUNTRY = "Brasil" as const;

export const BRAZIL_STATE_OPTIONS = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
] as const;

export const OTHER_STATE_VALUE = "__OTHER_STATE__" as const;

export type BrazilStateOption = (typeof BRAZIL_STATE_OPTIONS)[number];

/** Resolve valor salvo no banco (nome, UF ou texto livre) para o select + campo manual. */
export function resolveStateFormState(stateFromDb: string): {
  selectValue: string;
  customState: string;
} {
  const trimmed = stateFromDb.trim();
  if (!trimmed) {
    return { selectValue: "", customState: "" };
  }
  const byName = BRAZIL_STATE_OPTIONS.find((o) => o.name === trimmed);
  if (byName) return { selectValue: byName.name, customState: "" };
  const byUf = BRAZIL_STATE_OPTIONS.find(
    (o) => o.uf.toLowerCase() === trimmed.toLowerCase()
  );
  if (byUf) return { selectValue: byUf.name, customState: "" };
  return { selectValue: OTHER_STATE_VALUE, customState: trimmed };
}
