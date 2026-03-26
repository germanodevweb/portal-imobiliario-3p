/**
 * Cidades iniciais do Ceará — regiões de atuação do portal.
 * Estrutura simples, preparada para futura normalização em tabela City.
 */

export const CEARA_STATE = "CE" as const;

export const CEARA_CITIES = [
  "Fortaleza",
  "Caucaia",
  "Trairi",
  "Fortim",
  "Aquiraz",
  "Eusébio",
  "Maracanaú",
  "Pacatuba",
  "Itaitinga",
  "Horizonte",
  "São Gonçalo do Amarante",
] as const;

export const OTHER_CITY_VALUE = "__OTHER__" as const;

export type CearaCity = (typeof CEARA_CITIES)[number];
