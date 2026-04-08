/**
 * Opções de ambiente para imagens de imóveis.
 * Usado na galeria e no formulário.
 */

export const IMAGE_ENVIRONMENTS = [
  { value: "fachada", label: "Fachada" },
  { value: "sala", label: "Sala" },
  { value: "cozinha", label: "Cozinha" },
  { value: "quarto", label: "Quarto" },
  { value: "suíte", label: "Suíte" },
  { value: "banheiro", label: "Banheiro" },
  { value: "lavabo", label: "Lavabo" },
  { value: "varanda", label: "Varanda" },
  { value: "área de lazer", label: "Área de lazer" },
  { value: "piscina", label: "Piscina" },
  { value: "corredor", label: "Corredor" },
  { value: "elevador", label: "Elevador" },
  { value: "escritório", label: "Escritório" },
  { value: "dpe", label: "DPE" },
  { value: "fazenda", label: "Fazenda" },
  { value: "terreno", label: "Terreno" },
  { value: "lote", label: "Lote" },
  { value: "__OTHER__", label: "Outro" },
] as const;

export const OTHER_ENVIRONMENT_VALUE = "__OTHER__" as const;
